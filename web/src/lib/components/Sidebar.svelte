<script lang="ts">
	import { useSession, client } from '$lib/auth-client';
	import { 
		FolderGit, GitPullRequest, Settings, Terminal, Activity, 
		Search, Eye, ShieldAlert, Cpu, Network, Globe, Bell, 
		LogOut, Sparkles, AlertCircle, ChevronRight
	} from '@lucide/svelte';
	
	export let active = 'dashboard';
	const session = useSession();

	async function handleSignOut() {
		await client.signOut({
			callbackURL: '/'
		});
	}
</script>

<aside class="w-60 fixed left-0 top-0 h-screen bg-black border-r border-zinc-900 pt-20 hidden md:flex flex-col justify-between z-40 text-zinc-400 font-sans text-xs">
	<!-- Top Navigation Area -->
	<div class="px-3 pt-4 space-y-5 overflow-y-auto flex-1">
		<!-- Search Mockup -->
		<div class="relative px-2">
			<Search class="absolute left-4 top-2.5 w-3.5 h-3.5 text-zinc-600" />
			<input 
				type="text" 
				placeholder="Find..." 
				disabled
				class="w-full bg-zinc-950/80 border border-zinc-900 rounded py-1.5 pl-8 pr-3 text-[11px] outline-none text-zinc-500 cursor-not-allowed"
			/>
			<span class="absolute right-4 top-2 bg-zinc-900 px-1.5 py-0.5 rounded text-[9px] font-mono text-zinc-600 border border-zinc-800">F</span>
		</div>

		<!-- Nav List -->
		<div class="space-y-0.5">
			<a
				href="/dashboard"
				class="flex items-center justify-between px-3 py-2 rounded transition-colors group {active === 'dashboard' ? 'bg-zinc-900/60 text-white font-medium border border-zinc-800/50' : 'hover:bg-zinc-950 hover:text-zinc-200'}"
			>
				<span class="flex items-center gap-2.5">
					<FolderGit class="w-4 h-4 text-zinc-500 group-hover:text-primary transition-colors {active === 'dashboard' ? 'text-primary' : ''}" />
					Projects
				</span>
			</a>

			<a
				href="/dashboard"
				class="flex items-center justify-between px-3 py-2 rounded hover:bg-zinc-950 hover:text-zinc-200 transition-colors group"
			>
				<span class="flex items-center gap-2.5">
					<GitPullRequest class="w-4 h-4 text-zinc-500 group-hover:text-primary transition-colors" />
					Deployments
				</span>
			</a>

			<a
				href="/dashboard/settings"
				class="flex items-center justify-between px-3 py-2 rounded transition-colors group {active === 'settings' ? 'bg-zinc-900/60 text-white font-medium border border-zinc-800/50' : 'hover:bg-zinc-950 hover:text-zinc-200'}"
			>
				<span class="flex items-center gap-2.5">
					<Settings class="w-4 h-4 text-zinc-500 group-hover:text-primary transition-colors {active === 'settings' ? 'text-primary' : ''}" />
					Settings
				</span>
			</a>

			<div class="pt-4 pb-1 px-3 text-[10px] font-mono text-zinc-600 tracking-wider uppercase font-bold">
				Observability
			</div>

			<a
				href="/dashboard"
				class="flex items-center justify-between px-3 py-2 rounded hover:bg-zinc-950 hover:text-zinc-200 transition-colors group"
			>
				<span class="flex items-center gap-2.5">
					<Activity class="w-4 h-4 text-zinc-500 group-hover:text-primary" />
					Logs
				</span>
			</a>

			<a
				href="/dashboard"
				class="flex items-center justify-between px-3 py-2 rounded hover:bg-zinc-950 hover:text-zinc-200 transition-colors group"
			>
				<span class="flex items-center gap-2.5">
					<Eye class="w-4 h-4 text-zinc-500 group-hover:text-primary" />
					Analytics
				</span>
				<ChevronRight class="w-3 h-3 text-zinc-700" />
			</a>

			<a
				href="/dashboard"
				class="flex items-center justify-between px-3 py-2 rounded hover:bg-zinc-950 hover:text-zinc-200 transition-colors group"
			>
				<span class="flex items-center gap-2.5">
					<Cpu class="w-4 h-4 text-zinc-500 group-hover:text-primary" />
					AI Reviews
				</span>
			</a>

			<a
				href="https://github.com"
				target="_blank"
				rel="noreferrer"
				class="flex items-center justify-between px-3 py-2 rounded hover:bg-zinc-950 hover:text-zinc-200 transition-colors group"
			>
				<span class="flex items-center gap-2.5">
					<Globe class="w-4 h-4 text-zinc-500 group-hover:text-primary" />
					GitHub App
				</span>
			</a>
		</div>
	</div>

	<!-- Bottom Area -->
	<div class="p-3 border-t border-zinc-900 space-y-4 bg-zinc-950/20">
		<!-- Action Card Mockup -->
		<div class="bg-zinc-950 border border-zinc-900 rounded p-3 text-[11px] leading-relaxed relative">
			<div class="flex items-start gap-2">
				<ShieldAlert class="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
				<div>
					<span class="font-semibold text-white block mb-0.5">Webhook Active</span>
					<span class="text-zinc-500">Enable automatic reviews to secure commits instantly.</span>
				</div>
			</div>
			<a 
				href="/dashboard"
				class="w-full mt-2.5 py-1 text-center bg-zinc-900 border border-zinc-800 text-white rounded font-mono text-[9px] font-bold block hover:bg-primary hover:text-black hover:border-primary transition-colors cursor-pointer"
			>
				UPDATE APP
			</a>
		</div>

		<!-- Profile Block -->
		<div class="flex items-center justify-between px-2 pt-1">
			<div class="flex items-center gap-2">
				<div class="w-6 h-6 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary font-mono text-[10px] font-bold">
					{$session.data?.user?.name?.[0]?.toUpperCase() || 'U'}
				</div>
				<div class="truncate max-w-[100px]">
					<span class="text-white block font-medium text-[11px] leading-none truncate">{$session.data?.user?.name || 'User'}</span>
					<span class="text-[9px] text-zinc-600 block leading-tight truncate">{$session.data?.user?.email || 'user@mail.com'}</span>
				</div>
			</div>
			<div class="flex items-center gap-1.5 text-zinc-600">
				<button onclick={handleSignOut} class="hover:text-primary transition-colors cursor-pointer p-1" title="Sign Out">
					<LogOut class="w-3.5 h-3.5" />
				</button>
			</div>
		</div>
	</div>
</aside>
