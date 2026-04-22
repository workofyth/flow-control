import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getUsers } from "@/lib/users";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Standard Login",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "admin" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const users = getUsers();
        const user = users.find(
          (u) => u.username === credentials.username && u.password === credentials.password
        );

        if (user) {
          return {
            id: user.username,
            name: user.username,
            role: user.role,
            allowedDags: user.allowedDags,
          };
        }
        
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.allowedDags = (user as any).allowedDags;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).allowedDags = token.allowedDags;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
