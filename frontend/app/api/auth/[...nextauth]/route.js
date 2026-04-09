import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { getApiBase } from "@/lib/config";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "").trim();
        const password = String(credentials?.password ?? "");
        if (!email || !password) return null;

        const res = await fetch(`${getApiBase()}/api/v1/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json().catch(() => null);
        if (!res.ok || !data?.token || !data?.user) return null;

        return {
          id: String(data.user.user_id ?? data.user.id ?? email),
          name: data.user.name ?? "",
          email: data.user.email ?? email,
          accessToken: data.token,
          backendUser: data.user,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === "google") {
        const email = String(profile?.email ?? "").toLowerCase();
        if (!email.endsWith("@iiitm.ac.in")) {
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account, profile }) {
      if (user?.accessToken) {
        token.accessToken = user.accessToken;
        token.id = user.id;
      }

      if (user?.backendUser) {
        token.backendUser = user.backendUser;
        token.id = user.backendUser.user_id ?? token.id;
      }

      if (account?.provider === "google" && profile?.email) {
        try {
          const res = await fetch(`${getApiBase()}/api/v1/auth/google-login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: profile.email,
              name: profile.name,
            }),
          });

          const data = await res.json().catch(() => null);

          if (res.ok && data?.token && data?.user) {
            token.accessToken = data.token;
            token.backendUser = data.user;
            token.id = data.user.user_id ?? data.user.id ?? token.id;
          }
        } catch (err) {
          console.error("Google backend login failed", err);
        }
      }

      if (account) {
        token.provider = account.provider;
      }
      if (profile) {
        token.id = token.id ?? profile.sub;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.user_id = token.backendUser?.user_id ?? token.id;
        session.user.name = token.backendUser?.name ?? session.user.name;
        session.user.email = token.backendUser?.email ?? session.user.email;
      }
      session.accessToken = token.accessToken;
      session.provider = token.provider;
      return session;
    },
    async redirect({ baseUrl }) {
      return `${baseUrl}/`;
    },
  },
  pages: {
    signIn: "/login",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
