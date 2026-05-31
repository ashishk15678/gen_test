<script lang="ts">
	import Navbar from '$lib/components/Navbar.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import { GitPullRequest, GitMerge, GitBranch, ArrowLeft, Send, Sparkles, ExternalLink, HelpCircle } from '@lucide/svelte';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';

	export let data;

	$: repo = data.repository;
	
	// Keep a local copy of PRs for optimistic UI updates
	let localPRs = data.repository?.pullRequests || [];
	$: {
		localPRs = repo?.pullRequests || [];
	}

	$: openPRs = localPRs.filter(pr => pr.status === 'open');
	$: closedPRs = localPRs.filter(pr => pr.status !== 'open');

	let isSimulating = false;
	let justAddedPrNumber = 0;

	function handleWebhookSubmit() {
		isSimulating = true;
		
		// Determine next temporary number
		const nextNumber = localPRs.length > 0 ? Math.max(...localPRs.map(p => p.number)) + 1 : 1001;
		
		const tempPr = {
			id: 'optimistic-' + nextNumber,
			number: nextNumber,
			title: 'refactor: optimize database indexes and query speed in user lookup',
			branch: `perf-db-indexes-${nextNumber}`,
			status: 'open',
			reviews: [],
			isOptimistic: true // marker for pulsing yellow border
		};

		// Optimistically prepend to array
		localPRs = [tempPr, ...localPRs];

		return async ({ result, update }) => {
			isSimulating = false;
			if (result.type === 'success') {
				toast.success('GitHub Webhook simulated: New PR created and reviewed!');
				
				// Flash green success glow on the new item
				const realPr = result.data?.pr;
				if (realPr) {
					justAddedPrNumber = realPr.number;
					setTimeout(() => {
						justAddedPrNumber = 0;
					}, 2500);
				}

				await update();
			} else {
				// Revert on failure
				localPRs = localPRs.filter(p => p.number !== nextNumber);
				toast.error(result.data?.error || 'Failed to simulate PR Webhook.');
			}
		};
	}
</script>

<svelte:head>
	<title>{repo.name} | Rabbit</title>
</svelte:head>

<Navbar active="dashboard" />
<Sidebar active="dashboard" />

