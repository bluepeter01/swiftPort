<script lang="ts">
	import PocketBase from 'pocketbase';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	const pb = new PocketBase('https://jpi.sophnexacademy.com.ng');
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

    goto('/admin');
  } catch (err) {
    console.error('Login error:', err);
    errorMsg = '❌ Invalid email or password.';
  } finally {
    loading = false;
  }
}

</script>

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
				disabled={loading}
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
				disabled={loading}
			/>
		</div>

		<button
			type="submit"
			class="btn btn-error w-full text-white transition-all hover:scale-[1.02] flex items-center justify-center"
			disabled={loading}
		>
			{#if loading}
				<span class="loading loading-spinner loading-sm mr-2"></span>
				Logging in...
			{:else}
				Login
			{/if}
		</button>
	</form>
</div>
