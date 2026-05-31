<script lang="ts">
	import Navbar from '$lib/components/Navbar.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import { ArrowLeft, GitPullRequest, GitBranch, FileText, CheckCircle2, MessageSquare, Code, Terminal, Bot, User, Send, Flame, Award } from '@lucide/svelte';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { tick } from 'svelte';

	export let data;

	$: repo = data.repository;
	$: pr = data.pullRequest;
	$: reviews = pr.reviews || [];
	$: activeReview = reviews[0] || { score: 100, summary: 'No review completed yet.' };

	// Keep a local copy of comments for optimistic UI updates
	let localComments = data.pullRequest?.reviews?.[0]?.comments || [];
	$: {
		localComments = activeReview?.comments || [];
	}

	// Keep a local copy of chat messages for optimistic UI updates
	let localChat = data.pullRequest?.chatMessages || [];
	$: {
		localChat = pr?.chatMessages || [];
	}

	let activeTab = 'summary'; // 'summary', 'files', 'chat'
	let chatMessage = '';
	let commentReplies: Record<string, string> = {};
	let isSendingChat = false;
	let chatContainer: HTMLDivElement;
	let justUpdatedCommentId = '';

	// Scroll chat to bottom on updates
	$: if (localChat && chatContainer) {
		scrollToBottom();
	}

	async function scrollToBottom() {
		await tick();
		if (chatContainer) {
			chatContainer.scrollTop = chatContainer.scrollHeight;
		}
	}

	// Optimistic UI for Chat Submission
	function handleChatSubmit() {
		isSendingChat = true;
		const msgVal = chatMessage;
		const tempId = 'optimistic-' + Math.random();
		const tempMsg = {
			id: tempId,
			sender: 'user',
			message: msgVal,
			isOptimistic: true // Marker for pulse
		};

		// Prepend/append optimistically
		localChat = [...localChat, tempMsg];
		chatMessage = ''; // Instantly clear input
		scrollToBottom();

		return async ({ result, update }) => {
			isSendingChat = false;
			if (result.type === 'success') {
				await update();
				scrollToBottom();
			} else {
				// Revert on failure
				localChat = localChat.filter(msg => msg.id !== tempId);
				chatMessage = msgVal; // Restore input
				toast.error('Failed to send message.');
			}
		};
	}

	// Optimistic UI for Inline Comments Replies
	function handleReplySubmit(commentId: string) {
		const replyVal = commentReplies[commentId];
		let originalContent = '';

		// 1. Find and update comment locally with developer reply & AI spinner
		localComments = localComments.map(c => {
			if (c.id === commentId) {
				originalContent = c.content;
				return { 
					...c, 
					content: `${c.content}\n\n---\n💬 **You**: ${replyVal}\n\n🤖 **Rabbit**: (Processing response...)`,
					isOptimistic: true // Marker for UI
				};
			}
			return c;
		});

		commentReplies[commentId] = ''; // clear input

		return async ({ result, update }) => {
			if (result.type === 'success') {
				// Success: Flash green glow on comments card
				justUpdatedCommentId = commentId;
				setTimeout(() => {
					justUpdatedCommentId = '';
				}, 2500);

				toast.success('AI updated comment thread!');
				await update();
			} else {
				// Revert to original content on failure
				localComments = localComments.map(c => {
					if (c.id === commentId) {
						return { ...c, content: originalContent, isOptimistic: false };
					}
					return c;
				});
				commentReplies[commentId] = replyVal; // Restore input
				toast.error(result.data?.error || 'Failed to post reply.');
			}
		};
	}

	// Preset chat prompts
	const presetPrompts = [
		'Are there any security vulnerabilities?',
		'Summarize the performance implications.',
		'Explain the AST optimization suggestion.'
	];

	function askPreset(prompt: string) {
		chatMessage = prompt;
	}
</script>

<svelte:head>
	<title>PR #{pr.number} | Rabbit Review</title>
</svelte:head>

<Navbar active="dashboard" />
<Sidebar active="dashboard" />

