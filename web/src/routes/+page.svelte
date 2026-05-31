<script lang="ts">
	import Navbar from '$lib/components/Navbar.svelte';
	import { client, useSession } from '$lib/auth-client';
	import { Terminal, GitPullRequest, Code2, Bot, CheckCircle2, Zap, MessageSquare } from '@lucide/svelte';

	const session = useSession();

	// Interactive code review simulator state
	let currentStep = 0;
	let isReviewing = false;
	let showComments = false;
	let typingText = '';
	const commentText = '⚠️ **Security Warning**: Direct SQL interpolation detected on line 5. This is vulnerable to SQL Injection. Use parameterized inputs via `$1` to secure your query.';

	function startReviewSimulation() {
		if (isReviewing) return;
		isReviewing = true;
		currentStep = 1;
		showComments = false;
		typingText = '';

		setTimeout(() => {
			currentStep = 2;
			// Typewriter effect for AI comment
			let i = 0;
			showComments = true;
			const interval = setInterval(() => {
				if (i < commentText.length) {
					typingText += commentText.charAt(i);
					i++;
				} else {
					clearInterval(interval);
					isReviewing = false;
					currentStep = 3;
				}
			}, 15);
		}, 1500);
	}

	function resetSimulation() {
		currentStep = 0;
		isReviewing = false;
		showComments = false;
		typingText = '';
	}
</script>

<svelte:head>
	<title>Rabbit | AI-Powered Code Reviews</title>
</svelte:head>

<Navbar active="home" />

