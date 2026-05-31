import { redirect, fail } from '@sveltejs/kit';
import prisma from '$lib/prisma';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.user) {
		throw redirect(302, '/signin');
	}

	const repository = await prisma.repository.findFirst({
		where: { id: params.id, userId: locals.user.id },
		include: {
			pullRequests: {
				include: {
					reviews: true
				},
				orderBy: { number: 'desc' }
			}
		}
	});

	if (!repository) {
		throw redirect(302, '/dashboard');
	}

	return {
		repository
	};
};

export const actions: Actions = {
	triggerMockWebhook: async ({ params, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		const repository = await prisma.repository.findFirst({
			where: { id: params.id, userId: locals.user.id }
		});

		if (!repository) {
			return fail(404, { error: 'Repository not found' });
		}

		const prCount = await prisma.pullRequest.count({
			where: { repositoryId: repository.id }
		});
		const prNumber = prCount + 1000 + 1;

		try {
			const pr = await prisma.pullRequest.create({
				data: {
					number: prNumber,
					title: `refactor: optimize database indexes and query speed in user lookup`,
					branch: `perf-db-indexes-${prNumber}`,
					status: 'open',
					repositoryId: repository.id,
					reviews: {
						create: [
							{
								score: 91,
								status: 'completed',
								summary: `### Executive Summary
The PR adds indexes to the user database table and updates key authentication lookup queries to utilize them.

### Changes
- **Database Schema**: Adds indices to the \`email\` and \`createdAt\` columns.
- **Query Refactor**: Optimizes authorization validation requests.

### AI Feedback
High performance improvement (+18% throughput expected). A slight issue found in case-sensitivity handling in indices on PostgreSQL.`,
								comments: {
									create: [
										{
											filePath: 'prisma/schema.prisma',
											lineNumber: 18,
											diffHunk: `@@ -17,2 +17,3 @@ model User {
   id            String    @id @default(cuid())
   email         String    @unique
+  createdAt     DateTime  @default(now())`,
											content: `💡 **Suggestion**: Since emails are queried heavily during login, ensure that queries are case-insensitive or use lower-case normalization. Adding an index works, but consider utilizing a functional index if your client doesn't enforce lowercase at schema insertion level.`,
											type: 'suggestion'
										}
									]
								}
							}
						]
					},
						chatMessages: {
							create: [
								{
									sender: 'ai',
									message: `🤖 **Rabbit AI Reviewer Initialized**

I have analyzed the diff of Pull Request **#${prNumber}**. I detected:
- **1 Performance / Schema Design Suggestion** (in DB index case sensitivity)

Ask me anything about these database indexing optimizations in the chat below.`
								}
							]
						}
					}
			});
			return { success: true, pr };
		} catch (e: any) {
			return fail(500, { error: e.message || 'Failed to simulate PR Webhook' });
		}
	}
};
