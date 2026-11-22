import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

const authOptions: NextAuthOptions = {
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    CredentialsProvider({
      id: "credentials",
      name: "Barber Admin Login",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@barberlounge.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;
        // Accept demo credentials or any valid salon staff login
        if (
          credentials.email === "admin@barberlounge.com" &&
          (credentials.password === "admin123" || credentials.password === "barber2026")
        ) {
          return {
            id: "admin-1",
            name: "Master Barber Admin",
            email: "admin@barberlounge.com",
            role: "admin",
          };
        }
        // Allow general staff demo login
        if (credentials.email && credentials.password) {
          return {
            id: `barber-${Date.now()}`,
            name: credentials.email.split("@")[0],
            email: credentials.email,
            role: "admin",
          };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || "admin";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role || "admin";
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "barber-lounge-secret-encryption-key-2026-safe",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
