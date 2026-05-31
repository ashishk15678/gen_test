<script lang="ts">
	import Navbar from '$lib/components/Navbar.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import { FolderGit, GitPullRequest, Award, ShieldCheck, Plus, ExternalLink, X, ToggleLeft, ToggleRight, Info, HelpCircle } from '@lucide/svelte';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';

	// Data loaded from +page.server.ts
	export let data;

	let showAddModal = false;
	let newRepoName = '';
	let newRepoUrl = '';
	let isSubmitting = false;

	// Keep local copy of repositories for Optimistic UI updates
	let localRepos = data.repositories || [];
	$: {
		// Sync with server data once it finishes refreshing in the background
		localRepos = data.repositories || [];
	}

	// Global account toggle state
	let isAccountAutoReview = data.user?.autoReviewAll || false;
	$: {
		isAccountAutoReview = data.user?.autoReviewAll || false;
	}

	// Keep track of which repo just updated to flash its color
	let justUpdatedId = '';

	// Calculate summary stats dynamically from localRepos
	$: totalRepos = localRepos.filter(r => !r.isOptimistic).length;
	$: activePRs = localRepos.reduce((acc, r) => acc + (r.pullRequests || []).filter(p => p.status === 'open').length, 0);
	
	$: avgScore = (() => {
		let total = 0;
		let count = 0;
		for (const r of localRepos) {
			for (const pr of r.pullRequests || []) {
				for (const rev of pr.reviews || []) {
					total += rev.score;
					count++;
				}
			}
		}
		return count > 0 ? Math.round(total / count) : 100;
	})();

	// Optimistic UI for adding a repository
	function handleAddSubmit() {
		isSubmitting = true;
		const tempName = newRepoName;
		const tempUrl = newRepoUrl || `https://github.com/${newRepoName}`;
		const tempId = 'optimistic-' + Math.random().toString(36).substr(2, 9);

		const tempRepo = {
			id: tempId,
			name: tempName,
			url: tempUrl,
			isActive: true,
			pullRequests: [],
			isOptimistic: true // marker for yellow glow
		};

		// Optimistically add to the front
		localRepos = [tempRepo, ...localRepos];
		showAddModal = false;

		return async ({ result, update }) => {
			isSubmitting = false;
			if (result.type === 'success') {
				toast.success('Repository successfully connected!');
				newRepoName = '';
				newRepoUrl = '';
				
				// Flash green success glow on the new item
				const realRepo = result.data?.repository;
				if (realRepo) {
					justUpdatedId = realRepo.id;
					setTimeout(() => {
						justUpdatedId = '';
					}, 2500);
				}

				await update();
			} else {
				// Revert on failure
				localRepos = localRepos.filter(r => r.id !== tempId);
				toast.error(result.data?.error || 'Failed to connect repository.');
			}
		};
	}

	// Optimistic UI for toggling repo status
	function handleToggleSubmit(repoId: string, currentActive: boolean) {
		// 1. Instantly toggle status locally and mark as toggling (yellow border)
		localRepos = localRepos.map(r => {
			if (r.id === repoId) {
				return { ...r, isActive: !currentActive, isToggling: true };
			}
			return r;
		});

		return async ({ result, update }) => {
			if (result.type === 'success') {
				// 2. Mark update as successful, trigger success flash class
				justUpdatedId = repoId;
				setTimeout(() => {
					justUpdatedId = '';
				}, 2500);

				toast.success(`Repository ${!currentActive ? 'activated' : 'deactivated'} successfully!`);
				await update();
			} else {
				// 3. Revert to original state on failure
				localRepos = localRepos.map(r => {
					if (r.id === repoId) {
						return { ...r, isActive: currentActive, isToggling: false };
					}
					return r;
				});
				toast.error(result.data?.error || 'Failed to update repository status.');
			}
		};
	}

	// Optimistic UI for Account-wide reviews
	function handleAccountToggle(currentVal: boolean) {
		isAccountAutoReview = !currentVal;

		return async ({ result, update }) => {
			if (result.type === 'success') {
				toast.success(`Account-wide reviews ${!currentVal ? 'enabled' : 'disabled'}!`);
				await update();
			} else {
				isAccountAutoReview = currentVal;
				toast.error(result.data?.error || 'Failed to update account setting.');
			}
		};
	}
