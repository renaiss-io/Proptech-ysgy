import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";

export const { auth, handlers, signIn, signOut, unstable_update } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger, session }) {
      if (user?.id) token.id = user.id;
      if (trigger === "update" && session?.user?.role) {
        token.role = session.user.role;
        return token;
      }
      // Re-fetch role from DB until it's set (new users have role=null until /register/role)
      if (token.id && (token.role === undefined || token.role === null)) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true },
        });
        token.role = dbUser?.role ?? null;
      }
      return token;
    },
  },
});
