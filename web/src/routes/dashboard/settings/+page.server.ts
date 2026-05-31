import { redirect, fail } from '@sveltejs/kit';
import prisma from '$lib/prisma';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/signin');
	}

	const dbUser = await prisma.user.findUnique({
		where: { id: locals.user.id }
	});

	return {
		user: dbUser || locals.user
	};
};

export const actions: Actions = {
	saveSettings: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		const formData = await request.formData();
		const aiModel = formData.get('aiModel') as string;
		const reviewTone = formData.get('reviewTone') as string;
		const pathFilters = formData.get('pathFilters') as string;
		const customPrompt = formData.get('customPrompt') as string;
		const geminiApiKey = formData.get('geminiApiKey') as string;
		const openaiApiKey = formData.get('openaiApiKey') as string;
		const groqApiKey = formData.get('groqApiKey') as string;

		try {
			await prisma.user.update({
				where: { id: locals.user.id },
				data: {
					aiModel,
					reviewTone,
					pathFilters,
					customPrompt: customPrompt || null,
					geminiApiKey: geminiApiKey || null,
					openaiApiKey: openaiApiKey || null,
					groqApiKey: groqApiKey || null
				}
			});
			return { success: true };
		} catch (e: any) {
			return fail(500, { error: e.message || 'Failed to save settings' });
		}
	}
};