</script>

<svelte:head>
	<title>Dashboard | Rabbit AI</title>
</svelte:head>

<Navbar active="dashboard" />
<Sidebar active="dashboard" />

<main class="md:pl-64 pt-24 min-h-screen bg-background text-foreground">
	<div class="max-w-5xl mx-auto px-6 py-8">
		<!-- Header -->
		<header class="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
			<div>
				<h1 class="text-3xl font-extrabold tracking-tight mb-1 text-white">Dashboard</h1>
				<p class="text-muted-foreground text-sm font-mono">Manage automated code reviews.</p>
			</div>
			<button 
				onclick={() => showAddModal = true} 
				class="px-4 py-2.5 bg-primary text-primary-foreground font-mono text-xs font-bold rounded flex items-center justify-center gap-2 hover:shadow-[0_0_15px_rgba(0,255,102,0.3)] transition-all cursor-pointer"
			>
				<Plus class="w-4 h-4" />
				CONNECT REPO
			</button>
		</header>

		<!-- Account-Wide Enable Option -->
		<div class="bg-card border border-border/40 hover:border-primary/20 rounded p-6 mb-8 flex items-center justify-between transition-all duration-300">
			<div>
				<h3 class="font-bold text-white text-base mb-1">Account-Wide Code Reviews</h3>
				<p class="text-muted-foreground text-xs font-mono">Automatically review pull requests for ALL repositories in your GitHub account.</p>
			</div>
			<form action="?/toggleAccountAutoReview" method="POST" use:enhance={() => handleAccountToggle(data.user?.autoReviewAll)}>
				<input type="hidden" name="autoReviewAll" value={(!isAccountAutoReview).toString()} />
				<button type="submit" class="text-muted-foreground hover:text-white transition-colors cursor-pointer flex items-center">
					{#if isAccountAutoReview}
						<ToggleRight class="w-9 h-9 text-primary" />
					{:else}
						<ToggleLeft class="w-9 h-9 text-muted-foreground/40" />
					{/if}
				</button>
			</form>
		</div>

		<!-- Stats Cards -->
		<div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
			<div class="bg-card border border-border/40 rounded p-6 flex items-center justify-between hover:border-primary/20 transition-all duration-300">
				<div>
					<span class="text-xs font-mono text-muted-foreground block mb-1">CONNECTED REPOS</span>
					<span class="text-3xl font-extrabold text-white">{totalRepos}</span>
				</div>
				<div class="w-10 h-10 rounded bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
					<FolderGit class="w-5 h-5" />
				</div>
			</div>

			<div class="bg-card border border-border/40 rounded p-6 flex items-center justify-between hover:border-primary/20 transition-all duration-300">
				<div>
					<span class="text-xs font-mono text-muted-foreground block mb-1">ACTIVE PR REVIEWS</span>
					<span class="text-3xl font-extrabold text-white">{activePRs}</span>
				</div>
				<div class="w-10 h-10 rounded bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
					<GitPullRequest class="w-5 h-5" />
				</div>
			</div>

			<div class="bg-card border border-border/40 rounded p-6 flex items-center justify-between hover:border-primary/20 transition-all duration-300">
				<div>
					<span class="text-xs font-mono text-muted-foreground block mb-1">AVG QUALITY SCORE</span>
					<span class="text-3xl font-extrabold text-white">{avgScore}%</span>
				</div>
				<div class="w-10 h-10 rounded bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
					<Award class="w-5 h-5" />
				</div>
			</div>
		</div>

		<!-- Repo List Title -->
		<h2 class="text-sm font-mono text-muted-foreground tracking-wider mb-4 uppercase">Connected Repositories</h2>

		<!-- Repositories Grid -->
		{#if localRepos.length === 0}
			<div class="bg-card/40 border border-border/30 rounded p-12 text-center flex flex-col items-center justify-center mb-10">
				<ShieldCheck class="w-12 h-12 text-muted-foreground mb-4" />
				<h3 class="font-bold text-lg text-white mb-1">No repositories connected</h3>
				<p class="text-muted-foreground text-sm max-w-sm mb-6">Connect your GitHub repositories manually to allow Rabbit to automatically review pull requests.</p>
				<button onclick={() => showAddModal = true} class="px-4 py-2 bg-primary text-primary-foreground font-mono text-xs font-semibold rounded">
					Connect First Repo
				</button>
			</div>
		{:else}
			<div class="grid gap-4 mb-10">
				{#each localRepos as repo}
					<!-- Glow classes mapping:
						1. isOptimistic: Yellow pulsing border indicating processing
						2. isToggling: Yellow border indicating status toggle in progress
						3. success-glow: Flash bright green on success
					-->
					<div 
						class="bg-card border rounded p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-500 group
						{repo.id === justUpdatedId ? 'success-glow border-primary' : ''}
						{repo.isOptimistic ? 'border-yellow-500/80 bg-yellow-500/5 shadow-[0_0_15px_rgba(234,179,8,0.2)] animate-pulse' : ''}
						{repo.isToggling ? 'border-yellow-500/50' : ''}
						{!repo.isOptimistic && repo.id !== justUpdatedId && !repo.isToggling ? 'border-border/40 hover:border-primary/20' : ''}"
					>
						<div class="flex-1">
							<div class="flex items-center gap-2 mb-1.5">
								{#if repo.isOptimistic}
									<span class="text-lg font-bold text-white/50 font-sans">{repo.name}</span>
								{:else}
									<a href="/dashboard/repo/{repo.id}" class="text-lg font-bold text-white group-hover:text-primary transition-colors flex items-center gap-1.5">
										{repo.name}
									</a>
								{/if}
								<a href={repo.url} target="_blank" rel="noreferrer" class="text-muted-foreground hover:text-white transition-colors">
									<ExternalLink class="w-3.5 h-3.5" />
								</a>
							</div>
							<div class="flex items-center gap-4 text-xs font-mono text-muted-foreground">
								<span>{(repo.pullRequests || []).length} PRs total</span>
								<span>•</span>
								<span class="flex items-center gap-1">
									<span class="w-2 h-2 rounded-full {repo.isActive ? 'bg-primary animate-pulse' : 'bg-muted-foreground/30'}"></span>
									{repo.isActive ? 'Active' : 'Inactive'}
								</span>
							</div>
						</div>

						<div class="flex items-center gap-8 justify-between sm:justify-end">
							<div class="flex flex-col text-right">
								<span class="text-[10px] font-mono text-muted-foreground">REVIEWS SCORE</span>
								<span class="font-mono font-bold text-white text-sm">
									{repo.pullRequests && repo.pullRequests.some(pr => pr.reviews && pr.reviews.length > 0) 
										? Math.round(repo.pullRequests.reduce((acc, p) => acc + (p.reviews?.[0]?.score || 0), 0) / repo.pullRequests.filter(p => p.reviews && p.reviews.length > 0).length) 
										: 100}%
								</span>
							</div>

							<!-- Activate Switch -->
							{#if repo.isOptimistic}
								<div class="flex items-center">
									<ToggleRight class="w-9 h-9 text-muted-foreground/20 animate-pulse" />
								</div>
							{:else}
								<form action="?/toggleRepo" method="POST" use:enhance={() => handleToggleSubmit(repo.id, repo.isActive)}>
									<input type="hidden" name="id" value={repo.id} />
									<input type="hidden" name="isActive" value={(!repo.isActive).toString()} />
									<button type="submit" class="text-muted-foreground hover:text-white transition-colors cursor-pointer flex items-center">
										{#if repo.isActive}
											<ToggleRight class="w-9 h-9 text-primary" />
										{:else}
											<ToggleLeft class="w-9 h-9 text-muted-foreground/40" />
										{/if}
									</button>
								</form>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		{/if}

		<!-- GitHub App Setup Manual (Accordion Style UX) -->
		<div class="bg-card border border-border/40 rounded p-6">
			<h3 class="text-sm font-mono text-white tracking-wider mb-4 uppercase flex items-center gap-2">
				<Info class="w-4 h-4 text-primary" />
				GitHub App Integration Setup
			</h3>
			<div class="text-sm font-sans space-y-4 text-zinc-300 leading-relaxed">
				<p>To let Rabbit automatically review PRs in your GitHub repositories like CodeRabbit, you can register a GitHub App. Follow these steps:</p>
				
				<ol class="list-decimal pl-5 space-y-2 text-xs font-mono text-zinc-400">
					<li>Go to <strong>GitHub Developer Settings</strong> &gt; <strong>GitHub Apps</strong> &gt; <strong>New GitHub App</strong>.</li>
					<li>Set the homepage URL to your deployed URL, and check the <strong>Webhook Active</strong> box.</li>
					<li>Set the Webhook URL to: <code class="text-primary bg-primary/5 px-1 py-0.5 rounded">https://YOUR-DOMAIN/api/webhook</code>.</li>
					<li>Set permissions: <strong>Pull requests: Read & Write</strong>, and <strong>Metadata: Read-only</strong>.</li>
					<li>Subscribe to events: check the box for <strong>Pull request</strong>.</li>
					<li>Save, click <strong>Generate a private key</strong> to download the key, and locate your <strong>App ID</strong>.</li>
					<li>Configure your env files:
						<pre class="bg-background border border-border/50 p-2 rounded text-[11px] text-primary/80 mt-1">
GITHUB_APP_ID="YOUR_APP_ID"
GITHUB_APP_PRIVATE_KEY="YOUR_PRIVATE_KEY"
GEMINI_API_KEY="YOUR_GOOGLE_GEMINI_API_KEY"</pre>
					</li>
					<li>Install the GitHub App onto your repositories! Webhook reviews will trigger immediately on open/push events.</li>
				</ol>
			</div>
		</div>
	</div>
</main>

<!-- Add Repository Modal -->
{#if showAddModal}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
		<div class="bg-card border border-border/40 rounded p-6 max-w-md w-full relative animate-slide-up">
			<button 
				onclick={() => showAddModal = false} 
				class="absolute right-4 top-4 text-muted-foreground hover:text-white transition-colors"
			>
				<X class="w-5 h-5" />
			</button>

			<h3 class="text-xl font-bold text-white mb-2">Connect Repository</h3>
			<p class="text-muted-foreground text-xs font-mono mb-6 leading-relaxed">
				Integrate your repository with Rabbit. Provide your repo details in the format <code class="text-primary">owner/repo</code>.
			</p>

			<form action="?/addRepo" method="POST" use:enhance={handleAddSubmit} class="space-y-4">
				<div>
					<label for="name" class="block text-xs font-mono text-muted-foreground mb-1.5 uppercase">REPOSITORY NAME</label>
					<input 
						type="text" 
						id="name" 
						name="name" 
						placeholder="e.g. sveltejs/svelte" 
						bind:value={newRepoName}
						required 
						class="w-full bg-background border border-border/50 focus:border-primary/60 outline-none rounded p-2.5 font-mono text-sm text-white placeholder-muted-foreground/50 transition-colors"
					/>
				</div>
				<div>
					<label for="url" class="block text-xs font-mono text-muted-foreground mb-1.5 uppercase">GITHUB URL (OPTIONAL)</label>
					<input 
						type="url" 
						id="url" 
						name="url" 
						placeholder="e.g. https://github.com/sveltejs/svelte" 
						bind:value={newRepoUrl}
						class="w-full bg-background border border-border/50 focus:border-primary/60 outline-none rounded p-2.5 font-mono text-sm text-white placeholder-muted-foreground/50 transition-colors"
					/>
				</div>

				<div class="flex gap-3 justify-end pt-4">
					<button 
						type="button" 
						onclick={() => showAddModal = false} 
						class="px-4 py-2 border border-border text-muted-foreground hover:text-white rounded font-mono text-xs cursor-pointer"
					>
						CANCEL
					</button>
					<button 
						type="submit" 
						disabled={isSubmitting}
						class="px-4 py-2 bg-primary text-primary-foreground font-mono text-xs font-bold rounded flex items-center gap-2 hover:shadow-[0_0_10px_rgba(0,255,102,0.2)] disabled:opacity-50 cursor-pointer"
					>
						{#if isSubmitting}
							CONNECTING...
						{:else}
							CONNECT
						{/if}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<style>
	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	.animate-slide-up {
		animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
	}

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
