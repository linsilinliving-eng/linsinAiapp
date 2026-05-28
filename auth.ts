import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import db from "@/lib/db";
import bcrypt from "bcryptjs";

const config = {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await db("users").where("email", credentials.email).first();

        if (user && await bcrypt.compare(credentials.password as string, user.password)) {
          return {
            id: user.id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            theme_color: user.theme_color || 'blue',
          };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }: any) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
        token.theme_color = (user as any).theme_color;
      }
      if (trigger === "update" && session?.theme_color) {
        token.theme_color = session.theme_color;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).theme_color = token.theme_color;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  trustHost: true,
};

export const { handlers, signIn, signOut, auth } = NextAuth(config);
