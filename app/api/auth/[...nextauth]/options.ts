import type { NextAuthOptions } from 'next-auth';
import Google from 'next-auth/providers/google';

export const runtime = 'edge';

export const options: NextAuthOptions = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.picture = (profile as any).picture ?? token.picture;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).image = (token as any).picture ?? (session.user as any).image;
      }
      return session;
    },
  },
};
