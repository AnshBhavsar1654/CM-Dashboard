import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="pl-60">
        <DashboardHeader />
        <main className="p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