<main class="md:pl-64 pt-24 min-h-screen bg-background text-foreground">
	<div class="max-w-5xl mx-auto px-6 py-8">
		<!-- Back link -->
		<a href="/dashboard" class="inline-flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-primary transition-colors mb-6">
			<ArrowLeft class="w-3.5 h-3.5" />
			BACK TO REPOSITORIES
		</a>

		<!-- Header -->
		<header class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-border/30">
			<div>
				<div class="flex items-center gap-2 mb-1.5">
					<h1 class="text-3xl font-extrabold text-white tracking-tight">{repo.name}</h1>
					<a href={repo.url} target="_blank" rel="noreferrer" class="text-muted-foreground hover:text-white transition-colors">
						<ExternalLink class="w-4 h-4" />
					</a>
				</div>
				<p class="text-muted-foreground text-xs font-mono">Webhook Secret: <code class="text-primary/90">{repo.webhookSecret}</code></p>
			</div>

			<!-- Sim Webhook PR -->
			<form action="?/triggerMockWebhook" method="POST" use:enhance={handleWebhookSubmit}>
				<button 
					type="submit" 
					disabled={isSimulating}
					class="px-4 py-2.5 bg-primary/10 border border-primary/30 text-primary font-mono text-xs font-bold rounded flex items-center justify-center gap-2 hover:bg-primary hover:text-primary-foreground hover:shadow-[0_0_15px_rgba(0,255,102,0.2)] transition-all cursor-pointer disabled:opacity-50"
				>
					{#if isSimulating}
						<svg class="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
						</svg>
						SIMULATING WEBHOOK...
					{:else}
						<Sparkles class="w-4 h-4" />
						SIMULATE PR WEBHOOK
					{/if}
				</button>
			</form>
		</header>

		<!-- PRs Sections -->
		<div class="space-y-8">
			<!-- Open PRs -->
			<div>
				<h2 class="text-xs font-mono text-muted-foreground tracking-wider mb-4 uppercase flex items-center gap-1.5">
					<GitPullRequest class="w-4 h-4 text-primary" />
					Open Pull Requests ({openPRs.length})
				</h2>

				{#if openPRs.length === 0}
					<div class="bg-card/20 border border-border/30 rounded p-6 text-center text-sm text-muted-foreground font-mono">
						No active pull requests. Click "Simulate PR Webhook" above to trigger a new AI review!
					</div>
				{:else}
					<div class="grid gap-3">
						{#each openPRs as pr}
							<div class="relative">
								{#if pr.isOptimistic}
									<div 
										class="bg-card border border-yellow-500/80 bg-yellow-500/5 shadow-[0_0_15px_rgba(234,179,8,0.15)] rounded p-4 flex items-center justify-between gap-4 animate-pulse"
									>
										<div class="flex items-center gap-4">
											<div class="w-8 h-8 rounded bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400">
												<GitPullRequest class="w-4 h-4" />
											</div>
											<div>
												<h4 class="font-bold text-white/50 text-sm sm:text-base leading-snug">
													{pr.title}
												</h4>
												<div class="flex items-center gap-2 text-xs font-mono text-muted-foreground mt-1">
													<span>#{pr.number}</span>
													<span>•</span>
													<span class="flex items-center gap-1">
														<GitBranch class="w-3.5 h-3.5" />
														{pr.branch}
													</span>
												</div>
											</div>
										</div>
										<span class="px-2.5 py-1 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 text-xs font-mono font-bold uppercase">
											Analyzing
										</span>
									</div>
								{:else}
									<a 
										href="/dashboard/repo/{repo.id}/pr/{pr.number}"
										class="bg-card border rounded p-4 flex items-center justify-between gap-4 transition-all duration-500 hover:translate-x-1 group
										{pr.number === justAddedPrNumber ? 'success-glow border-primary' : 'border-border/40 hover:border-primary/20'}"
									>
										<div class="flex items-center gap-4">
											<div class="w-8 h-8 rounded bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
												<GitPullRequest class="w-4 h-4" />
											</div>
											<div>
												<h4 class="font-bold text-white group-hover:text-primary transition-colors text-sm sm:text-base leading-snug">
													{pr.title}
												</h4>
												<div class="flex items-center gap-2 text-xs font-mono text-muted-foreground mt-1">
													<span>#{pr.number}</span>
													<span>•</span>
													<span class="flex items-center gap-1">
														<GitBranch class="w-3.5 h-3.5" />
														{pr.branch}
													</span>
												</div>
											</div>
										</div>

										<!-- Score Badge -->
										{#if pr.reviews && pr.reviews.length > 0}
											<div class="flex items-center gap-3">
												<div class="hidden sm:flex flex-col text-right">
													<span class="text-[9px] font-mono text-muted-foreground">SCORE</span>
													<span class="font-mono text-xs font-bold text-white">{pr.reviews[0].score}%</span>
												</div>
												<span class="px-2.5 py-1 rounded bg-primary/10 text-primary border border-primary/20 text-xs font-mono font-extrabold uppercase">
													Reviewed
												</span>
											</div>
										{:else}
											<span class="px-2.5 py-1 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 text-xs font-mono font-bold uppercase">
												Processing
											</span>
										{/if}
									</a>
								{/if}
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Closed/Merged PRs -->
			{#if closedPRs.length > 0}
				<div>
					<h2 class="text-xs font-mono text-muted-foreground tracking-wider mb-4 uppercase flex items-center gap-1.5">
						<GitMerge class="w-4 h-4 text-purple-400" />
						Merged & Closed ({closedPRs.length})
					</h2>

					<div class="grid gap-3 opacity-70">
						{#each closedPRs as pr}
							<a 
								href="/dashboard/repo/{repo.id}/pr/{pr.number}"
								class="bg-card/40 border border-border/20 rounded p-4 flex items-center justify-between gap-4 transition-all hover:bg-card/60"
							>
								<div class="flex items-center gap-4">
									<div class="w-8 h-8 rounded bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
										<GitMerge class="w-4 h-4" />
									</div>
									<div>
										<h4 class="font-semibold text-zinc-300 text-sm sm:text-base leading-snug">
											{pr.title}
										</h4>
										<div class="flex items-center gap-2 text-xs font-mono text-muted-foreground mt-1">
											<span>#{pr.number}</span>
											<span>•</span>
											<span class="flex items-center gap-1">
												<GitBranch class="w-3.5 h-3.5" />
												{pr.branch}
											</span>
										</div>
									</div>
								</div>

								{#if pr.reviews && pr.reviews.length > 0}
									<span class="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 text-[10px] font-mono font-bold uppercase">
										Score: {pr.reviews[0].score}%
									</span>
								{/if}
							</a>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	</div>
</main>

<style>
	/* Success flash animations */
	@keyframes successGlow {
		0% {
			box-shadow: 0 0 25px rgba(0, 255, 102, 0.6);
			border-color: #00ff66;
			background-color: rgba(0, 255, 102, 0.1);
		}
		100% {
			box-shadow: 0 0 0px rgba(0, 255, 102, 0);
			border-color: rgba(0, 255, 102, 0.1);
			background-color: transparent;
		}
	}
	.success-glow {
		animation: successGlow 2s ease-out forwards;
	}
</style>