<div class="bg-background text-foreground min-h-screen font-sans selection:bg-primary selection:text-background overflow-x-hidden pt-16">
	<!-- Hero Section -->
	<section class="relative py-24 md:py-32 flex flex-col items-center text-center px-6 max-w-7xl mx-auto">
		<!-- Glowing Background Orbs -->
		<div class="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
		<div class="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[90px] pointer-events-none -z-10"></div>

		<!-- Tagline Badge -->
		<div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-mono mb-6 animate-pulse">
			<Zap class="w-3.5 h-3.5" />
			<span>AI Code Review Platform v2.0</span>
		</div>

		<!-- Heading -->
		<h1 class="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight max-w-5xl leading-tight mb-8">
			Review code <span class="bg-clip-text text-transparent bg-gradient-to-r from-primary via-emerald-400 to-green-500 drop-shadow-[0_0_15px_rgba(0,255,102,0.2)]">10x faster</span> with contextual AI
		</h1>

		<!-- Subheading -->
		<p class="text-muted-foreground text-lg sm:text-xl max-w-2xl mb-10 leading-relaxed">
			Rabbit integrates directly into your GitHub PRs, automatically summarizing modifications and suggesting line-by-line fixes to eliminate bugs before production.
		</p>

		<!-- Call to Action Buttons -->
		<div class="flex flex-col sm:flex-row gap-4 mb-20">
			{#if $session.data?.session}
				<a href="/dashboard" class="px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:shadow-[0_0_25px_rgba(0,255,102,0.4)] transition-all duration-300 transform hover:-translate-y-0.5 text-center flex items-center justify-center gap-2">
					Go to Dashboard
				</a>
			{:else}
				<a href="/signup" class="px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:shadow-[0_0_25px_rgba(0,255,102,0.4)] transition-all duration-300 transform hover:-translate-y-0.5 text-center flex items-center justify-center gap-2">
					Get Started Free
				</a>
				<a href="#demo" class="px-8 py-4 bg-secondary text-secondary-foreground border border-border font-semibold rounded-lg hover:bg-muted/50 hover:border-primary/40 transition-all duration-300 text-center flex items-center justify-center gap-2">
					Watch Interactive Demo
				</a>
			{/if}
		</div>

		<!-- Dashboard Preview / Terminal Simulator -->
		<div id="demo" class="w-full max-w-5xl mx-auto rounded-xl border border-primary/20 bg-card/60 backdrop-blur-md shadow-2xl p-1 md:p-2 relative overflow-hidden transition-all duration-500 hover:border-primary/40">
			<div class="flex items-center justify-between px-4 py-3 bg-muted/40 rounded-t-lg border-b border-border/50">
				<div class="flex items-center gap-2">
					<div class="w-3 h-3 rounded-full bg-red-500/80"></div>
					<div class="w-3 h-3 rounded-full bg-yellow-500/80"></div>
					<div class="w-3 h-3 rounded-full bg-green-500/80"></div>
				</div>
				<span class="text-xs font-mono text-muted-foreground/80 flex items-center gap-1.5">
					<GitPullRequest class="w-3 h-3 text-primary" />
					PR #42: add-auth-route.ts
				</span>
				<div class="w-12"></div>
			</div>

			<!-- Terminal Mock Container -->
			<div class="p-6 text-left font-mono text-xs sm:text-sm overflow-x-auto min-h-[320px] flex flex-col justify-between">
				<!-- Diff View -->
				<div class="space-y-1">
					<div class="text-muted-foreground mb-4 select-none">// file: src/api/user.ts</div>
					<div class="flex bg-red-950/20 text-red-400 py-0.5 px-2 -mx-2 rounded border-l-2 border-red-500">
						<span class="w-8 select-none opacity-50">4</span>
						<span>-  const query = `SELECT * FROM users WHERE email = '\$&#123;email&#125;'\`;</span>
					</div>
					<div class="flex bg-green-950/20 text-green-400 py-0.5 px-2 -mx-2 rounded border-l-2 border-primary">
						<span class="w-8 select-none opacity-50">4</span>
						<span>+  const query = 'SELECT * FROM users WHERE email = $1';</span>
					</div>
					<div class="flex text-zinc-400 py-0.5 px-2">
						<span class="w-8 select-none opacity-50">5</span>
						<span>   const result = await db.query(query, [email]);</span>
					</div>

					<!-- AI Review Comments -->
					{#if showComments}
						<div class="mt-6 border border-primary/20 bg-primary/5 rounded-lg p-4 ml-6 relative transition-all duration-500 animate-slide-up">
							<div class="flex items-center gap-2 mb-2 text-primary font-bold">
								<Bot class="w-4 h-4" />
								<span>Rabbit Reviewer (AI)</span>
								<span class="text-[10px] bg-primary/10 border border-primary/20 text-primary px-1.5 py-0.5 rounded uppercase font-semibold">Security</span>
							</div>
							<div class="text-zinc-300 leading-relaxed pr-4 whitespace-pre-wrap font-sans">
								{typingText}
							</div>
							<div class="absolute right-4 top-4 text-xs font-mono text-primary/70">Line 4</div>
						</div>
					{/if}
				</div>

				<!-- Simulation Control Box -->
				<div class="mt-8 pt-4 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
					<div class="text-xs text-muted-foreground">
						{#if currentStep === 0}
							<span>Click "Start AI Review" to run review scanner.</span>
						{:else if currentStep === 1}
							<span class="text-primary flex items-center gap-1.5">
								<svg class="animate-spin h-3 w-3 text-primary" fill="none" viewBox="0 0 24 24">
									<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
									<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
								</svg>
								Rabbit is analyzing changes for vulnerabilities and anti-patterns...
							</span>
						{:else if currentStep === 2}
							<span class="text-emerald-400">Security flaw identified! Adding suggestion...</span>
						{:else}
							<span class="text-zinc-400">Simulation complete. Try logging in to hook your own repos!</span>
						{/if}
					</div>

					<div class="flex gap-2">
						{#if currentStep === 3}
							<button onclick={resetSimulation} class="px-4 py-2 border border-border hover:bg-muted/50 rounded text-xs font-semibold font-sans transition-colors cursor-pointer">
								Reset
							</button>
						{/if}
						<button 
							onclick={startReviewSimulation} 
							disabled={isReviewing} 
							class="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded text-xs font-sans transition-all cursor-pointer hover:shadow-[0_0_15px_rgba(0,255,102,0.3)] disabled:opacity-50"
						>
							{#if isReviewing}
								Reviewing...
							{:else}
								Start AI Review
							{/if}
						</button>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Features Section -->
	<section class="py-24 border-t border-border/40 relative">
		<div class="max-w-7xl mx-auto px-6">
			<div class="text-center max-w-3xl mx-auto mb-16">
				<h2 class="text-3xl sm:text-4xl font-extrabold mb-4">
					Packed with features to speed up your reviews
				</h2>
				<p class="text-muted-foreground">
					Traditional PR reviews are slow and subjective. Rabbit operates instantly, scanning for security, logical flows, and style conformances.
				</p>
			</div>

			<div class="grid md:grid-cols-3 gap-8">
				<!-- Card 1 -->
				<div class="bg-card border border-border/50 rounded-xl p-6 hover:border-primary/30 transition-all duration-300 group">
					<div class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 text-primary mb-6 group-hover:scale-110 transition-transform">
						<Bot class="w-6 h-6" />
					</div>
					<h3 class="text-xl font-bold mb-2">Automated Summaries</h3>
					<p class="text-muted-foreground text-sm leading-relaxed">
						No more scanning massive files just to find out what changed. Get a concise, high-level outline of modifications instantly.
					</p>
				</div>

				<!-- Card 2 -->
				<div class="bg-card border border-border/50 rounded-xl p-6 hover:border-primary/30 transition-all duration-300 group">
					<div class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 text-primary mb-6 group-hover:scale-110 transition-transform">
						<MessageSquare class="w-6 h-6" />
					</div>
					<h3 class="text-xl font-bold mb-2">Line-by-line Chat</h3>
					<p class="text-muted-foreground text-sm leading-relaxed">
						Discuss suggestions right on the code line. Have a back-and-forth chat with the AI reviewer to refine recommendations dynamically.
					</p>
				</div>

				<!-- Card 3 -->
				<div class="bg-card border border-border/50 rounded-xl p-6 hover:border-primary/30 transition-all duration-300 group">
					<div class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 text-primary mb-6 group-hover:scale-110 transition-transform">
						<Terminal class="w-6 h-6" />
					</div>
					<h3 class="text-xl font-bold mb-2">Custom Tones & Rules</h3>
					<p class="text-muted-foreground text-sm leading-relaxed">
						Customize reviewing guidelines, enforce project architecture standards, and choose the tone (like educational, blunt, or playful).
					</p>
				</div>
			</div>
		</div>
	</section>

	<!-- Footer -->
	<footer class="py-12 border-t border-border/30 bg-muted/20">
		<div class="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-6">
			<div class="flex items-center gap-2">
				<span class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-green-400">
					Rabbit
				</span>
				<span class="text-xs text-muted-foreground">© 2026 Rabbit AI. All rights reserved.</span>
			</div>
			<div class="flex gap-6 text-sm text-muted-foreground">
				<a href="/privacy" class="hover:text-primary transition-colors">Privacy Policy</a>
				<a href="/terms" class="hover:text-primary transition-colors">Terms of Service</a>
				<a href="https://github.com" class="hover:text-primary transition-colors">Documentation</a>
			</div>
		</div>
	</footer>
</div>

<style>
	/* Custom animations helper */
	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(15px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	.animate-slide-up {
		animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
	}
</style>
