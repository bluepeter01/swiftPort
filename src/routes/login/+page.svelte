<script lang="ts">
	import PocketBase from 'pocketbase';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	const pb = new PocketBase('https://jpi.sophnexacademy.com.ng'); // your PocketBase URL

	let email = '';
	let password = '';
	let errorMsg = '';

	// Optional: if user is already logged in, redirect them
	onMount(() => {
		if (pb.authStore.isValid) {
			goto('/admin');
		}
	});

	async function login(event: Event) {
		event.preventDefault();
		errorMsg = '';

		try {
			// Authenticate using PocketBase
			const authData = await pb.collection('admin_users').authWithPassword(email, password);

			// Save auth session to cookie (for persistence)
			document.cookie = pb.authStore.exportToCookie({
				httpOnly: false,
				sameSite: 'Lax',
			});

			goto('/admin'); // redirect to admin dashboard
		} catch (err) {
			console.error('Login error:', err);
			errorMsg = '❌ Invalid email or password.';
		}
	}
</script>

<!-- 💄 Page UI -->
<div class="flex min-h-screen items-center justify-center bg-gradient-to-br from-yellow-100 to-red-100">
	<form
		class="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg transition-transform hover:scale-[1.01]"
		on:submit={login}
	>
		<h1 class="mb-6 text-center text-3xl font-bold text-red-700">🔐 Admin Login</h1>

		{#if errorMsg}
			<div class="alert alert-error mb-3 text-sm">{errorMsg}</div>
		{/if}

		<div class="form-control mb-3">
			<label class="label text-sm font-semibold text-gray-700">Email</label>
			<input
				type="email"
				bind:value={email}
				required
				class="input input-bordered w-full focus:ring-2 focus:ring-red-500"
				placeholder="Enter admin email"
			/>
		</div>

		<div class="form-control mb-5">
			<label class="label text-sm font-semibold text-gray-700">Password</label>
			<input
				type="password"
				bind:value={password}
				required
				class="input input-bordered w-full focus:ring-2 focus:ring-red-500"
				placeholder="Enter password"
			/>
		</div>

		<button
			type="submit"
			class="btn btn-error w-full text-white transition-all hover:scale-[1.02]"
		>
			Login
		</button>
	</form>
</div>
