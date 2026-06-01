// NextAuth.js v5 — Configuración de autenticación
// Google OAuth + PrismaAdapter (sesiones en DB) + HttpOnly cookies

import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  // Con PrismaAdapter usamos sesiones en DB (más seguro que JWT puro)
  // Las cookies de sesión son HttpOnly automáticamente con NextAuth v5
  session: {
    maxAge: 60 * 60 * 24 * 7, // 7 días
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async session({ session, user }) {
      if (user?.id) {
        session.user.id = user.id;
      }
      return session;
    },
  },
});
