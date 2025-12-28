<script lang="ts">
	import { signIn } from '$lib/auth-client';
	import Button from '$lib/components/ui/button/button.svelte';
	import CardContent from '$lib/components/ui/card/card-content.svelte';
	import CardDescription from '$lib/components/ui/card/card-description.svelte';
	import CardHeader from '$lib/components/ui/card/card-header.svelte';
	import CardTitle from '$lib/components/ui/card/card-title.svelte';
	import Card from '$lib/components/ui/card/card.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import { writable } from 'svelte/store';
	const email = writable('');
	const password = writable('');

	const handleSignIn = async () => {
		await signIn.email(
			{
				email: $email,
				password: $password,
				callbackURL: '/'
			},
			{
				onError(context) {
					alert(context.error.message);
				}
			}
		);
	};
</script>

<div class="w-full h-screen flex items-center justify-center">
	<Card class=" max-w-sm inset-0 flex-1 ">
		<CardHeader>
			<CardTitle class="text-xl">Login</CardTitle>
			<CardDescription>Enter your credentials below to login to your account</CardDescription>
		</CardHeader>
		<CardContent>
			<div class="grid gap-4">
				<div class="grid gap-2">
					<Label for="email">Email</Label>
					<Input id="email" type="email" placeholder="m@example.com" required bind:value={$email} />
				</div>
				<div class="grid gap-2">
					<Label for="password">Password</Label>
					<Input id="password" type="password" required bind:value={$password} />
					<div class="flex items-center">
						<a href="/forget-password" class="ml-auto inline-block text-sm underline">
							Forgot your password?
						</a>
					</div>
				</div>
				<Button type="button" class="w-full" onclick={handleSignIn}>Login</Button>
				<Button
					variant="outline"
					class="w-full bg-transparent"
					onclick={async () => {
						await signIn.social({
							provider: 'google',
							callbackURL: '/'
						});
					}}>Login with Google</Button
				>
			</div>
			<div class="mt-4 text-center text-sm">
				Don&apos;t have an account?
				<a href="/signup" class="underline">Sign up</a>
			</div>
		</CardContent>
	</Card>
</div>
