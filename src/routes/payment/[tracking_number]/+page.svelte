<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';

	// --- STORES ---
	const paymentInfo = writable(null);
	const loading = writable(true);
	const errorMsg = writable('');

	// --- PAYMENT METHOD STATE ---
	const coins = [
		{ name: 'Bitcoin', symbol: 'BTC', wallet: 'bc1qlcjxwczlepnn3qp9zyu9gc9qzgs7rnwxwvv05m' },
		{ name: 'Ethereum', symbol: 'ETH', wallet: '0x2751735147ddf1f2f90d670eb3c4a982ed419851' },
		{ name: 'XRP', symbol: 'XRP', wallet: 'rnEdfxXTBuq6b1xNrKz8F8A7ABReDDLG2U' },
		{ name: 'Dogecoin', symbol: 'DOGE', wallet: 'DUE46QNd1oLAWvVjcESx55mWnK1iAtjjJi' }
	];

	let selectedMethod = writable('crypto');
	let selectedCoin = writable(coins[0]);
	let copied = writable(false);
	let waiting = writable(false);
	let confirmed = writable(false);
	let phoneNumber = writable('');
	let showModal = writable(false);
	let modalMessage = writable('');

	// --- COPY & SELECT ---
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

	// --- API CALLS ---
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

	// --- FETCH PAYMENT INFO ---
	onMount(async () => {
		const tracking_number = $page.params.tracking_number;

		try {
			const res = await fetch(`/api/payment/${tracking_number}`);
			if (!res.ok) throw new Error('Payment details not found');

			const data = await res.json();
			paymentInfo.set(data);
		} catch (err) {
			errorMsg.set(err.message);
		} finally {
			loading.set(false);
		}
	});
</script>

<div class="mx-auto mt-20 max-w-md p-6">
	<!-- HEADER -->
	{#if $loading}
		<div class="py-20 text-center">
			<span class="loading loading-lg loading-spinner"></span>
			<p class="mt-3 text-gray-600">Fetching payment details...</p>
		</div>
	{:else if $errorMsg}
		<div class="alert alert-error">
			<p>{$errorMsg}</p>
		</div>
	{:else if $paymentInfo}
		<div class="mb-8 text-center">
			<h1 class="mb-2 text-3xl font-bold text-blue-700">Payment for Shipment</h1>
			<p class="text-gray-500">Tracking Number: {$paymentInfo.tracking_number}</p>

			<div class="mt-4 rounded-lg bg-blue-50 p-4 shadow-sm">
				<p><b>Payment Reason:</b> {$paymentInfo.payment_reason}</p>
				<p>
					<b>Amount Due:</b>
					<span class="font-semibold text-blue-700">${$paymentInfo.amount_due}</span>
				</p>
				<p>
					<b>Status:</b>
					<span
						class={$paymentInfo.payment_status === 'Paid'
							? 'font-semibold text-green-600'
							: 'font-semibold text-red-600'}
					>
						{$paymentInfo.payment_status}
					</span>
				</p>
			</div>
		</div>

		<h2 class="mb-4 text-center text-xl font-bold">Choose Payment Method</h2>

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
							class="cursor-pointer rounded-lg border px-4 py-2 font-semibold transition-colors duration-200"
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
							Send only {$selectedCoin.symbol} to this address. Sending any other coin may result in
							loss.
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
					<a href="https://wa.me/15551234567" target="_blank" class="btn mb-2 w-full btn-success"
						>Open WhatsApp</a
					>
					<button class="btn w-full" on:click={() => showModal.set(false)}>Close</button>
				</div>
			</div>
		{/if}
	{/if}
</div>
