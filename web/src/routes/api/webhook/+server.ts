import { json } from '@sveltejs/kit';
import prisma from '$lib/prisma';
import crypto from 'crypto';
import { generateAIReview } from '$lib/server/ai';
import { getPRDiff, postPRReview } from '$lib/server/github';
import type { RequestHandler } from './$types';

// Helper to verify GitHub Webhook Signature
function verifySignature(payload: string, signature: string, secret: string): boolean {
	const hmac = crypto.createHmac('sha256', secret);
	const digest = 'sha256=' + hmac.update(payload).digest('hex');
	return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
}

export const POST: RequestHandler = async ({ request }) => {
	const githubEvent = request.headers.get('x-github-event');
	const signature = request.headers.get('x-hub-signature-256');

	if (!githubEvent) {
		return json({ error: 'Missing x-github-event header' }, { status: 400 });
	}

	const rawBody = await request.text();

	// 1. Handle Ping event
	if (githubEvent === 'ping') {
		return json({ status: 'pong' }, { status: 200 });
	}

	// 2. Handle Pull Request event
	if (githubEvent === 'pull_request') {
		let payload;
		try {
			payload = JSON.parse(rawBody);
		} catch (e) {
			return json({ error: 'Invalid JSON body' }, { status: 400 });
		}

		const action = payload.action; // opened, synchronize, closed, merged
		const prNumber = payload.pull_request?.number;
		const prTitle = payload.pull_request?.title;
		const branchName = payload.pull_request?.head?.ref || 'main';
		const repoFullName = payload.repository?.full_name; // e.g. "owner/repo"
		const installationId = payload.installation?.id?.toString();

		if (!prNumber || !prTitle || !repoFullName) {
			return json({ error: 'Missing pull request payload attributes' }, { status: 400 });
		}

		// Find Repository in database matching repoFullName
		const repository = await prisma.repository.findFirst({
			where: { name: repoFullName, isActive: true },
			include: { user: true }
		});

		if (!repository) {
			return json({ error: 'Active repository not connected to Rabbit' }, { status: 404 });
		}

		// Signature Verification
		if (signature && repository.webhookSecret) {
			const isValid = verifySignature(rawBody, signature, repository.webhookSecret);
			if (!isValid) {
				return json({ error: 'Invalid webhook signature' }, { status: 401 });
			}
		}

		// Process PR Opened or Updated (synchronize)
		if (action === 'opened' || action === 'synchronize') {
			try {
				// Create or update Pull Request
				const pr = await prisma.pullRequest.upsert({
					where: {
						repositoryId_number: {
							repositoryId: repository.id,
							number: prNumber
						}
					},
					update: {
						title: prTitle,
						branch: branchName,
						status: 'open'
					},
					create: {
						number: prNumber,
						title: prTitle,
						branch: branchName,
						status: 'open',
						repositoryId: repository.id
					}
				});

				// Delete any previous reviews for this PR
				await prisma.review.deleteMany({
					where: { pullRequestId: pr.id }
				});

				// 1. Fetch real PR Diff from GitHub
				let prDiff = '';
				try {
					prDiff = await getPRDiff(repoFullName, prNumber, installationId);
				} catch (e: any) {
					console.warn(`Failed to fetch real PR diff, using fallback simulation: ${e.message}`);
					prDiff = 'No diff could be retrieved.';
				}

				// 2. Call AI logic (calls Gemini or falls back)
				const aiResult = await generateAIReview(
					repoFullName,
					prNumber,
					prTitle,
					prDiff,
					repository.user
				);

				// 3. Save Review in DB
				const review = await prisma.review.create({
					data: {
						pullRequestId: pr.id,
						score: aiResult.score,
						status: 'completed',
						summary: aiResult.summary,
						comments: {
							create: aiResult.comments.map(c => ({
								filePath: c.filePath,
								lineNumber: c.lineNumber,
								diffHunk: c.diffHunk,
								content: c.content,
								type: c.type
							}))
						}
					}
				});

				// 4. Save Chat Trigger Message
				await prisma.chatInteraction.create({
					data: {
						pullRequestId: pr.id,
						sender: 'ai',
						message: `🤖 **Rabbit Auto-Reviewer Activated via Webhook**

I have analyzed the real code changes in PR **#${prNumber}**. 
Quality Score: **${aiResult.score}%**.
You can ask me logical questions or discuss security concerns about these changes here in the chat.`
					}
				});

				// 5. Post comments back to GitHub PR
				const githubComments = aiResult.comments.map(c => ({
					path: c.filePath,
					line: c.lineNumber,
					body: c.content
				}));

				await postPRReview(
					repoFullName,
					prNumber,
					aiResult.summary,
					githubComments,
					installationId
				);

				return json({ success: true, pullRequest: pr, reviewId: review.id }, { status: 201 });
			} catch (e: any) {
				return json({ error: e.message || 'Database error during webhook processing' }, { status: 500 });
			}
		}

		// Handle PR Merged/Closed
		if (action === 'closed') {
			const isMerged = payload.pull_request?.merged === true;
			try {
				const pr = await prisma.pullRequest.update({
					where: {
						repositoryId_number: {
							repositoryId: repository.id,
							number: prNumber
						}
					},
					data: {
						status: isMerged ? 'merged' : 'closed'
					}
				});
				return json({ success: true, pr, message: isMerged ? 'PR Merged' : 'PR Closed' });
			} catch (e: any) {
				return json({ error: e.message || 'Database error on closing PR' }, { status: 500 });
			}
		}

		return json({ status: 'ignored_action', action });
	}

	return json({ error: 'Unsupported github event' }, { status: 400 });
};
