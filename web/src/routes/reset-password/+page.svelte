<script lang="ts">
	import { page } from '$app/stores';
	import { client } from '$lib/auth-client';
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/button/button.svelte';
	import CardContent from '$lib/components/ui/card/card-content.svelte';
	import CardDescription from '$lib/components/ui/card/card-description.svelte';
	import CardHeader from '$lib/components/ui/card/card-header.svelte';
	import CardTitle from '$lib/components/ui/card/card-title.svelte';
	import Card from '$lib/components/ui/card/card.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import { toast } from 'svelte-sonner';
	import { writable } from 'svelte/store';

	const password = writable('');
	const confirmPassword = writable('');
	let isSubmitting = false;

	// Extract token from SvelteKit page URL query parameters
	$: token = $page.url.searchParams.get('token') || '';

	const handleResetPassword = async () => {
		if (!token) {
			toast.error('Invalid reset request. Missing token.');
			return;
		}

		if (!$password) {
			toast.error('Please enter a new password.');
			return;
		}

		if ($password !== $confirmPassword) {
			toast.error('Passwords do not match.');
			return;
		}

		isSubmitting = true;

		try {
			await client.resetPassword({
				newPassword: $password,
				token: token
			}, {
				onSuccess() {
					toast.success('Password successfully reset! Please sign in.');
					goto('/signin');
				},
				onError(context) {
					toast.error(context.error.message || 'Failed to reset password.');
				}
			});
		} catch (e: any) {
			toast.error(e.message || 'An error occurred.');
		} finally {
			isSubmitting = false;
		}
	};
</script>

<div class="w-full h-screen flex items-center justify-center bg-background text-foreground">
	<Card class="max-w-sm w-full mx-4 border-border/40 bg-card">
		<CardHeader>
			<CardTitle class="text-xl text-white">Choose New Password</CardTitle>
			<CardDescription class="text-xs font-mono text-muted-foreground mt-1">
				{#if token}
					Enter your new password credentials below.
				{:else}
					<span class="text-red-400">⚠️ Error: Missing or invalid token link.</span>
				{/if}
			</CardDescription>
		</CardHeader>
		<CardContent>
			<div class="grid gap-4">
				<div class="grid gap-2">
					<Label for="password" class="text-xs font-mono text-muted-foreground uppercase">NEW PASSWORD</Label>
					<Input 
						id="password" 
						type="password" 
						required 
						bind:value={$password}
						placeholder="**********"
						class="bg-background border-border/50 text-white focus:border-primary/50"
					/>
				</div>
				
				<div class="grid gap-2">
					<Label for="confirmPassword" class="text-xs font-mono text-muted-foreground uppercase">CONFIRM NEW PASSWORD</Label>
					<Input 
						id="confirmPassword" 
						type="password" 
						required 
						bind:value={$confirmPassword}
						placeholder="**********"
						class="bg-background border-border/50 text-white focus:border-primary/50"
					/>
				</div>

				<Button 
					type="button" 
					disabled={isSubmitting || !token}
					class="w-full bg-primary text-primary-foreground font-mono text-xs font-bold rounded cursor-pointer hover:shadow-[0_0_15px_rgba(0,255,102,0.3)] transition-all disabled:opacity-50"
					onclick={handleResetPassword}
				>
					{#if isSubmitting}
						RESETTING PASSWORD...
					{:else}
						RESET PASSWORD
					{/if}
				</Button>
			</div>
		</CardContent>
	</Card>
</div>
