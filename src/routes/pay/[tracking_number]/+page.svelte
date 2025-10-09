<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let trackingNumber: string;
	let shipment: any = null;
	let loading = true;
	let errorMsg = '';

	$: trackingNumber = $page.params.tracking_number;

	// Fetch shipment info by tracking number
	onMount(async () => {
		try {
			const res = await fetch(`/api/track/${trackingNumber}`);
			if (!res.ok) throw new Error('Failed to load shipment info');
			shipment = await res.json();
		} catch (err) {
			console.error(err);
			errorMsg = 'Shipment not found or server error.';
		} finally {
			loading = false;
		}
	});

	async function handlePayment() {
		try {
			// simulate payment logic or redirect to payment gateway
			alert(`Processing payment for shipment ${trackingNumber}`);

			// Example: mark as paid in backend
			const response = await fetch(`/api/pay/${trackingNumber}`, {
				method: 'POST'
			});

			if (response.ok) {
				alert('Payment successful!');
				goto(`/track/${trackingNumber}`);
			} else {
				throw new Error('Payment failed');
			}
		} catch (err) {
			alert('Error during payment: ' + err.message);
		}
	}
</script>

<div
	class="flex min-h-screen items-center justify-center bg-gradient-to-b from-white via-blue-50 to-blue-100 p-6"
>
	{#if loading}
		<div class="text-xl font-semibold text-blue-600">Loading shipment details...</div>
	{:else if errorMsg}
		<div class="alert alert-error">{errorMsg}</div>
	{:else}
		<div class="w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl">
			<h1 class="mb-4 text-center text-3xl font-bold text-blue-700">Pay for Shipment</h1>

			<div class="space-y-3 text-gray-700">
				<p><b>Tracking Number:</b> {shipment.tracking_number}</p>
				<p><b>Receiver:</b> {shipment.receiver_name}</p>
				<p><b>Destination:</b> {shipment.destination}</p>
				<p>
					<b>Amount Due:</b> <span class="font-semibold text-blue-700">${shipment.amount_due}</span>
				</p>
			</div>

			<div class="mt-6 text-center">
				{#if shipment.payment_status === 'unpaid'}
					<button
						on:click={handlePayment}
						class="btn rounded-xl bg-green-500 px-8 py-3 text-white transition-transform hover:scale-105 hover:bg-green-600"
					>
						Pay Now
					</button>
				{:else}
					<p class="text-lg font-semibold text-green-600">Payment already completed ✅</p>
				{/if}
			</div>
		</div>
	{/if}
</div>
