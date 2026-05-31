import { redirect, fail } from '@sveltejs/kit';
import prisma from '$lib/prisma';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.user) {
		throw redirect(302, '/signin');
	}

	const repoId = params.id;
	const prNumber = parseInt(params.number);

	if (isNaN(prNumber)) {
		throw redirect(302, '/dashboard');
	}

	const repository = await prisma.repository.findFirst({
		where: { id: repoId, userId: locals.user.id }
	});

	if (!repository) {
		throw redirect(302, '/dashboard');
	}

	const pullRequest = await prisma.pullRequest.findFirst({
		where: { repositoryId: repoId, number: prNumber },
		include: {
			reviews: {
				include: {
					comments: {
						orderBy: { createdAt: 'asc' }
					}
				}
			},
			chatMessages: {
				orderBy: { createdAt: 'asc' }
			}
		}
	});

	if (!pullRequest) {
		throw redirect(302, `/dashboard/repo/${repoId}`);
	}

	return {
		repository,
		pullRequest
	};
};

export const actions: Actions = {
	sendChatMessage: async ({ params, request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		const repoId = params.id;
		const prNumber = parseInt(params.number);
		const formData = await request.formData();
		const message = formData.get('message') as string;

		if (!message || message.trim() === '') {
			return fail(400, { error: 'Message cannot be empty' });
		}

		const pr = await prisma.pullRequest.findFirst({
			where: { repositoryId: repoId, number: prNumber }
		});

		if (!pr) {
			return fail(404, { error: 'Pull Request not found' });
		}

		// Save User Message
		await prisma.chatInteraction.create({
			data: {
				pullRequestId: pr.id,
				sender: 'user',
				message: message.trim()
			}
		});

		// Generate AI Response based on queries
		let aiResponse = '';
		const queryLower = message.toLowerCase();

		if (queryLower.includes('security') || queryLower.includes('sql') || queryLower.includes('vulnerab')) {
			aiResponse = `🔒 **Security Analysis**:
Yes, the SQL injection vulnerability is the primary concern here. By interpolating variables directly into the query string, you make it possible for malicious payloads to bypass inputs. 

Other than this line, the schema variables and database configurations are aligned with safety standards. Parameterizing this query as recommended resolves the vector.`;
		} else if (queryLower.includes('performance') || queryLower.includes('slow') || queryLower.includes('memory') || queryLower.includes('leak')) {
			aiResponse = `⚡ **Performance and Resource Analysis**:
- The main bottleneck is the array subscription handler cleanup in Svelte runtime helper. Without unsubscribing, listeners pile up, creating a heap allocation leak on component unmounts.
- The micro-optimization in the compiler (\`Array.prototype.map\` vs \`for-loop\`) shows no measurable performance change, and we suggest rolling it back to improve AST readability.`;
		} else if (queryLower.includes('explain') || queryLower.includes('understand') || queryLower.includes('what does')) {
			aiResponse = `📖 **Explanation**:
This pull request modifies how reactive bindings behave in compilers and registers listeners in the store runtime. I have highlighted issues where memory cleanup is omitted and suggested code styling improvements. Let me know if you would like me to rewrite any specific block!`;
		} else {
			aiResponse = `🤖 **Rabbit AI**:
I appreciate your feedback on this pull request. I am continuously tracking structural patterns, AST translations, and variable scopes in this branch. 

Is there a specific file or bug you want me to analyze in detail? Feel free to ask!`;
		}

		// Save AI response
		await prisma.chatInteraction.create({
			data: {
				pullRequestId: pr.id,
				sender: 'ai',
				message: aiResponse
			}
		});

		return { success: true };
	},

	replyToComment: async ({ params, request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		const formData = await request.formData();
		const commentId = formData.get('commentId') as string;
		const replyText = formData.get('replyText') as string;

		if (!commentId || !replyText || replyText.trim() === '') {
			return fail(400, { error: 'Reply text is required' });
		}

		try {
			const comment = await prisma.reviewComment.findUnique({
				where: { id: commentId }
			});

			if (!comment) {
				return fail(404, { error: 'Comment not found' });
			}

			// Format updated content with developer reply and AI follow-up
			const updatedContent = `${comment.content}

---
💬 **You**: ${replyText.trim()}

🤖 **Rabbit AI**: Understood. Since this is an intended trade-off or is covered by validation higher up in the call stack, I have flagged this. I will adjust the rules for future scans on this path.`;

			await prisma.reviewComment.update({
				where: { id: commentId },
				data: { content: updatedContent }
			});

			return { success: true };
		} catch (e: any) {
			return fail(500, { error: e.message || 'Failed to post reply' });
		}
	}
};
