<script lang="ts">
	import Navbar from '$lib/components/Navbar.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import { 
		FolderGit, GitPullRequest, Award, ShieldCheck, Plus, 
		ExternalLink, X, ToggleLeft, ToggleRight, Info, HelpCircle,
		SlidersHorizontal, Grid, List, Search, GitBranch, GitMerge,
		Activity, Sparkles, ChevronRight, CheckCircle2, AlertCircle, Globe
	} from '@lucide/svelte';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';

	// Data loaded from +page.server.ts
	export let data;

	let showAddModal = false;
	let newRepoName = '';
	let newRepoUrl = '';
	let isSubmitting = false;
	let searchQuery = '';

	// Keep local copy of repositories for Optimistic UI updates
	let localRepos = data.repositories || [];
	$: {
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

	// Extract recent pull requests for the Previews log (sorted by date)
	$: recentReviews = (() => {
		let prs: any[] = [];
		for (const r of localRepos) {
			for (const pr of r.pullRequests || []) {
				prs.push({
					...pr,
					repoId: r.id,
					repoName: r.name
				});
			}
		}
		// Sort by createdAt descending (newest first)
		return prs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 4);
	})();

	// Filter repositories by search query
	$: filteredRepos = localRepos.filter(r => 
		r.name.toLowerCase().includes(searchQuery.toLowerCase())
	);

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
			isOptimistic: true
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
		localRepos = localRepos.map(r => {
			if (r.id === repoId) {
				return { ...r, isActive: !currentActive, isToggling: true };
			}
			return r;
		});

		return async ({ result, update }) => {
			if (result.type === 'success') {
				justUpdatedId = repoId;
				setTimeout(() => {
					justUpdatedId = '';
				}, 2500);

				toast.success(`Repository ${!currentActive ? 'activated' : 'deactivated'} successfully!`);
				await update();
			} else {
				// Revert on failure
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

<main class="md:pl-60 pt-20 min-h-screen bg-black text-zinc-300 font-sans selection:bg-primary selection:text-black">
	<div class="max-w-7xl mx-auto px-6 py-8 space-y-6">
		
		<!-- Search & Filter Controls Row -->
		<div class="flex items-center justify-between gap-4 pb-2">
			<!-- Search Bar -->
			<div class="relative flex-1 max-w-xl">
				<Search class="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
				<input 
					type="text" 
					placeholder="Search Repositories..." 
					bind:value={searchQuery}
					class="w-full bg-zinc-950/80 border border-zinc-900 rounded-md py-2 pl-10 pr-4 text-xs font-mono outline-none text-white focus:border-zinc-700 transition-colors placeholder-zinc-500"
				/>
			</div>

			<!-- Quick controls -->
			<div class="flex items-center gap-2">
				<button disabled class="p-2 border border-zinc-900 bg-zinc-950/30 rounded text-zinc-600 hover:text-zinc-400 cursor-not-allowed">
					<SlidersHorizontal class="w-4 h-4" />
				</button>
				<button disabled class="p-2 border border-zinc-900 bg-zinc-950/30 rounded text-zinc-400 hover:text-zinc-200 cursor-not-allowed">
					<Grid class="w-4 h-4" />
				</button>
				<button disabled class="p-2 border border-zinc-900 bg-zinc-950/30 rounded text-zinc-600 hover:text-zinc-400 cursor-not-allowed">
					<List class="w-4 h-4" />
				</button>

				<!-- Vercel-Style Add Project Button (White background, black text) -->
				<button 
					onclick={() => showAddModal = true} 
					class="px-4 py-2 bg-white text-black font-semibold text-xs rounded hover:bg-zinc-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer ml-2 shadow-[0_0_12px_rgba(255,255,255,0.1)]"
				>
					<Plus class="w-3.5 h-3.5 stroke-[3]" />
					Connect Repo
				</button>
			</div>
		</div>

		<!-- 2-Column Content Layout (Left Sidebar Info Columns [3/10], Right Repos Columns [7/10]) -->
		<div class="grid grid-cols-1 lg:grid-cols-10 gap-8 items-start">
			
			<!-- Column Left (Usage, Automation, Recent Previews) -->
			<div class="lg:col-span-3 space-y-6">
				
				<!-- Usage Widget -->
				<div class="bg-zinc-950/20 border border-zinc-900 rounded-lg p-5 space-y-4">
					<div class="flex justify-between items-center border-b border-zinc-900/60 pb-3">
						<span class="text-xs font-bold text-white tracking-wider uppercase font-mono">Usage</span>
						<span class="px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-400 rounded">
							Last 30 Days
						</span>
					</div>

					<div class="space-y-3.5 text-xs font-mono">
						<div class="flex items-center justify-between">
							<span class="text-zinc-500 flex items-center gap-2">
								<span class="w-1.5 h-1.5 rounded-full bg-primary/70"></span>
								Connected Repos
							</span>
							<span class="text-white font-bold">{totalRepos}</span>
						</div>
						<div class="flex items-center justify-between">
							<span class="text-zinc-500 flex items-center gap-2">
								<span class="w-1.5 h-1.5 rounded-full bg-primary/70"></span>
								Active PR Reviews
							</span>
							<span class="text-white font-bold">{activePRs}</span>
						</div>
						<div class="flex items-center justify-between">
							<span class="text-zinc-500 flex items-center gap-2">
								<span class="w-1.5 h-1.5 rounded-full bg-primary/70"></span>
								Avg Review Score
							</span>
							<span class="text-primary font-bold">{avgScore}%</span>
						</div>
						<div class="flex items-center justify-between">
							<span class="text-zinc-500 flex items-center gap-2">
								<span class="w-1.5 h-1.5 rounded-full bg-primary/70"></span>
								AI Review Runs
							</span>
							<span class="text-zinc-400">Unlimited / Free</span>
						</div>
					</div>
				</div>

				<!-- Automation / Alerts Widget (Vercel styled) -->
				<div class="bg-zinc-950/20 border border-zinc-900 rounded-lg p-5 space-y-4">
					<div>
						<h4 class="text-xs font-bold text-white font-mono tracking-wider uppercase mb-1">Automation Rules</h4>
						<p class="text-zinc-500 text-[11px] leading-normal font-mono">Toggle reviewing for all pull requests automatically.</p>
					</div>

					<div class="bg-zinc-950 border border-zinc-900 rounded p-4 flex items-center justify-between">
						<div class="space-y-0.5">
							<span class="text-xs font-semibold text-white block">Auto Review All</span>
							<span class="text-[9px] font-mono text-zinc-500 block">Runs triggers instantly</span>
						</div>

						<form action="?/toggleAccountAutoReview" method="POST" use:enhance={() => handleAccountToggle(data.user?.autoReviewAll)}>
							<input type="hidden" name="autoReviewAll" value={(!isAccountAutoReview).toString()} />
							<button type="submit" class="text-zinc-400 hover:text-white transition-colors cursor-pointer flex items-center">
								{#if isAccountAutoReview}
									<ToggleRight class="w-8 h-8 text-primary" />
								{:else}
									<ToggleLeft class="w-8 h-8 text-zinc-700" />
								{/if}
							</button>
						</form>
					</div>
				</div>

				<!-- Recent Reviews Log (Vercel style Previews logs) -->
				<div class="space-y-3">
					<h3 class="text-xs font-bold font-mono text-zinc-500 tracking-wider uppercase">Recent Reviews</h3>

					{#if recentReviews.length === 0}
						<div class="bg-zinc-950/20 border border-zinc-900 rounded-lg p-5 text-center text-xs font-mono text-zinc-500">
							No pull requests scanned yet.
						</div>
					{:else}
						<div class="space-y-3">
							{#each recentReviews as pr}
								<a 
									href="/dashboard/repo/{pr.repoId}/pr/{pr.number}"
									class="bg-zinc-950/30 border border-zinc-900 hover:border-zinc-800 rounded-lg p-4 block space-y-2.5 transition-colors group"
								>
									<div class="flex items-start justify-between gap-3">
										<div class="truncate">
											<span class="text-white font-medium text-xs block group-hover:text-primary transition-colors leading-snug truncate">
												{pr.title}
											</span>
											<span class="text-[10px] font-mono text-zinc-500 truncate block mt-0.5">{pr.repoName}</span>
										</div>

										<span class="px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 text-[9px] font-mono font-bold uppercase rounded">
											{pr.reviews?.[0]?.score || 100}%
										</span>
									</div>

									<div class="flex items-center justify-between text-[9px] font-mono text-zinc-500 pt-1 border-t border-zinc-900/60">
										<span class="flex items-center gap-1">
											<GitBranch class="w-3 h-3 text-zinc-600" />
											{pr.branch}
										</span>
										<span>PR #{pr.number}</span>
									</div>
								</a>
							{/each}
						</div>
					{/if}
				</div>
			</div>

			<!-- Column Right (Projects list) -->
			<div class="lg:col-span-7 space-y-4">
				
				<div class="flex items-center justify-between border-b border-zinc-900 pb-2">
					<h2 class="text-xs font-bold font-mono text-zinc-500 tracking-wider uppercase">Projects</h2>
					<span class="text-xs font-mono text-zinc-600">{filteredRepos.length} Connected</span>
				</div>

				<!-- Connected Repos Grid -->
				{#if filteredRepos.length === 0}
					<div class="bg-zinc-950/20 border border-zinc-900 rounded-lg p-16 text-center flex flex-col items-center justify-center space-y-4">
						<div class="w-12 h-12 rounded-full bg-zinc-900/50 border border-zinc-800 flex items-center justify-center text-zinc-600">
							<ShieldCheck class="w-6 h-6" />
						</div>
						<div class="space-y-1">
							<h3 class="font-bold text-white text-base">No active repositories</h3>
							<p class="text-zinc-500 text-xs font-mono max-w-sm mx-auto leading-normal">
								Connect a GitHub repository to trigger AI analysis and logical security code reviews.
							</p>
						</div>
						<button 
							onclick={() => showAddModal = true} 
							class="px-4 py-2 bg-white text-black font-semibold text-xs rounded hover:bg-zinc-200 transition-colors cursor-pointer"
						>
							Connect First Repo
						</button>
					</div>
				{:else}
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						{#each filteredRepos as repo}
							<!-- Project Card (Vercel Style) -->
							<div 
								class="bg-zinc-950/20 border rounded-lg p-4 flex flex-col justify-between h-[175px] transition-all duration-300 group
								{repo.id === justUpdatedId ? 'border-primary shadow-[0_0_15px_rgba(0,255,102,0.1)]' : 'border-zinc-900 hover:border-zinc-800'}
								{repo.isOptimistic ? 'border-yellow-500/50 bg-yellow-500/5 animate-pulse' : ''}
								{repo.isToggling ? 'border-yellow-500/30' : ''}"
							>
								<!-- Top row: Avatar, Name, Status, Switch -->
								<div class="flex items-start justify-between gap-3">
									<div class="flex items-center gap-3">
										<div class="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white font-mono text-xs group-hover:border-zinc-700 transition-colors">
											<FolderGit class="w-4 h-4 text-zinc-500 group-hover:text-primary transition-colors {repo.isActive ? 'text-primary' : ''}" />
										</div>

										<div class="truncate max-w-[170px]">
											{#if repo.isOptimistic}
												<span class="text-white/60 font-semibold text-sm block truncate">{repo.name}</span>
											{:else}
												<a 
													href="/dashboard/repo/{repo.id}" 
													class="text-white font-semibold text-sm block group-hover:text-primary transition-colors truncate"
												>
													{repo.name}
												</a>
											{/if}
											<a 
												href={repo.url} 
												target="_blank" 
												rel="noreferrer" 
												class="text-zinc-600 hover:text-zinc-400 text-[10px] font-mono flex items-center gap-1 mt-0.5 transition-colors"
											>
												{repo.name.split('/')[1]}.rabbit.app
												<ExternalLink class="w-2.5 h-2.5" />
											</a>
										</div>
									</div>

									<!-- Top Right: Active Status badge / switch -->
									<div class="flex items-center gap-1 text-zinc-600">
										{#if repo.isOptimistic}
											<ToggleRight class="w-7 h-7 text-zinc-800 animate-pulse" />
										{:else}
											<form action="?/toggleRepo" method="POST" use:enhance={() => handleToggleSubmit(repo.id, repo.isActive)}>
												<input type="hidden" name="id" value={repo.id} />
												<input type="hidden" name="isActive" value={(!repo.isActive).toString()} />
												<button type="submit" class="hover:text-white transition-colors cursor-pointer flex items-center p-0.5">
													{#if repo.isActive}
														<span class="w-2 h-2 rounded-full bg-primary animate-pulse mr-2"></span>
														<ToggleRight class="w-7 h-7 text-primary" />
													{:else}
														<span class="w-2 h-2 rounded-full bg-zinc-800 mr-2"></span>
														<ToggleLeft class="w-7 h-7 text-zinc-850" />
													{/if}
												</button>
											</form>
										{/if}
									</div>
								</div>

								<!-- Middle Section: Git identifier -->
								<div class="text-xs text-zinc-400 font-mono flex items-center gap-1.5 mt-2 truncate">
									<Globe class="w-3.5 h-3.5 text-zinc-600 shrink-0" />
									<span class="truncate">{repo.name}</span>
								</div>

								<!-- Bottom Section: Score, PR info & date -->
								<div class="pt-3 border-t border-zinc-900/60 flex justify-between items-center mt-3 text-[10px] font-mono text-zinc-500">
									<div class="flex items-center gap-1 text-white">
										<GitPullRequest class="w-3 h-3 text-zinc-500" />
										<span>{(repo.pullRequests || []).length} PRs</span>
									</div>

									<div class="flex items-center gap-3">
										<div class="flex flex-col text-right">
											<span class="text-[8px] text-zinc-600 font-bold uppercase leading-none">Review Score</span>
											<span class="font-bold text-white mt-0.5 text-xs">
												{repo.pullRequests && repo.pullRequests.some(pr => pr.reviews && pr.reviews.length > 0) 
													? Math.round(repo.pullRequests.reduce((acc, p) => acc + (p.reviews?.[0]?.score || 0), 0) / repo.pullRequests.filter(p => p.reviews && p.reviews.length > 0).length) 
													: 100}%
											</span>
										</div>
									</div>
								</div>
							</div>
						{/each}
					</div>
				{/if}

				<!-- GitHub Setup Accordion Block -->
				<div class="bg-zinc-950/20 border border-zinc-900 rounded-lg p-5 space-y-4">
					<h3 class="text-xs font-bold font-mono text-white tracking-wider uppercase flex items-center gap-2">
						<Info class="w-4 h-4 text-primary" />
						Integration Instructions
					</h3>
					<div class="text-xs font-mono text-zinc-500 space-y-2.5 leading-relaxed">
						<p>Secure automated code reviews run inside webhooks. Follow steps to connect your GitHub account App:</p>
						<ol class="list-decimal pl-4 space-y-1.5 text-zinc-500 text-[11px]">
							<li>Generate a GitHub App key, subscribe to event type: <strong>Pull request</strong>.</li>
							<li>Add webhook tunnel target: <code class="text-primary bg-primary/5 px-1 py-0.5 rounded">https://evolving-martin-monthly.ngrok-free.app/api/webhook</code>.</li>
							<li>Configure settings credentials in <a href="/dashboard/settings" class="text-primary underline hover:text-white transition-colors">Settings Pane</a>.</li>
						</ol>
					</div>
				</div>
			</div>

		</div>
	</div>
</main>

<!-- Add Repository Modal (Vercel Style) -->
{#if showAddModal}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
		<div class="bg-zinc-950 border border-zinc-900 rounded-lg p-6 max-w-md w-full relative animate-slide-up">
			<button 
				onclick={() => showAddModal = false} 
				class="absolute right-4 top-4 text-zinc-500 hover:text-white transition-colors cursor-pointer"
			>
				<X class="w-4 h-4" />
			</button>

			<h3 class="text-lg font-bold text-white mb-1.5">Connect Repository</h3>
			<p class="text-zinc-500 text-xs font-mono mb-5 leading-normal">
				Connect a GitHub repository manually. Specify in <code class="text-primary">owner/repo</code> syntax format.
			</p>

			<form action="?/addRepo" method="POST" use:enhance={handleAddSubmit} class="space-y-4">
				<div class="space-y-1.5">
					<label for="name" class="block text-[10px] font-mono text-zinc-500 uppercase">REPOSITORY NAME</label>
					<input 
						type="text" 
						id="name" 
						name="name" 
						placeholder="e.g. sveltejs/svelte" 
						bind:value={newRepoName}
						required 
						class="w-full bg-black border border-zinc-900 focus:border-zinc-700 outline-none rounded p-2.5 font-mono text-xs text-white placeholder-zinc-700 transition-colors"
					/>
				</div>
				<div class="space-y-1.5">
					<label for="url" class="block text-[10px] font-mono text-zinc-500 uppercase">GITHUB URL (OPTIONAL)</label>
					<input 
						type="url" 
						id="url" 
						name="url" 
						placeholder="e.g. https://github.com/sveltejs/svelte" 
						bind:value={newRepoUrl}
						class="w-full bg-black border border-zinc-900 focus:border-zinc-700 outline-none rounded p-2.5 font-mono text-xs text-white placeholder-zinc-700 transition-colors"
					/>
				</div>

				<div class="flex gap-2 justify-end pt-3 text-xs">
					<button 
						type="button" 
						onclick={() => showAddModal = false} 
						class="px-4 py-2 border border-zinc-900 text-zinc-400 hover:text-white rounded font-mono font-semibold transition-colors cursor-pointer"
					>
						Cancel
					</button>
					<button 
						type="submit" 
						disabled={isSubmitting}
						class="px-4 py-2 bg-white text-black font-semibold rounded hover:bg-zinc-200 transition-colors disabled:opacity-50 cursor-pointer"
					>
						{#if isSubmitting}
							Connecting...
						{:else}
							Connect
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
</style>
