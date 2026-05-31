import { redirect, fail } from '@sveltejs/kit';
import prisma from '$lib/prisma';
import { seedMockData } from '$lib/server/seeder';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/signin');
	}

	// Fetch database user details (to check autoReviewAll state)
	const dbUser = await prisma.user.findUnique({
		where: { id: locals.user.id }
	});

	// Fetch user's repositories
	const repositories = await prisma.repository.findMany({
		where: { userId: locals.user.id },
		include: {
			pullRequests: {
				include: {
					reviews: true
				}
			}
		},
		orderBy: { createdAt: 'desc' }
	});

	return {
		user: dbUser || locals.user,
		repositories
	};
};

export const actions: Actions = {
	addRepo: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		const formData = await request.formData();
		const name = formData.get('name') as string;
		let url = formData.get('url') as string;

		if (!name || !name.includes('/')) {
			return fail(400, { error: 'Invalid repository name. Format should be: owner/repo' });
		}

		if (!url) {
			url = `https://github.com/${name}`;
		}

		try {
			const repo = await prisma.repository.create({
				data: {
					name,
					url,
					userId: locals.user.id,
					isActive: true,
					pullRequests: {
						create: [
							{
								number: 1,
								title: 'feat: add configurations and build tooling',
								branch: 'main',
								status: 'open',
								reviews: {
									create: [
										{
											score: 92,
											status: 'completed',
											summary: `### Executive Summary
Initial repository configuration. Review checks files for linting, tsconfig settings, and package setup.

### Feedback
All files parsed correctly. Recommended enabling strict mode in \`tsconfig.json\` to avoid implicit \`any\` types.`
										}
									]
								}
							}
						]
					}
				}
			});
			return { success: true, repository: repo };
		} catch (e: any) {
			return fail(500, { error: e.message || 'Failed to add repository' });
		}
	},

	toggleRepo: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		const formData = await request.formData();
		const id = formData.get('id') as string;
		const isActive = formData.get('isActive') === 'true';

		try {
			await prisma.repository.update({
				where: { id, userId: locals.user.id },
				data: { isActive }
			});
			return { success: true };
		} catch (e: any) {
			return fail(500, { error: e.message || 'Failed to update repository' });
		}
	},

	toggleAccountAutoReview: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		const formData = await request.formData();
		const autoReviewAll = formData.get('autoReviewAll') === 'true';

		try {
			await prisma.user.update({
				where: { id: locals.user.id },
				data: { autoReviewAll }
			});
			return { success: true };
		} catch (e: any) {
			return fail(500, { error: e.message || 'Failed to update account setting' });
		}
	}
};
