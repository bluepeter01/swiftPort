<script lang="ts">
	import { writable } from 'svelte/store';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

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
	let showAmountPrompt = writable(false);
	let depositAmount = writable(0);
	let confirmed = writable(false);
	let phoneNumber = writable('');

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

	function openDepositPrompt() {
		showAmountPrompt.set(true);
		depositAmount.set(0);
	}

	async function confirmDeposit(coin) {
		const user = $page.data.user;
		if (!user) return;

		waiting.set(true);
		showAmountPrompt.set(false);

		try {
			await fetch('/api/deposit', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					userId: user.id,
					method: $selectedMethod,
					coin: coin?.symbol,
					amount: $depositAmount
				})
			});

			setTimeout(() => {
				waiting.set(false);
				confirmed.set(true);
			}, 1500);
		} catch (err) {
			console.error(err);
			waiting.set(false);
		}
	}

	async function submitWireRequest() {
		if (!$phoneNumber) return alert('Please enter your phone number');
		waiting.set(true);

		try {
			await fetch('/api/wire-request', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ phone: $phoneNumber })
			});

			setTimeout(() => {
				waiting.set(false);
				confirmed.set(true);
			}, 1500);
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

					<button class="btn w-full bg-yellow-300" disabled={$waiting} on:click={openDepositPrompt}>
						{#if $waiting}Waiting for confirmation...{/if}
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
				Enter your WhatsApp phone number and our team will text you the bank account details.
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

	<!-- Deposit Amount Modal -->
	{#if $showAmountPrompt}
		<div class="bg-opacity-30 fixed inset-0 z-50 flex items-center justify-center bg-black">
			<div class="w-80 rounded-xl bg-white p-6 shadow-lg">
				<h2 class="mb-4 text-lg font-bold">Enter Deposit Amount</h2>
				<input
					type="number"
					bind:value={$depositAmount}
					class="input-bordered input mb-4 w-full"
					min="0"
					placeholder="Amount deposited"
				/>
				<div class="flex justify-end gap-2">
					<button class="btn btn-outline" on:click={() => showAmountPrompt.set(false)}
						>Cancel</button
					>
					<button class="btn btn-primary" on:click={() => confirmDeposit($selectedCoin)}
						>Confirm</button
					>
				</div>
			</div>
		</div>
	{/if}

	<!-- Confirmation Message -->
	{#if $confirmed}
		<div class="mt-8 rounded-lg bg-green-100 p-4 text-center text-green-800 shadow">
			<p class="text-lg font-semibold">Thank you! 🎉</p>
			<p>
				You will be contacted shortly by our customer service via WhatsApp to confirm your order.
			</p>
		</div>
	{/if}
</div>
