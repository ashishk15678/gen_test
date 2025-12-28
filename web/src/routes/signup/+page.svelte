<script lang="ts">
	import { asset, base } from '$app/paths';
	import { signIn, signUp } from '$lib/auth-client';
	import Button from '$lib/components/ui/button/button.svelte';
	import CardContent from '$lib/components/ui/card/card-content.svelte';
	import CardDescription from '$lib/components/ui/card/card-description.svelte';
	import CardHeader from '$lib/components/ui/card/card-header.svelte';
	import CardTitle from '$lib/components/ui/card/card-title.svelte';
	import Card from '$lib/components/ui/card/card.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import { writable } from 'svelte/store';

	const name = writable('');
	const email = writable('');
	const password = writable('');
	const confirmPassword = writable('');

	const handleSignUp = async () => {
		// if (password != confirmPassword) {
		// 	alert('Passwords do not match');
		// 	return;
		// }
		await signUp.email(
			{
				email: $email,
				name: $name,
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
			<CardTitle class="text-xl">Sign up</CardTitle>
			<CardDescription>Enter your credentials below to sign up for an account</CardDescription>
		</CardHeader>
		<CardContent>
			<div class="grid gap-4">
				<Button
					variant="outline"
					class="w-full bg-transparent flex items-center justify-between"
					onclick={async () => {
						await signIn.social({
							provider: 'google',
							callbackURL: '/'
						});
					}}
					>Login with Google <enchanced:img src={`../icons/google.svg`} alt="Google" />
				</Button>
				<Button
					variant="outline"
					class="w-full bg-transparent flex items-center justify-between"
					onclick={async () => {
						await signIn.social({
							provider: 'github',
							callbackURL: '/'
						});
					}}
					>Login with Github <enchanced:img src={asset(`icons/github.svg`)} alt="Github" />
				</Button>
				<Separator />

				<div class="grid gap-2">
					<Label for="name">Name</Label>
					<Input id="name" type="text" placeholder="John Doe" required bind:value={$name} />
				</div>
				<div class="grid gap-2">
					<Label for="email">Email</Label>
					<Input id="email" type="email" placeholder="m@example.com" required bind:value={$email} />
				</div>
				<div class="grid gap-2">
					<Label for="password">Password</Label>
					<Input
						id="password"
						type="password"
						required
						bind:value={$password}
						placeholder="**********"
					/>
				</div>
				<div class="grid gap-2">
					<Label for="confirmPassword">Confirm Password</Label>
					<Input
						id="confirmPassword"
						type="password"
						placeholder="**********"
						required
						bind:value={$confirmPassword}
					/>
				</div>
				<Button type="button" class="w-full" onclick={handleSignUp}>Sign up</Button>
			</div>
			<div class="mt-4 text-center text-sm">
				Don&apos;t have an account?
				<a href="/signin" class="underline">Sign up</a>
			</div>
		</CardContent>
	</Card>
</div>
