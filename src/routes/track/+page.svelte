<script lang="ts">
	import Accordion from '$lib/Accordion.svelte';
	import { fade, fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	let showAll = false; // toggle state
	const visibleCount = 4; // how many items to show by default
	let trackCode: string = '';
	let trackingInfo: any = null;
	let errorMsg: string | boolean = false;
	let loading = false;
	let showAllMedia = false; // toggles gallery expansion
	$: sortedHistory = trackingInfo?.history ? [...trackingInfo.history].reverse() : [];

	// Show error with timeout
	function showError(message: string) {
		errorMsg = message;
		loading = false;
		setTimeout(() => (errorMsg = false), 3000);
	}

	// Fetch tracking data
	async function handleTrack(event?: Event) {
		if (event) event.preventDefault(); // prevent form reload if manual submit

		errorMsg = false;
		trackingInfo = null;
		loading = true;

		if (!trackCode) {
			showError('Tracking code is required');
			return;
		}

		try {
			const response = await fetch(`/api/track/${trackCode}`);
			if (response.ok) {
				const data = await response.json();
				console.log('Tracking data:', data);
				trackingInfo = data;
			} else {
				const errorData = await response.json();
				showError(errorData.error || 'Tracking code not found');
			}
		} catch (err) {
			showError('Failed to fetch tracking data');
		} finally {
			loading = false;
		}
	}

	function payNow() {
		if (!trackingInfo) return;
		goto(`/payment/${trackingInfo.tracking_number}`);
	}

	// Auto-detect tracking code from URL or localStorage
	onMount(async () => {
		const urlParams = new URLSearchParams($page.url.search);
		const codeFromUrl = urlParams.get('code');
		const codeFromStorage = localStorage.getItem('trackCode');

		if (codeFromUrl) {
			trackCode = codeFromUrl;
			localStorage.setItem('trackCode', trackCode);
		} else if (codeFromStorage) {
			trackCode = codeFromStorage;
		}

		if (trackCode) {
			await handleTrack(); // Auto-fetch data on mount
		} else {
			console.log('No tracking code provided yet.');
		}
	});
</script>

<!-- 🌤 Background and Header -->
<div class="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-100 p-6">
	<div class="mx-auto max-w-3xl text-center" transition:fade={{ duration: 300 }}>
		<h1 class="mt-22 text-4xl font-extrabold text-blue-700 drop-shadow-sm">
			Track & Trace Your Shipment
		</h1>
		<p class="mt-12 text-gray-600">
			Enter your tracking number below to get the latest update on your shipment.
		</p>

		<!-- 🚀 Form -->
		<form
			name="handle-track"
			id="handle-track"
			onsubmit={handleTrack}
			class="mt-8 flex flex-col items-center justify-center space-y-3 md:flex-row md:space-y-0 md:space-x-3"
		>
			<input
				type="text"
				bind:value={trackCode}
				class="input-bordered input w-full max-w-md rounded-xl border-blue-300 bg-white p-3 text-lg shadow-sm focus:ring-2 focus:ring-blue-500"
				placeholder="Enter tracking number"
				required
			/>

			<button
				type="submit"
				class="btn rounded-xl bg-blue-600 px-6 py-3 text-white shadow-lg transition-all hover:scale-105 hover:bg-blue-700"
				disabled={loading}
			>
				{#if loading}
					<span class="loading loading-md loading-spinner"></span>
				{:else}
					Track
				{/if}
			</button>
		</form>

		<!-- ❌ Error Message -->
		{#if errorMsg}
			<div class="mx-auto mt-6 alert max-w-md animate-pulse alert-error shadow-md" transition:fade>
				<span>{errorMsg}</span>
			</div>
		{/if}
	</div>

	<!-- 📦 Tracking Info Card -->
	{#if trackingInfo}
		<div
			in:fly={{ y: 40, duration: 500, easing: cubicOut }}
			out:fade
			class="mx-auto mt-10 w-full max-w-2xl rounded-2xl bg-white p-8 shadow-2xl ring-1 ring-gray-100"
		>
			<h2 class="mb-4 text-2xl font-bold text-blue-600">Shipment Details</h2>

			<div class="grid grid-cols-1 gap-3 md:grid-cols-2">
				<p><b>Tracking Number:</b> {trackingInfo.tracking_number}</p>
				<p><b>Status:</b> <span class="font-semibold text-blue-700">{trackingInfo.status}</span></p>
				<p><b>Current Location:</b> {trackingInfo.current_location}</p>
				<p>
					<b>Estimated Delivery:</b>
					{new Date(trackingInfo.estimated_delivery).toLocaleDateString()}
				</p>
				<p><b>Origin:</b> {trackingInfo.origin}</p>
				<p><b>Destination:</b> {trackingInfo.destination}</p>
				<p><b>Sender:</b> {trackingInfo.sender_name}</p>
				<p><b>Receiver:</b> {trackingInfo.receiver_name}</p>
				<p><b>Contents:</b> {trackingInfo.package_contents}</p>
				<p><b>Weight:</b> {trackingInfo.weight} kg</p>
				<p><b>Receiver's Email Address:</b> {trackingInfo.receiver_email}</p>
				<p><b>Receiver's Contact Details:</b> {trackingInfo.receiver_phone}</p>
			</div>

			<hr class="my-4" />

			<!-- 💰 Payment Section -->
			<div class="flex items-center justify-between rounded-lg bg-blue-50 p-4 shadow-inner">
				<p class="text-lg font-semibold text-gray-700">
					Amount Due:
					<span class="font-bold text-blue-700">${trackingInfo.amount_due}</span>
				</p>

				{#if trackingInfo.payment_status === 'Unpaid'}
					<button
						onclick={payNow}
						class="btn bg-green-500 px-6 py-2 text-white transition hover:scale-105 hover:bg-green-600"
					>
						Pay Now
					</button>
				{:else}
					<p class="font-semibold text-green-600">Payment Completed ✅</p>
				{/if}
			</div>

			<p class="mt-5">
				<b>Payment Reason: </b>
				<span class="text-blue-500 italic">{trackingInfo.payment_reason}</span>
			</p>

			{#if trackingInfo.status === 'Held at Customs' && trackingInfo.payment_status === 'Unpaid'}
				<div class="my-6 rounded-lg border-l-4 border-yellow-500 bg-yellow-50 p-4 shadow-sm">
					<h3 class="text-lg font-semibold text-yellow-800">🚨 Shipment Held by Customs</h3>
					<p class="mt-2 text-sm text-yellow-700">
						This package is currently being held at <strong>{trackingInfo.current_location}</strong>
						pending payment of the required customs clearance fee.
					</p>

					<div class="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
						<p class="text-sm text-gray-700">
							<strong>Amount Due:</strong> ${trackingInfo.amount_due}
						</p>
						<a
							href={`/payment/${trackingInfo.tracking_number}`}
							class="mt-3 inline-block rounded-md bg-yellow-600 px-4 py-2 text-sm font-semibold text-white hover:bg-yellow-700 sm:mt-0"
						>
							Pay Customs Fee
						</a>
					</div>
				</div>
			{/if}

			<!-- {#if trackingInfo.package_images && trackingInfo.package_images.length > 0}
				<div class="mt-6">
					<h3 class="mb-3 text-lg font-semibold text-gray-700">Package Media</h3>

					💡 Display limited number of items if not expanded
					<div
						class="grid grid-cols-2 gap-4 md:grid-cols-3"
						transition:fly={{ y: 10, duration: 300 }}
					>
						{#each showAllMedia ? trackingInfo.package_images : trackingInfo.package_images.slice(0, 6) as file}
							{#if file.match(/\.(jpg|jpeg|png|webp)$/i)}
								svelte-ignore a11y_img_redundant_alt
								<img
									src={`http://127.0.0.1:8090/api/files/shipments/${trackingInfo.id}/${file}`}
									alt="Package image"
									class="rounded-lg border border-gray-200 shadow-sm transition-transform duration-300 hover:scale-105"
									loading="lazy"
								/>
							{:else if file.match(/\.(mp4|mov|webm)$/i)}
								svelte-ignore a11y_media_has_caption
								<video
									src={`http://127.0.0.1:8090/api/files/shipments/${trackingInfo.id}/${file}`}
									controls
									class="aspect-video rounded-lg border border-gray-200 shadow-sm transition-transform duration-300 hover:scale-105"
								></video>
							{/if}
						{/each}
					</div>

					👇 Toggle button
					{#if trackingInfo.package_images.length > 6}
						<div class="mt-4 text-center">
							<button
								onclick={() => (showAllMedia = !showAllMedia)}
								class="btn border-blue-400 text-blue-600 transition-all duration-300 btn-outline btn-sm hover:bg-blue-600 hover:text-white"
							>
								{showAllMedia ? 'See Less ▲' : 'See More ▼'}
							</button>
						</div>
					{/if}
				</div>
			{/if} -->

			<!-- 📊 Shipment Progress Bar -->
			<div class="mt-6">
  <h3 class="mb-2 text-lg font-semibold text-gray-700">Shipment Progress</h3>

  <div class="flex items-center justify-between text-sm font-medium text-gray-500">
    <span>Pending</span>
    <span>In Transit</span>
    <span>Arrived</span>
    <span>Delivered</span>
  </div>

  <div class="relative mt-2 h-3 rounded-full bg-gray-200 overflow-hidden">
    <div
      class="absolute h-3 rounded-full transition-all duration-700 ease-out"
      style="
        width: {trackingInfo.status === 'Delivered'
          ? '100%'
          : trackingInfo.status === 'Held at Customs'
            ? '70%'
            : trackingInfo.status === 'Arrived'
              ? '80%'
              : trackingInfo.status === 'In-transit'
                ? '60%'
                : '30%'};
        background-color: {trackingInfo.status === 'Held at Customs' ? '#facc15' : '#3b82f6'};
      "
    >
      {#if trackingInfo.status === 'Arrived'}
        <div class="absolute inset-0 bg-blue-400 animate-pulse opacity-50"></div>
      {/if}
    </div>
  </div>

  <!-- Status label -->
  <p class="mt-2 text-center text-sm text-gray-600">
    Current Status:
    <span
      class={trackingInfo.status === 'Held by Customs'
        ? 'font-semibold text-yellow-600'
        : trackingInfo.status === 'Delivered'
          ? 'font-semibold text-green-600'
          : trackingInfo.status === 'Arrived'
            ? 'font-semibold text-blue-500 animate-pulse'
            : 'font-semibold text-blue-600'}
    >
      {trackingInfo.status}
    </span>
  </p>
</div>

			<!-- 🕒 Tracking History -->
			<div class="mt-8">
				<h3 class="mb-3 text-lg font-semibold text-gray-700">Tracking History</h3>

			<ul class="relative space-y-4 border-l-4 border-blue-500 pl-4">
  {#each [...trackingInfo.history]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())  // newest first
    .slice(0, showAll ? trackingInfo.history.length : visibleCount) as item, i (item.timestamp)}
    {@const isCurrent = i === 0}
    {@const isCompleted = i > 0}

    <li
      in:fly={{ x: -30, duration: 300 }}
      class="relative rounded-md p-3 transition-all duration-300
        {isCurrent ? 'border-l-4 border-blue-600 bg-blue-100 shadow-md' : ''}
        {isCompleted ? 'opacity-90 hover:bg-blue-50' : 'opacity-60'}"
    >
      <!-- Timeline Dot / Check -->
      <div
        class="absolute top-4 -left-[12px] flex h-4 w-4 items-center justify-center rounded-full border-2
          {isCurrent
            ? 'animate-pulse border-blue-600 bg-blue-600'
            : isCompleted
              ? 'border-green-500 bg-green-500 text-white'
              : 'border-blue-400 bg-white'}"
      >
        {#if isCompleted}
          <span class="text-[10px]">✔</span>
        {/if}
      </div>

      <!-- Text Content -->
      <div class="ml-3">
        <p class="font-semibold {isCurrent ? 'text-blue-700' : 'text-gray-700'}">
          {item.event}
          {#if isCurrent}
            <span class="ml-2 inline-block rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white">
              Latest Update
            </span>
          {/if}
        </p>

        <p class="text-sm text-gray-500">{new Date(item.timestamp).toLocaleString()}</p>

        {#if item.location}
          <p class="mt-1 text-xs text-gray-400">📍 {item.location}</p>
        {/if}
      </div>
    </li>
  {/each}
</ul>
				<!-- Toggle Button -->
				{#if trackingInfo.history.length > visibleCount}
					<div class="mt-4 flex justify-center">
						<button
							onclick={() => (showAll = !showAll)}
							class="flex items-center gap-2 rounded-full border border-blue-400 bg-white px-4 py-2 font-medium text-blue-600 shadow-sm transition hover:bg-blue-600 hover:text-white"
						>
							{#if showAll}
								<span>See Less</span>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="h-4 w-4"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M5 15l7-7 7 7"
									/>
								</svg>
							{:else}
								<span>See More</span>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="h-4 w-4"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M19 9l-7 7-7-7"
									/>
								</svg>
							{/if}
						</button>
					</div>
				{/if}
			</div>
		</div>
	{/if}

	<!-- 📘 FAQ / Accordion -->
	<div class="mt-24">
		<Accordion />
	</div>
</div>
