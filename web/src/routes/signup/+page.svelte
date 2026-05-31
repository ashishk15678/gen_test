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
	import { toast } from 'svelte-sonner';
	import { writable } from 'svelte/store';

	const name = writable('');
	const email = writable('');
	const password = writable('');
	const confirmPassword = writable('');

	const handleSignUp = async () => {
		console.log({
			name: $name,
			email: $email,
			password: $password,
			confirmPassword: $confirmPassword
		});

		if ($password != $confirmPassword) {
			toast.error('Passwords do not match');
			return;
		}
		await signUp.email(
			{
				email: $email,
				name: $name,
				password: $password,
				callbackURL: '/dashboard'
			},
			{
				onError(context) {
					toast.error('unable to signup : ' + (context.error.message ?? context.error));
				}
			}
		);
	};
</script>

<div class="w-full h-screen flex items-center justify-center bg-background text-foreground">
	<Card class="max-w-sm w-full mx-4 border-border/40 bg-card">
		<CardHeader>
			<CardTitle class="text-xl text-white">Sign up</CardTitle>
			<CardDescription class="text-xs font-mono text-muted-foreground mt-1">
				Enter your credentials below to sign up for an account.
			</CardDescription>
		</CardHeader>
		<CardContent>
			<div class="grid gap-4">
				<div class="grid grid-cols-2 gap-2">
					<Button
						variant="outline"
						class="bg-transparent font-mono text-xs cursor-pointer flex items-center justify-center gap-2"
						onclick={async () => {
							await signIn.social({
								provider: 'google',
								callbackURL: '/'
							});
						}}
					>
						<img src="/google.svg" alt="Google" class="w-4 h-4" />
						Google
					</Button>
					<Button
						variant="outline"
						class="bg-transparent font-mono text-xs cursor-pointer flex items-center justify-center gap-2"
						onclick={async () => {
							await signIn.social({
								provider: 'github',
								callbackURL: '/'
							});
						}}
					>
						<img src="/icons/github.svg" alt="GitHub" class="w-4 h-4" />
						GitHub
					</Button>
				</div>
				<Separator class="border-border/30" />

				<div class="grid gap-2">
					<Label for="name" class="text-xs font-mono text-muted-foreground uppercase">NAME</Label>
					<Input 
						id="name" 
						type="text" 
						placeholder="John Doe" 
						required 
						bind:value={$name} 
						class="bg-background border-border/50 text-white focus:border-primary/50"
					/>
				</div>
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
				<div class="grid gap-2">
					<Label for="password" class="text-xs font-mono text-muted-foreground uppercase">PASSWORD</Label>
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
					<Label for="confirmPassword" class="text-xs font-mono text-muted-foreground uppercase">CONFIRM PASSWORD</Label>
					<Input
						id="confirmPassword"
						type="password"
						placeholder="**********"
						required
						bind:value={$confirmPassword}
						class="bg-background border-border/50 text-white focus:border-primary/50"
					/>
				</div>
				<Button type="button" class="w-full bg-primary text-primary-foreground font-mono text-xs font-bold rounded cursor-pointer hover:shadow-[0_0_15px_rgba(0,255,102,0.3)] transition-all" onclick={handleSignUp}>Sign up</Button>
			</div>
			<div class="mt-4 text-center text-sm font-mono text-xs text-muted-foreground">
				Already have an account?
				<a href="/signin" class="underline text-primary hover:text-white transition-colors">Sign in</a>
			</div>
		</CardContent>
	</Card>
</div>
