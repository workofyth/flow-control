import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's custom properties. */
      airflowUrl?: string
      username?: string
      password?: string
    } & DefaultSession["user"]
  }

  interface User {
    airflowUrl?: string
    username?: string
    password?: string
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    /** OpenID ID Token */
    airflowUrl?: string
    username?: string
    password?: string
  }
}
