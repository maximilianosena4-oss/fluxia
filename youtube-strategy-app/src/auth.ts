// NextAuth.js v5 — JWT puro (sin PrismaAdapter)
// El usuario se guarda en DB manualmente en el callback jwt()
// Sesión en cookie HttpOnly, firmada con AUTH_SECRET

import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/db/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7, // 7 días
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // Solo en el primer login (account existe)
      if (account?.provider === "google" && user?.email) {
        try {
          const dbUser = await prisma.user.upsert({
            where: { email: user.email },
            update: {
              name: user.name ?? undefined,
              image: user.image ?? undefined,
              lastActive: new Date(),
            },
            create: {
              email: user.email,
              name: user.name ?? null,
              image: user.image ?? null,
            },
          });
          token.userId = dbUser.id;
        } catch {
          // Si la DB no está disponible, usar el sub de Google como fallback
          token.userId = token.sub;
        }
      }
      return token;
    },
    session({ session, token }) {
      if (token.userId && session.user) {
        session.user.id = token.userId as string;
      }
      return session;
    },
  },
});
