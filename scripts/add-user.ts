import bcrypt from 'bcryptjs'
import { Pool } from 'pg'
import 'dotenv/config'
import readline from 'readline'

// Configure DB connection (expects DATABASE_URL in env, or falls back to discrete vars)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  host: process.env.DATABASE_URL ? undefined : process.env.PGHOST,
  port: process.env.DATABASE_URL ? undefined : (process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : undefined),
  database: process.env.DATABASE_URL ? undefined : process.env.PGDATABASE,
  user: process.env.DATABASE_URL ? undefined : process.env.PGUSER,
  password: process.env.DATABASE_URL ? undefined : process.env.PGPASSWORD,
  ssl: (process.env.PGSSL || 'true').toLowerCase() === 'true' ? { rejectUnauthorized: false } : undefined,
})

type Filter = '1m'|'3m'|'6m'|'1y'
const allowedFilters = new Set<Filter>(['1m','3m','6m','1y'])

async function addUser(email: string, plainPassword: string, name: string | null, designation: string | null, filter?: Filter) {
  const hashedPassword = await bcrypt.hash(plainPassword, 10)

  if (filter && allowedFilters.has(filter)) {
    await pool.query(
      `INSERT INTO public.users (email, password, name, designation, filter)
       VALUES ($1, $2, $3, $4, $5)`,
      [email, hashedPassword, name, designation, filter]
    )
  } else {
    await pool.query(
      `INSERT INTO public.users (email, password, name, designation)
       VALUES ($1, $2, $3, $4)`,
      [email, hashedPassword, name, designation]
    )
  }

  console.log(`✅ User ${email} added successfully`)
}

// ---- CLI handling ----
const [, , emailArg, passwordArg, nameArg, designationArg, filterArg] = process.argv

function createInterface() {
  return readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true })
}

async function prompt(question: string, mask = false): Promise<string> {
  if (!mask) {
    const rl = createInterface()
    return await new Promise<string>((resolve) => {
      rl.question(question, (answer) => { rl.close(); resolve(answer.trim()) })
    })
  }

  // Masked input using raw mode and manual echoing
  return await new Promise<string>((resolve) => {
    const stdin = process.stdin
    const stdout = process.stdout
    let input = ''
    stdout.write(question)
    stdin.setRawMode?.(true)
    stdin.resume()

    const onData = (char: Buffer) => {
      const ch = char.toString('utf8')
      if (ch === '\r' || ch === '\n') {
        stdout.write('\n')
        stdin.setRawMode?.(false)
        stdin.pause()
        stdin.removeListener('data', onData)
        resolve(input.trim())
        return
      }
      if (ch === '\u0003') { // Ctrl+C
        stdin.setRawMode?.(false)
        stdin.pause()
        stdin.removeListener('data', onData)
        process.exit(1)
        return
      }
      if (ch === '\u007F' || ch === '\b') { // Backspace/Delete
        if (input.length > 0) {
          input = input.slice(0, -1)
          readline.clearLine(stdout, 0)
          readline.cursorTo(stdout, 0)
          stdout.write(question + '*'.repeat(input.length))
        }
        return
      }
      input += ch
      stdout.write('*')
    }

    stdin.on('data', onData)
  })
}

async function main() {
  try {
    let email = emailArg
    let password = passwordArg
    let name = nameArg
    let designation = designationArg
    let filter = filterArg as Filter | undefined

    if (!email) email = await prompt('Email: ')
    if (!password) password = await prompt('Password: ', true)
    if (!name) name = await prompt('Name (optional): ')
    if (!designation) designation = await prompt('Designation (optional): ')
    if (!filter) {
      const f = await prompt('Default Filter [1m|3m|6m|1y] (optional, Enter to skip): ')
      filter = (allowedFilters.has(f as Filter) ? (f as Filter) : undefined)
    }

    if (!email || !password) {
      console.error('\n❌ Email and Password are required.')
      console.error('   Usage: npm run add-user -- <email> <password> [name] [designation] [filter]')
      process.exit(1)
    }

    await addUser(email, password, name || null, designation || null, filter)
    await pool.end()
    process.exit(0)
  } catch (err: any) {
    console.error('\n❌ Error adding user:', err?.message || err)
    await pool.end()
    process.exit(1)
  }
}

main()