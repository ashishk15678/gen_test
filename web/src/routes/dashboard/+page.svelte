<script>
	import Navbar from '$lib/components/Navbar.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import ReviewCard from '$lib/components/ReviewCard.svelte';

	const mockReviews = [
		{
			repoName: 'ashishk15678/rabbit-bot',
			prTitle: 'feat: Add AI review logic',
			status: 'success',
			summary:
				'Added OpenAI integration for code review. Code looks good but needs error handling for rate limits.',
			timeAgo: '2m ago'
		},
		{
			repoName: 'ashishk15678/rabbit-bot',
			prTitle: 'fix: Webhook parsing error',
			status: 'success',
			summary: 'Fixed JSON parsing issue on payload. Verified with sample data.',
			timeAgo: '1h ago'
		},
		{
			repoName: 'ashishk15678/rabbit-web',
			prTitle: 'chore: Update dependencies',
			status: 'pending',
			summary: 'Analyzing dependency tree updates...',
			timeAgo: '5m ago'
		}
	];
</script>

<svelte:head>
	<title>Dashboard | Rabbit</title>
</svelte:head>

<Navbar active="dashboard" />
<Sidebar active="dashboard" />

<main class="md:pl-64 pt-24 min-h-screen">
	<div class="max-w-5xl mx-auto px-6 py-8">
		<header class="flex justify-between items-center mb-8">
			<div>
				<h1 class="text-3xl font-bold mb-1">Dashboard</h1>
				<p class="text-muted">Welcome back, Ashish.</p>
			</div>
			<button class="btn-primary flex items-center gap-2">
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
					><path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 6v6m0 0v6m0-6h6m-6 0H6"
					></path></svg
				>
				New Repo
			</button>
		</header>

		<div class="grid gap-4">
			{#each mockReviews as review}
				<ReviewCard {...review} />
			{/each}
		</div>
	</div>
</main>
