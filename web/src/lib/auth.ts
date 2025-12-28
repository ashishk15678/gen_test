import { betterAuth } from 'better-auth';
import { env } from '$env/dynamic/private';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import prisma from './prisma';

export const auth = betterAuth({
	database: prismaAdapter(prisma, { provider: 'postgresql' }),
	socialProviders: {
		google: {
			clientId: env.GOOGLE_CLIENT_ID || '',
			clientSecret: env.GOOGLE_CLIENT_SECRET || ''
		}
	},
	emailAndPassword: {
		enabled: true,
		async sendResetPassword(url, user) {
			console.log('Reset password url:', url);
		}
	},
	emailVerification: {
		sendOnSignUp: true
	},
	plugins: [sveltekitCookies(getRequestEvent)]
});
