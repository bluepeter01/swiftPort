<script lang="ts">
	import { writable } from 'svelte/store';
	import WhatsAppButton from '$lib/WhatsAppButton.svelte';
	export let phone = '+16578022801'; // replace with your WhatsApp number (e.g., "2348012345678" for Nigeria)
	export let message = 'Hello SwiftPort Logistics! I’d like to make an inquiry.';
	const coins = [
		{ name: 'Bitcoin', symbol: 'BTC', wallet: 'bc1qd77p4k7yeegjvk5cd2mwt7xdzegqpwj7asgpmx' },
		{ name: 'Ethereum', symbol: 'ETH', wallet: '0x04FAA5fa14aFCc8B3Dfb8efd44699b610E6C2F59' },
		{ name: 'XRP', symbol: 'XRP', wallet: 'rQruXH4uCriCe2PaK2eUFJPE7mvi8fnhhf' },
		{ name: 'Dogecoin', symbol: 'DOGE', wallet: 'DDi9zaG85ciD96oNSjsnVRyiCyQE9dkMi8' }
	];

	let selectedMethod = writable('crypto');
	let selectedCoin = writable(coins[0]);
	let copied = writable(false);
	let waiting = writable(false);
	let confirmed = writable(false);
	let phoneNumber = writable('');
	let showModal = writable(false);
	let modalMessage = writable('');

	function selectCoin(coin) {
		selectedCoin.set(coin);
		copied.set(false);
	}

	function copyAddress(coin) {
		if (typeof navigator !== 'undefined') {
			navigator.clipboard
				.writeText(coin.wallet)
				.then(() => {
					copied.set(true);
					setTimeout(() => copied.set(false), 2000);
				})
				.catch((err) => console.error('Failed to copy: ', err));
		}
	}

	async function confirmDeposit() {
		waiting.set(true);

		try {
			await fetch('/api/crypto-confirm', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ coin: $selectedCoin.symbol })
			});
			showModal.set(true);
			modalMessage.set(
				`Please send proof of payment to our WhatsApp customer service for confirmation.`
			);
			waiting.set(false);
		} catch (err) {
			console.error(err);
			waiting.set(false);
		}
	}

	async function submitWireRequest() {
		if (!$phoneNumber) return alert('Please enter your WhatsApp number');
		waiting.set(true);

		try {
			await fetch('/api/wire-request', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ phone: $phoneNumber })
			});

			showModal.set(true);
			modalMessage.set(`You will receive our bank account details via WhatsApp shortly.`);
			waiting.set(false);
		} catch (err) {
			console.error(err);
			waiting.set(false);
		}
	}
</script>

