import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Navbar } from "@/components/dashboard/Navbar";
import type { AppUser } from "@/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s | NEXUS" },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const user: AppUser = {
    id: session.user.id ?? "",
    email: session.user.email ?? "",
    name: session.user.name ?? null,
    image: session.user.image ?? null,
    plan: "free",
    createdAt: new Date(),
    lastActive: new Date(),
  };

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <Sidebar />
      <Navbar user={user} roadmapProgress={0} />

      {/* Main content — offset por sidebar (w-60) y navbar (h-16) */}
      <div className="pl-60 pt-16 min-h-screen">
        <div className="p-6 lg:p-8">{children}</div>
      </div>
    </div>
  );
}
