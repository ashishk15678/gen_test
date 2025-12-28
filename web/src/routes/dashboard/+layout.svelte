<script>
	import { goto } from '$app/navigation';
	import { client, useSession } from '$lib/auth-client';
	const session = useSession();
	$: if (!$session.isPending && !$session.data?.session) {
		goto('/signin');
	}
</script>

{#if $session.data?.session}
	<slot />
{:else}
	<p>Authenticating...</p>
{/if}
