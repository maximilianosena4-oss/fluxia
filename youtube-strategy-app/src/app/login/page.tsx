// /login — Login con Google OAuth y animaciones Momentum UI
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { LoginCard } from "./LoginCard";

export const metadata: Metadata = { title: "Iniciar sesión" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const session = await auth();
  if (session) redirect("/dashboard");
  const { error } = await searchParams;
  return <LoginCard error={error} />;
}
