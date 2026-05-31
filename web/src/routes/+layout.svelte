<script lang="ts">
	import '../app.css';
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import { toast } from 'svelte-sonner';
	import { onMount } from 'svelte';

	onMount(() => {
		const handleError = (event: ErrorEvent) => {
			console.error('Captured Global Error:', event.error);
			toast.error(`Error: ${event.message || 'An unexpected error occurred'}`);
		};

		const handleRejection = (event: PromiseRejectionEvent) => {
			console.error('Captured Promise Rejection:', event.reason);
			const reason = event.reason?.message || event.reason || 'Unhandled Promise Rejection';
			toast.error(`Rejection: ${reason}`);
		};

		window.addEventListener('error', handleError);
		window.addEventListener('unhandledrejection', handleRejection);

		return () => {
			window.removeEventListener('error', handleError);
			window.removeEventListener('unhandledrejection', handleRejection);
		};
	});
</script>

<Toaster />
<slot />