<div class="mx-auto mt-18 max-w-md p-6">
	<h1 class="mb-6 text-center text-2xl font-bold">Choose Payment Method</h1>

	<!-- Payment Method Selection -->
	<div class="mb-6 flex justify-around">
		<button
			class="btn"
			class:btn-primary={$selectedMethod === 'crypto'}
			on:click={() => selectedMethod.set('crypto')}>Crypto</button
		>
		<button
			class="btn"
			class:btn-primary={$selectedMethod === 'wire'}
			on:click={() => selectedMethod.set('wire')}>Wire Transfer</button
		>
	</div>

	<!-- CRYPTO PAYMENT OPTION -->
	{#if $selectedMethod === 'crypto'}
		<div class="rounded-xl bg-gray-100 p-6 text-center shadow-lg">
			<h2 class="mb-4 text-xl font-bold">Select Cryptocurrency</h2>

			<div class="mb-6 flex justify-around">
				{#each coins as coin}
					<button
						class="rounded-lg border px-4 py-2 font-semibold transition-colors duration-200"
						class:border-teal-500={$selectedCoin.symbol === coin.symbol}
						class:bg-teal-100={$selectedCoin.symbol === coin.symbol}
						on:click={() => selectCoin(coin)}
					>
						{coin.symbol}
					</button>
				{/each}
			</div>

			{#if $selectedCoin}
				<div class="rounded-xl bg-white p-6 text-center shadow-lg">
					<h2 class="mb-4 text-xl font-bold">{$selectedCoin.name} Wallet</h2>

					<div
						class="mb-4 flex items-center justify-between rounded-lg border bg-white p-4 font-mono"
					>
						<span class="truncate">{$selectedCoin.wallet}</span>
						<button class="btn btn-sm btn-primary" on:click={() => copyAddress($selectedCoin)}>
							{#if $copied}Copied!{/if}
							{#if !$copied}Copy{/if}
						</button>
					</div>

					<button class="btn w-full bg-yellow-300" disabled={$waiting} on:click={confirmDeposit}>
						{#if $waiting}Processing...{/if}
						{#if !$waiting}I HAVE DEPOSITED{/if}
					</button>

					<p class="mt-4 text-sm text-gray-500">
						Send only {$selectedCoin.symbol} to this address. Sending any other coin may result in loss.
					</p>
				</div>
			{/if}
		</div>
	{/if}

	<!-- WIRE TRANSFER OPTION -->
	{#if $selectedMethod === 'wire'}
		<div class="rounded-xl bg-gray-100 p-6 text-center shadow-lg">
			<h2 class="mb-4 text-xl font-bold">Wire Transfer Request</h2>
			<p class="mb-3 text-gray-600">
				Enter your WhatsApp phone number to receive our bank details.
			</p>

			<input
				type="tel"
				bind:value={$phoneNumber}
				class="input-bordered input mb-4 w-full"
				placeholder="e.g. +1 555 123 4567"
			/>

			<button class="btn w-full bg-yellow-300" disabled={$waiting} on:click={submitWireRequest}>
				{#if $waiting}Submitting...{/if}
				{#if !$waiting}Send Me Account Details{/if}
			</button>
		</div>
	{/if}

	<!-- MODAL -->
	{#if $showModal}
		<div class="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
			<div class="w-80 rounded-xl bg-white p-6 text-center shadow-lg">
				<h2 class="mb-4 text-lg font-bold">Payment Instructions</h2>
				<p class="mb-4 text-gray-700">{$modalMessage}</p>
				<a
					href={`https://wa.me/${phone}?text=${encodeURIComponent(message)}`}
					target="_blank"
					rel="noopener noreferrer"
					class="mx-auto flex w-fit items-center justify-center gap-2 rounded-full bg-green-500 px-5 py-3 text-white shadow-lg transition-all duration-300 hover:bg-green-600"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="currentColor"
						viewBox="0 0 24 24"
						class="h-6 w-6"
					>
						<path
							d="M12.02 2C6.49 2 2 6.47 2 12c0 2.1.55 4.07 1.62 5.82L2 22l4.33-1.6A9.88 9.88 0 0012 22c5.53 0 10-4.47 10-10S17.55 2 12.02 2zM12 20.3c-1.75 0-3.44-.47-4.93-1.35l-.35-.2-2.57.95.88-2.66-.22-.34A8.26 8.26 0 013.7 12c0-4.6 3.75-8.33 8.33-8.33S20.36 7.4 20.36 12 16.6 20.3 12 20.3zm4.74-6.57c-.26-.13-1.54-.76-1.78-.84-.24-.09-.42-.13-.6.13-.18.27-.69.84-.85 1.02-.16.18-.31.2-.58.07-.26-.13-1.1-.4-2.09-1.26a7.7 7.7 0 01-1.44-1.8c-.15-.27 0-.41.11-.54.11-.13.26-.34.38-.5.13-.18.17-.27.25-.45.08-.18.04-.34-.02-.47-.07-.13-.6-1.46-.82-2-.22-.52-.44-.45-.6-.45l-.51-.01c-.18 0-.46.07-.7.34-.24.27-.92.9-.92 2.2s.94 2.55 1.07 2.72c.13.18 1.83 2.8 4.44 3.93.62.27 1.1.43 1.48.55.62.2 1.18.17 1.63.1.5-.08 1.54-.63 1.76-1.23.22-.6.22-1.12.15-1.23-.06-.1-.23-.16-.48-.29z"
						/>
					</svg>
					<span class="hidden text-sm font-medium sm:inline">Chat with us</span>
				</a>
				<button class="btn mt-2 w-full" on:click={() => showModal.set(false)}>Close</button>
			</div>
		</div>
	{/if}
</div>
