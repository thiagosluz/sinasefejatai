import { PublicNavbar } from '@/components/portal/public-navbar'
import { PublicFooter } from '@/components/portal/public-footer'

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <PublicNavbar />
      <main className="flex-1 flex flex-col">{children}</main>
      <PublicFooter />
    </div>
  )
}
