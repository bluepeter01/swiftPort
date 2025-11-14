<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import WhatsAppButton from '$lib/WhatsAppButton.svelte';
	export let phone = '+16578022801'; // replace with your WhatsApp number (e.g., "2348012345678" for Nigeria)
	export let whatsappMessage =
		'Hello SwiftPort Logistics! I’d like to request for account details for payment of my order.';

	export let message =
		'Hello SwiftPort Logistics! I’d like to submit crypto payment proof for payment of my order.';

	// --- STORES ---
	const paymentInfo = writable(null);
	const loading = writable(true);
	const errorMsg = writable('');

	// --- PAYMENT METHOD STATE ---
	const coins = [
		{ name: 'Bitcoin', symbol: 'BTC', wallet: '12w3X7djAiukgQjxmSNTsbqavag4AYamSc' },
		{
			name: 'US Dollar',
			symbol: 'USDT (BEP20)',
			wallet: '0x52a8a580087f61acee6f11ec3f7a95a413a6e44f'
		},
		// { name: 'XRP', symbol: 'XRP', wallet: 'rnEdfxXTBuq6b1xNrKz8F8A7ABReDDLG2U' },
		{ name: 'Dogecoin', symbol: 'DOGE', wallet: 'D7qha3LVpy9p1mEySU8vNLVS4VdPtkVsw8' }
		// { name: 'Binance coin', symbol: 'BNB', wallet: 'DUE46QNd1oLAWvVjcESx55mWnK1iAtjjJi' }
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
					Click on the button below to request for our bank details via whatsapp.
				</p>

				<a
					href={`https://wa.me/${phone}?text=${encodeURIComponent(whatsappMessage)}`}
					target="_blank"
					rel="noopener noreferrer"
					class="mx-auto flex w-full items-center justify-center gap-2 rounded-lg bg-green-500 px-5 py-3 text-white shadow-lg transition-all duration-300 hover:bg-green-600"
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
					<span class="text-sm font-medium text-white sm:inline">Send Me Account Details</span>
				</a>

				<!-- <button class="btn w-full bg-yellow-300" disabled={$waiting} on:click={submitWireRequest}>
					{#if $waiting}Submitting...{/if}
					{#if !$waiting}Send Me Account Details{/if}
				</button> -->
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
						class="mx-auto flex w-full items-center justify-center gap-2 rounded-lg bg-green-500 px-5 py-3 text-white shadow-lg transition-all duration-300 hover:bg-green-600"
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
						<span class="text-sm font-medium text-white sm:inline">Chat with us</span>
					</a>
					<button class="btn mt-2 w-full" on:click={() => showModal.set(false)}>Close</button>
				</div>
			</div>
		{/if}
	{/if}
</div>
