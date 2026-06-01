// Extensión de tipos de NextAuth v5 para incluir user.id en la sesión

import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}
