import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: new Headers(),
  });

  // Check if user is authenticated and is admin
  if (!session?.user || session.user.role !== 'admin') {
    redirect('/login');
  }

  return (
    <DashboardLayout role="admin">
      {children}
    </DashboardLayout>
  );
}