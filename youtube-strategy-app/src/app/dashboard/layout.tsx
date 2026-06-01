import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Navbar } from "@/components/dashboard/Navbar";
import { OnboardingModal } from "@/components/shared/OnboardingModal";
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

  // Verificar sesión válida (id viene del JWT callback)
  if (!session?.user?.id || !session.user.email) {
    redirect("/login");
  }

  // Upsert del usuario en DB (activo en cada visita)
  const dbUser = await prisma.user.upsert({
    where: { email: session.user.email },
    update: {
      id: session.user.id,
      name: session.user.name ?? undefined,
      image: session.user.image ?? undefined,
      lastActive: new Date(),
    },
    create: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name ?? null,
      image: session.user.image ?? null,
    },
  });

  // Asegurar canal activo para el usuario
  const channelCount = await prisma.channel.count({
    where: { userId: dbUser.id },
  });
  if (channelCount === 0) {
    await prisma.channel.create({
      data: { userId: dbUser.id, status: "active" },
    });
  }

  // Progreso del roadmap desde DB
  const [total, done] = await Promise.all([
    prisma.actionItem.count({ where: { channel: { userId: dbUser.id } } }),
    prisma.actionItem.count({ where: { channel: { userId: dbUser.id }, completedAt: { not: null } } }),
  ]);
  const roadmapProgress = total > 0 ? Math.round((done / total) * 100) : 0;

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
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)" }}>
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      <Navbar user={user} roadmapProgress={roadmapProgress} />
      <div className="pt-16 lg:pl-60 min-h-screen">
        <div className="p-4 lg:p-8">{children}</div>
      </div>
      <OnboardingModal />
    </div>
  );
}
