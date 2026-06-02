import { TopMenu } from "@/components/layout/top-menu";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <TopMenu />
      <main className="flex-1 flex flex-col">{children}</main>
    </>
  );
}
