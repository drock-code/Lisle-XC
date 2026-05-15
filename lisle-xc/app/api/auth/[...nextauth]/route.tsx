import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { isAdminAndLinkAccount } from "@/lib/admin-queries";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.id || !user.email) return false;
      
      return await isAdminAndLinkAccount(user.email, user.id);
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };