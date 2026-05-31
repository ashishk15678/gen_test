<script lang="ts">
	import { useSession, client } from '$lib/auth-client';
	import { goto } from '$app/navigation';

	export let active = 'home';
	const session = useSession();

	async function handleSignOut() {
		await client.signOut({
			callbackURL: '/'
		});
	}
</script>

<nav class="fixed top-0 left-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border/40 p-4">
	<div class="max-w-7xl mx-auto flex justify-between items-center">
		<a href="/" class="text-2xl font-bold tracking-wider flex items-center gap-1">
			<span class="text-primary drop-shadow-[0_0_8px_rgba(0,255,102,0.3)]">●</span>
			<span class="text-white hover:text-primary transition-colors">Rabbit</span>
		</a>

		<div class="flex gap-6 items-center">
			<a
				href="/"
				class="text-xs font-mono tracking-wider hover:text-primary transition-colors {active === 'home' ? 'text-primary font-semibold' : 'text-muted-foreground'}"
			>
				HOME
			</a>

			{#if $session.data?.session}
				<a
					href="/dashboard"
					class="text-xs font-mono tracking-wider hover:text-primary transition-colors {active === 'dashboard' ? 'text-primary font-semibold' : 'text-muted-foreground'}"
				>
					DASHBOARD
				</a>
				<button
					onclick={handleSignOut}
					class="px-3.5 py-1.5 border border-primary/20 bg-primary/5 text-primary text-xs font-mono rounded hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer"
				>
					SIGN OUT
				</button>
			{:else}
				<a
					href="/signin"
					class="text-xs font-mono tracking-wider hover:text-primary transition-colors {active === 'signin' ? 'text-primary font-semibold' : 'text-muted-foreground'}"
				>
					SIGN IN
				</a>
				<a
					href="/signup"
					class="px-3.5 py-1.5 bg-primary text-primary-foreground text-xs font-mono rounded font-semibold hover:shadow-[0_0_15px_rgba(0,255,102,0.3)] transition-all cursor-pointer"
				>
					GET STARTED
				</a>
			{/if}
		</div>
	</div>
</nav>