<main class="md:pl-64 pt-24 min-h-screen bg-background text-foreground">
	<div class="max-w-5xl mx-auto px-6 py-8">
		<!-- Back to Repo -->
		<a href="/dashboard/repo/{repo.id}" class="inline-flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-primary transition-colors mb-6">
			<ArrowLeft class="w-3.5 h-3.5" />
			BACK TO PULL REQUESTS
		</a>

		<!-- Header -->
		<header class="mb-8 pb-6 border-b border-border/30">
			<div class="flex flex-wrap items-center gap-2 text-xs font-mono text-muted-foreground mb-2">
				<span>{repo.name}</span>
				<span>/</span>
				<span>PR #{pr.number}</span>
			</div>
			
			<div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
				<div>
					<h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug mb-2">{pr.title}</h1>
					<div class="flex flex-wrap items-center gap-3 text-xs font-mono text-muted-foreground">
						{#if pr.status === 'open'}
							<span class="px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
								<span class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
								OPEN
							</span>
						{:else}
							<span class="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
								MERGED
							</span>
						{/if}
						<span class="flex items-center gap-1">
							<GitBranch class="w-3.5 h-3.5 text-muted-foreground" />
							{pr.branch}
						</span>
					</div>
				</div>

				<!-- Tabs Navigation -->
				<div class="flex border border-border/40 rounded p-1 bg-card/25 self-start">
					<button 
						onclick={() => activeTab = 'summary'} 
						class="px-3.5 py-1.5 rounded text-xs font-mono tracking-wider transition-all cursor-pointer {activeTab === 'summary' ? 'bg-primary text-primary-foreground font-bold shadow-[0_0_10px_rgba(0,255,102,0.15)]' : 'text-muted-foreground hover:text-white'}"
					>
						SUMMARY
					</button>
					<button 
						onclick={() => activeTab = 'files'} 
						class="px-3.5 py-1.5 rounded text-xs font-mono tracking-wider transition-all cursor-pointer relative {activeTab === 'files' ? 'bg-primary text-primary-foreground font-bold shadow-[0_0_10px_rgba(0,255,102,0.15)]' : 'text-muted-foreground hover:text-white'}"
					>
						DIFF FILES
						{#if localComments.length > 0}
							<span class="absolute -top-1.5 -right-1 bg-primary text-primary-foreground font-sans font-black text-[9px] w-4 h-4 flex items-center justify-center rounded-full border border-background">
								{localComments.length}
							</span>
						{/if}
					</button>
					<button 
						onclick={() => { activeTab = 'chat'; scrollToBottom(); }} 
						class="px-3.5 py-1.5 rounded text-xs font-mono tracking-wider transition-all cursor-pointer {activeTab === 'chat' ? 'bg-primary text-primary-foreground font-bold shadow-[0_0_10px_rgba(0,255,102,0.15)]' : 'text-muted-foreground hover:text-white'}"
					>
						AI CHAT
					</button>
				</div>
			</div>
		</header>

		<!-- Content Panels -->
		<div class="space-y-6">
			<!-- 1. SUMMARY TAB -->
			{#if activeTab === 'summary'}
				<div class="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up">
					<!-- Score and Stats -->
					<div class="bg-card border border-border/40 rounded p-6 flex flex-col items-center text-center justify-center relative overflow-hidden">
						<!-- Glow -->
						<div class="absolute -top-10 w-24 h-24 bg-primary/20 rounded-full blur-xl"></div>
						
						<h3 class="text-xs font-mono text-muted-foreground tracking-wider mb-6 uppercase">CODE QUALITY SCORE</h3>
						
						<!-- Radial Ring -->
						<div class="relative w-36 h-36 flex items-center justify-center mb-4">
							<svg class="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
								<!-- Track -->
								<circle cx="50" cy="50" r="42" stroke="oklch(0.2 0.04 142 / 20%)" stroke-width="8" fill="transparent" />
								<!-- Val -->
								<circle cx="50" cy="50" r="42" stroke="oklch(0.85 0.28 142)" stroke-width="8" fill="transparent" 
										stroke-dasharray="264" stroke-dashoffset={264 - (264 * activeReview.score) / 100}
										stroke-linecap="round" class="transition-all duration-1000 ease-out drop-shadow-[0_0_8px_rgba(0,255,102,0.4)]" />
							</svg>
							<div class="absolute flex flex-col items-center">
								<span class="text-4xl font-extrabold text-white">{activeReview.score}</span>
								<span class="text-[10px] font-mono text-muted-foreground">OUT OF 100</span>
							</div>
						</div>

						<p class="text-xs text-muted-foreground font-mono leading-relaxed mt-2">
							Score is computed based on critical bugs, logic consistency, and formatting warnings.
						</p>
					</div>

					<!-- Executive Summary Markdown -->
					<div class="bg-card border border-border/40 rounded p-6 md:col-span-2">
						<h3 class="text-xs font-mono text-muted-foreground tracking-wider mb-4 uppercase flex items-center gap-1.5 border-b border-border/20 pb-3">
							<FileText class="w-4 h-4 text-primary" />
							AI Review Summary
						</h3>
						<div class="prose prose-invert max-w-none text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap font-sans">
							{activeReview.summary}
						</div>
					</div>
				</div>

			<!-- 2. DIFF FILES TAB -->
			{:else if activeTab === 'files'}
				<div class="space-y-6 animate-slide-up">
					{#if localComments.length === 0}
						<div class="bg-card/30 border border-border/20 rounded p-12 text-center font-mono text-muted-foreground text-sm">
							No code issues detected in files. Great job!
						</div>
					{:else}
						{#each localComments as comment}
							<div 
								class="bg-card border rounded-lg overflow-hidden transition-all duration-500
								{comment.id === justUpdatedCommentId ? 'success-glow border-primary' : ''}
								{comment.isOptimistic ? 'border-yellow-500/60 shadow-[0_0_10px_rgba(234,179,8,0.1)]' : ''}
								{!comment.isOptimistic && comment.id !== justUpdatedCommentId ? 'border-border/40' : ''}"
							>
								<!-- File info header -->
								<div class="bg-muted/40 px-4 py-2 border-b border-border/40 flex items-center justify-between">
									<span class="font-mono text-xs text-white font-bold">{comment.filePath}</span>
									<span class="font-mono text-xs text-muted-foreground">Line {comment.lineNumber}</span>
								</div>

								<!-- Git Diff snippet -->
								<div class="bg-background/60 p-4 border-b border-border/30 font-mono text-xs overflow-x-auto leading-relaxed select-none">
									{#each comment.diffHunk.split('\n') as line}
										<div class="flex py-0.5 px-2 {line.startsWith('+') ? 'bg-green-950/20 text-green-400 border-l-2 border-primary' : line.startsWith('-') ? 'bg-red-950/20 text-red-400 border-l-2 border-red-500' : 'text-zinc-400'}">
											<span>{line}</span>
										</div>
									{/each}
								</div>

								<!-- Comment contents and replies -->
								<div class="p-5 space-y-4">
									<div class="flex gap-3">
										<div class="w-8 h-8 rounded bg-primary/10 border border-primary/20 flex items-center justify-center text-primary self-start shrink-0">
											<Bot class="w-4 h-4" />
										</div>
										<div class="flex-1 space-y-3">
											<div class="flex items-center gap-2">
												<span class="text-xs font-mono font-bold text-white">Rabbit Reviewer (AI)</span>
												<span class="text-[9px] font-sans font-extrabold uppercase px-1.5 py-0.5 rounded {comment.type === 'issue' ? 'bg-red-500/10 border border-red-500/20 text-red-400' : comment.type === 'suggestion' ? 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-400' : 'bg-primary/10 border border-primary/20 text-primary'}">
													{comment.type}
												</span>
											</div>
											<div class="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
												{comment.content}
											</div>
										</div>
									</div>

									<!-- Inline Reply Form -->
									<div class="border-t border-border/20 pt-4 pl-11">
										<form action="?/replyToComment" method="POST" use:enhance={() => handleReplySubmit(comment.id)} class="flex gap-2">
											<input type="hidden" name="commentId" value={comment.id} />
											<input 
												type="text" 
												name="replyText"
												placeholder="Type a response to the AI suggestion..." 
												bind:value={commentReplies[comment.id]}
												required
												class="flex-1 bg-background border border-border/40 focus:border-primary/50 outline-none rounded p-2 text-xs font-sans text-white"
											/>
											<button 
												type="submit" 
												class="px-3.5 bg-secondary hover:bg-primary hover:text-primary-foreground border border-border/50 text-secondary-foreground rounded text-xs font-mono font-bold flex items-center gap-1 transition-colors cursor-pointer"
											>
												REPLY
											</button>
										</form>
									</div>
								</div>
							</div>
						{/each}
					{/if}
				</div>

			<!-- 3. AI CHAT TAB -->
			{:else if activeTab === 'chat'}
				<div class="bg-card border border-border/40 rounded-lg flex flex-col h-[520px] overflow-hidden animate-slide-up">
					<!-- Messages container -->
					<div 
						bind:this={chatContainer}
						class="flex-1 p-6 overflow-y-auto space-y-4 scroll-smooth"
					>
						{#if localChat.length === 0}
							<div class="h-full flex flex-col items-center justify-center text-center p-6">
								<Bot class="w-12 h-12 text-primary mb-3 drop-shadow-[0_0_8px_rgba(0,255,102,0.2)]" />
								<h4 class="font-bold text-white mb-1">Talk to Rabbit Reviewer</h4>
								<p class="text-muted-foreground text-xs font-mono max-w-sm">
									Ask questions, test alternative patterns, or check compliance rules for this pull request.
								</p>
							</div>
						{:else}
							{#each localChat as msg}
								<div class="flex gap-3 max-w-[85%] {msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}">
									<div class="w-8 h-8 rounded shrink-0 flex items-center justify-center border {msg.sender === 'user' ? 'bg-secondary border-border/50 text-secondary-foreground' : 'bg-primary/10 border-primary/20 text-primary'}">
										{#if msg.sender === 'user'}
											<User class="w-4 h-4" />
										{:else}
											<Bot class="w-4 h-4" />
										{/if}
									</div>
									<div 
										class="p-3.5 rounded-lg border text-sm leading-relaxed whitespace-pre-wrap transition-all duration-300
										{msg.isOptimistic ? 'border-yellow-500/80 bg-yellow-500/5 animate-pulse text-white' : ''}
										{msg.sender === 'user' && !msg.isOptimistic ? 'bg-primary/5 border-primary/20 text-white font-sans' : ''}
										{msg.sender !== 'user' ? 'bg-muted/30 border-border/30 text-zinc-300' : ''}"
									>
										{msg.message}
									</div>
								</div>
							{/each}
						{/if}
					</div>

					<!-- Preset Prompts suggestion -->
					{#if localChat.length <= 1}
						<div class="px-6 py-2 border-t border-border/20 flex flex-wrap gap-2">
							{#each presetPrompts as prompt}
								<button 
									onclick={() => askPreset(prompt)} 
									class="px-2.5 py-1 text-[11px] font-mono border border-border/40 text-muted-foreground hover:border-primary hover:text-primary rounded transition-all cursor-pointer"
								>
									{prompt}
								</button>
							{/each}
						</div>
					{/if}

					<!-- Input panel -->
					<div class="p-4 border-t border-border/40 bg-muted/20">
						<form action="?/sendChatMessage" method="POST" use:enhance={handleChatSubmit} class="flex gap-2">
							<input 
								type="text" 
								name="message"
								placeholder="Ask Rabbit a question about this code changes..." 
								bind:value={chatMessage}
								required
								class="flex-1 bg-background border border-border/40 focus:border-primary/50 outline-none rounded p-3 text-sm text-white"
							/>
							<button 
								type="submit" 
								disabled={isSendingChat}
								class="px-4 bg-primary text-primary-foreground rounded flex items-center justify-center gap-1.5 hover:shadow-[0_0_15px_rgba(0,255,102,0.3)] transition-all cursor-pointer disabled:opacity-50"
							>
								<Send class="w-4 h-4" />
							</button>
						</form>
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
