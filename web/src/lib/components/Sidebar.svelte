<script lang="ts">
	import { LayoutDashboard, Settings, Globe, HelpCircle } from '@lucide/svelte';
	export let active = 'dashboard';
</script>

<aside class="w-64 fixed left-0 top-0 h-screen bg-card/40 border-r border-border/40 pt-24 hidden md:block">
	<div class="px-4 space-y-2">
		<a
			href="/dashboard"
			class="flex items-center gap-3 px-4 py-3 rounded font-mono text-xs tracking-wider transition-all {active === 'dashboard' ? 'bg-primary/10 text-primary border-l-2 border-primary' : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'}"
		>
			<LayoutDashboard class="w-4 h-4" />
			DASHBOARD
		</a>

		<a
			href="/dashboard/settings"
			class="flex items-center gap-3 px-4 py-3 rounded font-mono text-xs tracking-wider transition-all {active === 'settings' ? 'bg-primary/10 text-primary border-l-2 border-primary' : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'}"
		>
			<Settings class="w-4 h-4" />
			SETTINGS
		</a>

		<div class="pt-8 px-4 text-[10px] font-mono text-muted-foreground/60 tracking-wider">
			INTEGRATIONS
		</div>

		<a
			href="https://github.com"
			target="_blank"
			rel="noreferrer"
			class="flex items-center gap-3 px-4 py-3 rounded font-mono text-xs tracking-wider text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-all"
		>
			<Globe class="w-4 h-4" />
			GITHUB APP
		</a>
	</div>
</aside>
