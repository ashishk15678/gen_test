<script lang="ts">
	import { client } from '$lib/auth-client';
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

	const email = writable('');
	let isSubmitting = false;
	let linkSent = false;

	const handleForgetPassword = async () => {
		if (!$email) {
			toast.error('Please enter your email address');
			return;
		}

		isSubmitting = true;
		
		try {
			await client.forgetPassword({
				email: $email,
				redirectTo: '/reset-password'
			}, {
				onSuccess() {
					linkSent = true;
					toast.success('Reset link triggered!');
				},
				onError(context) {
					toast.error(context.error.message || 'Failed to trigger password reset.');
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
			<CardTitle class="text-xl text-white">Reset Password</CardTitle>
			<CardDescription class="text-xs font-mono text-muted-foreground mt-1">
				Enter your registered email to request a reset link.
			</CardDescription>
		</CardHeader>
		<CardContent>
			{#if !linkSent}
				<div class="grid gap-4">
					<div class="grid gap-2">
						<Label for="email" class="text-xs font-mono text-muted-foreground uppercase">EMAIL ADDRESS</Label>
						<Input 
							id="email" 
							type="email" 
							placeholder="m@example.com" 
							required 
							bind:value={$email}
							class="bg-background border-border/50 text-white focus:border-primary/50"
						/>
					</div>
					
					<Button 
						type="button" 
						disabled={isSubmitting}
						class="w-full bg-primary text-primary-foreground font-mono text-xs font-bold rounded cursor-pointer hover:shadow-[0_0_15px_rgba(0,255,102,0.3)] transition-all"
						onclick={handleForgetPassword}
					>
						{#if isSubmitting}
							SENDING LINK...
						{:else}
							SEND RESET LINK
						{/if}
					</Button>
				</div>
			{:else}
				<div class="text-center py-4 space-y-4 font-mono text-xs text-zinc-300">
					<p class="text-primary font-bold text-sm">✓ Trigger Success</p>
					<p class="leading-relaxed">A password reset link was generated. Since we are in development, <strong>check your server terminal logs</strong> to view the reset URL link.</p>
					
					<div class="pt-4 border-t border-border/20">
						<a href="/signin" class="text-xs underline text-muted-foreground hover:text-white transition-colors">
							Back to Login
						</a>
					</div>
				</div>
			{/if}
		</CardContent>
	</Card>
</div>
