// Canonical list of Gujarat districts plus helpers to normalise the many
// spellings that appear in source data and in the boundary GeoJSON.

export const GUJARAT_DISTRICTS = [
  "Ahmedabad", "Gandhinagar", "Mahesana", "Banaskantha", "Sabarkantha",
  "Aravalli", "Patan", "Rajkot", "Surat", "Vadodara", "Anand", "Amreli",
  "Kheda", "Kutch", "Bhavnagar", "Dahod", "Panchmahal", "Porbandar",
  "Gir Somnath", "Mahisagar", "Narmada", "Bharuch", "Jamnagar", "Navsari",
  "Valsad", "Junagadh", "Surendranagar", "Tapi", "Dang", "Devbhoomi Dwarka",
  "Morbi", "Botad", "Chhota Udepur", "Vav-Tharad",
] as const

export const TOTAL_DISTRICTS = GUJARAT_DISTRICTS.length

export const OUT_OF_STATE = "Out of State"

// Shared boundary file used by both the overview mini-map and the main map.
export const GUJARAT_GEOJSON_URL =
  "https://cdn.jsdelivr.net/gh/udit-001/india-maps-data@2884453/geojson/states/gujarat.geojson"

const ALIASES: Record<string, string> = {
  mehsana: "Mahesana",
  devbhumidwarka: "Devbhoomi Dwarka",
  dwarka: "Devbhoomi Dwarka",
  chhotaudaipur: "Chhota Udepur",
  chhotaudepur: "Chhota Udepur",
  dangs: "Dang",
  thedangs: "Dang",
  kachchh: "Kutch",
  kachch: "Kutch",
  panchmahals: "Panchmahal",
  arvalli: "Aravalli",
  aravali: "Aravalli",
  vavtharad: "Vav-Tharad",
  vadodra: "Vadodara",
  baroda: "Vadodara",
  outofgujarat: OUT_OF_STATE,
}

const CANONICAL = new Map<string, string>(
  [...GUJARAT_DISTRICTS, OUT_OF_STATE].map((d) => [key(d), d])
)

function key(name: string) {
  return name.toLowerCase().replace(/[^a-z]/g, "")
}

/** Map any known spelling of a district to its canonical name; unknown names pass through trimmed. */
export function normalizeDistrict(name: string | null | undefined): string {
  const trimmed = String(name ?? "").trim()
  if (!trimmed) return ""
  const k = key(trimmed)
  return CANONICAL.get(k) ?? ALIASES[k] ?? trimmed
}

const DISTRICT_SET = new Set<string>(GUJARAT_DISTRICTS)

export function isGujaratDistrict(name: string): boolean {
  return DISTRICT_SET.has(name)
}

let geojsonPromise: Promise<any> | null = null

/** Fetch the district boundary GeoJSON once per page load and share it between maps. */
export function loadGujaratGeojson(): Promise<any> {
  if (!geojsonPromise) {
    geojsonPromise = fetch(GUJARAT_GEOJSON_URL)
      .then((r) => {
        if (!r.ok) throw new Error(`GeoJSON fetch failed: ${r.status}`)
        return r.json()
      })
      .catch((err) => {
        geojsonPromise = null
        throw err
      })
  }
  return geojsonPromise
}

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!)
}
