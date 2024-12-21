import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./server/prisma"  // Changed to relative path
import Discord from "next-auth/providers/discord"
import NextAuth from "next-auth"

export const { handlers, signIn, signOut, auth } = NextAuth({
	providers: [
		Discord({
			clientId: process.env.DISCORD_CLIENT_ID!,
			clientSecret: process.env.DISCORD_CLIENT_SECRET!,
		}),
	],
	adapter: PrismaAdapter(prisma),
})