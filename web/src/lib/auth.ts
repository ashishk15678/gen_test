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
		},
		github: {
			clientId: env.GITHUB_CLIENT_ID || '',
			clientSecret: env.GITHUB_CLIENT_SECRET || ''
		}
	},
	emailAndPassword: {
		enabled: true,
		async sendResetPassword(url, user) {
			console.log('Reset password url:', url);
		}
	},
	trustedOrigins: [
		'https://evolving-martin-monthly.ngrok-free.app',
		'https://rabbit.ashishkr.com',
		'http://localhost:5173',
		'http://127.0.0.1:5173'
	],
	emailVerification: {
		sendOnSignUp: true
	},
	plugins: [sveltekitCookies(getRequestEvent)]
});
