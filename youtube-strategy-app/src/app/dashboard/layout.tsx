import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
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
  if (!session?.user?.id) redirect("/login");

  // Asegurar que el usuario existe en DB (primer login)
  const dbUser = await prisma.user.upsert({
    where: { id: session.user.id },
    update: { lastActive: new Date() },
    create: {
      id: session.user.id,
      email: session.user.email ?? "",
      name: session.user.name ?? null,
      image: session.user.image ?? null,
    },
  });

  // Asegurar que tiene al menos un canal activo
  const channelCount = await prisma.channel.count({
    where: { userId: dbUser.id },
  });
  if (channelCount === 0) {
    await prisma.channel.create({
      data: { userId: dbUser.id, status: "active" },
    });
  }

  // Progreso del roadmap desde DB
  const actionItems = await prisma.actionItem.findMany({
    where: {
      channel: { userId: dbUser.id },
    },
    select: { completedAt: true },
  });

  const roadmapProgress =
    actionItems.length > 0
      ? Math.round(
          (actionItems.filter((a) => a.completedAt !== null).length /
            actionItems.length) *
            100
        )
      : 0;

  const user: AppUser = {
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    image: dbUser.image,
    plan: (dbUser.plan as AppUser["plan"]) ?? "free",
    createdAt: dbUser.createdAt,
    lastActive: dbUser.lastActive,
  };

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      {/* Sidebar visible solo en desktop */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <Navbar user={user} roadmapProgress={roadmapProgress} />

      {/* Content: sin offset en mobile, con offset en desktop */}
      <div className="pt-16 lg:pl-60 min-h-screen">
        <div className="p-4 lg:p-8">{children}</div>
      </div>
    </div>
  );
}
