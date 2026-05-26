import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

const credsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function getAdminFromEnv() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return null;
  return { email, password };
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(rawCreds) {
        const parsed = credsSchema.safeParse(rawCreds);
        if (!parsed.success) return null;

        const envAdmin = getAdminFromEnv();
        if (!envAdmin) return null;

        if (
          parsed.data.email.toLowerCase() !== envAdmin.email.toLowerCase() ||
          parsed.data.password !== envAdmin.password
        ) {
          return null;
        }

        return { id: "admin", email: envAdmin.email, name: "Admin" };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
});

