<script lang="ts">
	import Navbar from '$lib/components/Navbar.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import { Save, Bot, ShieldAlert, Cpu } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';

	import { enhance } from '$app/forms';
	export let data;

	let user = data.user;

	// Review settings
	let aiModel = user.aiModel || 'gemini-flash';
	let reviewTone = user.reviewTone || 'constructive';
	let pathFilters = user.pathFilters || '**/*.ts, **/*.js, **/*.py, **/*.go';
	let customPrompt = user.customPrompt || '';
	
	// API Keys
	let geminiApiKey = user.geminiApiKey || '';
	let openaiApiKey = user.openaiApiKey || '';
	let groqApiKey = user.groqApiKey || '';

	let isSaving = false;

	function handleSaveSubmit() {
		isSaving = true;
		return async ({ result, update }) => {
			isSaving = false;
			if (result.type === 'success') {
				toast.success('Settings saved successfully!');
				await update();
			} else {
				toast.error(result.data?.error || 'Failed to save settings.');
			}
		};
	}
</script>

<svelte:head>
	<title>Settings | Rabbit AI</title>
</svelte:head>

<Navbar active="dashboard" />
<Sidebar active="settings" />

<main class="md:pl-64 pt-24 min-h-screen bg-background text-foreground">
	<div class="max-w-3xl mx-auto px-6 py-8">
		<!-- Header -->
		<header class="mb-8 pb-6 border-b border-border/30">
			<h1 class="text-3xl font-extrabold text-white tracking-tight mb-1">Settings</h1>
			<p class="text-muted-foreground text-sm font-mono font-bold">Configure Rabbit reviewer behaviors, custom prompts, and LLM API keys.</p>
		</header>

		<!-- Settings Form -->
		<form action="?/saveSettings" method="POST" use:enhance={handleSaveSubmit} class="space-y-6">
			<!-- AI Provider Section -->
			<div class="bg-card border border-border/40 rounded p-6 space-y-4">
				<h3 class="text-xs font-mono text-muted-foreground tracking-wider uppercase flex items-center gap-1.5 border-b border-border/20 pb-3">
					<Cpu class="w-4 h-4 text-primary" />
					AI Engine Settings
				</h3>

				<div class="grid gap-4">
					<div class="grid gap-2">
						<label for="aiModel" class="text-xs font-mono text-muted-foreground uppercase">AI REVIEW MODEL</label>
						<select 
							id="aiModel" 
							name="aiModel"
							bind:value={aiModel}
							class="w-full bg-background border border-border/50 focus:border-primary/50 outline-none rounded p-2.5 font-mono text-sm text-white transition-all"
						>
							<optgroup label="Google Gemini">
								<option value="gemini-flash">Gemini 2.5 Flash (Default - Highly Optimized)</option>
								<option value="gemini-pro">Gemini 2.5 Pro (Deep logical reasoning)</option>
							</optgroup>
							<optgroup label="OpenAI ChatGPT">
								<option value="gpt-4o">GPT-4o (Elite general capabilities)</option>
								<option value="gpt-4o-mini">GPT-4o Mini (Fast reviews)</option>
							</optgroup>
							<optgroup label="Groq (Llama & Mixtral)">
								<option value="llama-3.3-70b">Llama 3.3 70B (Fast open weights)</option>
								<option value="mixtral-8x7b">Mixtral 8x7B (High speed structure)</option>
							</optgroup>
						</select>
					</div>

					<div class="grid gap-2">
						<label for="reviewTone" class="text-xs font-mono text-muted-foreground uppercase">REVIEW TONE</label>
						<select 
							id="reviewTone" 
							name="reviewTone"
							bind:value={reviewTone}
							class="w-full bg-background border border-border/50 focus:border-primary/50 outline-none rounded p-2.5 font-mono text-sm text-white transition-all"
						>
							<option value="constructive">Constructive & Educational (Best for teams)</option>
							<option value="strict">Strict & Critical (Enforces extreme security rules)</option>
							<option value="concise">Concise & Direct (Only the bugs)</option>
							<option value="sarcastic">Sarcastic (Vibe checks code style errors)</option>
						</select>
					</div>
				</div>
			</div>

			<!-- API Keys Section -->
			<div class="bg-card border border-border/40 rounded p-6 space-y-4">
				<h3 class="text-xs font-mono text-muted-foreground tracking-wider uppercase flex items-center gap-1.5 border-b border-border/20 pb-3">
					<Bot class="w-4 h-4 text-primary" />
					Custom API Keys (Optional)
				</h3>
				<p class="text-xs font-mono text-muted-foreground/80 leading-relaxed">
					Enter your personal API keys below to power the reviewer. If left blank, the platform falls back to the system environment keys when available.
				</p>

				<div class="grid gap-4">
					<div class="grid gap-2">
						<label for="geminiApiKey" class="text-xs font-mono text-muted-foreground uppercase">GEMINI API KEY</label>
						<input 
							type="password" 
							id="geminiApiKey" 
							name="geminiApiKey"
							placeholder="AIzaSy..." 
							bind:value={geminiApiKey}
							class="w-full bg-background border border-border/50 focus:border-primary/50 outline-none rounded p-2.5 font-mono text-sm text-white transition-all"
						/>
					</div>

					<div class="grid gap-2">
						<label for="openaiApiKey" class="text-xs font-mono text-muted-foreground uppercase">OPENAI CHATGPT API KEY</label>
						<input 
							type="password" 
							id="openaiApiKey" 
							name="openaiApiKey"
							placeholder="sk-proj-..." 
							bind:value={openaiApiKey}
							class="w-full bg-background border border-border/50 focus:border-primary/50 outline-none rounded p-2.5 font-mono text-sm text-white transition-all"
						/>
					</div>

					<div class="grid gap-2">
						<label for="groqApiKey" class="text-xs font-mono text-muted-foreground uppercase">GROQ API KEY</label>
						<input 
							type="password" 
							id="groqApiKey" 
							name="groqApiKey"
							placeholder="gsk_..." 
							bind:value={groqApiKey}
							class="w-full bg-background border border-border/50 focus:border-primary/50 outline-none rounded p-2.5 font-mono text-sm text-white transition-all"
						/>
					</div>
				</div>
			</div>

			<!-- Custom Prompt / Instruction Section -->
			<div class="bg-card border border-border/40 rounded p-6 space-y-4">
				<h3 class="text-xs font-mono text-muted-foreground tracking-wider uppercase flex items-center gap-1.5 border-b border-border/20 pb-3">
					<Bot class="w-4 h-4 text-primary" />
					Custom Review Prompt / Guidelines
				</h3>

				<div class="grid gap-2">
					<label for="customPrompt" class="text-xs font-mono text-muted-foreground uppercase">CUSTOM REVIEWER PROMPT</label>
					<textarea 
						id="customPrompt" 
						name="customPrompt"
						rows="6"
						placeholder="e.g. Focus on checking memory leaks, ensure all database accesses utilize prepared statements, enforce camelCase style naming, etc."
						bind:value={customPrompt}
						class="w-full bg-background border border-border/50 focus:border-primary/50 outline-none rounded p-2.5 font-mono text-sm text-white transition-all resize-y"
					></textarea>
					<p class="text-[10px] font-mono text-muted-foreground/60 leading-relaxed">This prompt acts as the core instruction guidelines for the AI reviewer. It is appended to the security and quality scans.</p>
				</div>

				<div class="grid gap-2 pt-2">
					<label for="pathFilters" class="text-xs font-mono text-muted-foreground uppercase">TARGET PATH FILTERS (GLOBS)</label>
					<input 
						type="text" 
						id="pathFilters" 
						name="pathFilters"
						bind:value={pathFilters}
						class="w-full bg-background border border-border/50 focus:border-primary/50 outline-none rounded p-2.5 font-mono text-sm text-white transition-all"
					/>
					<p class="text-[10px] font-mono text-muted-foreground/60 mt-1 leading-relaxed">Separate glob rules using commas. Only files matching these patterns will be scanned.</p>
				</div>
			</div>

			<!-- Save button -->
			<button 
				type="submit"
				disabled={isSaving}
				class="w-full py-3 bg-primary text-primary-foreground font-mono text-xs font-bold rounded flex items-center justify-center gap-2 hover:shadow-[0_0_15px_rgba(0,255,102,0.3)] transition-all cursor-pointer disabled:opacity-50"
			>
				<Save class="w-4 h-4" />
				{#if isSaving}
					SAVING SETTINGS...
				{:else}
					SAVE SETTINGS
				{/if}
			</button>
		</form>
	</div>
</main>
