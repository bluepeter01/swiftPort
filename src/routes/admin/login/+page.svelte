<script lang="ts">
	import PocketBase from 'pocketbase';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	// const pb = new PocketBase('https://jpi.sophnexacademy.com.ng');
	const pb = new PocketBase('https://playgzero.pb.itcass.net');
	pb.autoCancellation(false); // prevent unwanted auto-refreshes

	let email = '';
	let password = '';
	let errorMsg = '';
	let loading = false;

	onMount(() => {
		if (typeof document !== 'undefined') {
			pb.authStore.loadFromCookie(document.cookie);
		}

		if (pb.authStore.isValid) {
			goto('/admin');
		}
	});

	async function login(event: Event) {
		event.preventDefault();
		errorMsg = '';
		loading = true;

		try {
			const res = await fetch('/api/admin-login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password })
			});

			const data = await res.json();

			if (!res.ok) throw new Error(data.error || 'Login failed');

			window.location.href = '/admin';
			// await goto('/admin');
		} catch (err: any) {
			errorMsg = '❌ Invalid email or password.';
		} finally {
			loading = false;
		}
	}
</script>

<div
	class="flex min-h-screen items-center justify-center bg-gradient-to-br from-yellow-100 to-red-100"
>
	<form
		class="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg transition-transform hover:scale-[1.01]"
		on:submit={login}
	>
		<h1 class="mb-6 text-center text-3xl font-bold text-red-700">🔐 Admin Login</h1>

		{#if errorMsg}
			<div class="mb-3 alert alert-error text-sm">{errorMsg}</div>
		{/if}

		<div class="form-control mb-3">
			<label for="email" class="label text-sm font-semibold text-gray-700">Email</label>
			<input
				type="email"
				id="email"
				bind:value={email}
				required
				class="input-bordered input w-full focus:ring-2 focus:ring-red-500"
				placeholder="Enter admin email"
				disabled={loading}
			/>
		</div>

		<div class="form-control mb-5">
			<label for="password" class="label text-sm font-semibold text-gray-700">Password</label>
			<input
				type="password"
				id="password"
				bind:value={password}
				required
				class="input-bordered input w-full focus:ring-2 focus:ring-red-500"
				placeholder="Enter password"
				disabled={loading}
			/>
		</div>

		<button
			type="submit"
			class="btn flex w-full items-center justify-center text-white transition-all btn-error hover:scale-[1.02]"
			disabled={loading}
		>
			{#if loading}
				<span class="loading mr-2 loading-sm loading-spinner"></span>
				Logging in...
			{:else}
				Login
			{/if}
		</button>
	</form>
</div>
