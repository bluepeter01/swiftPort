<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import PocketBase from 'pocketbase';
	import { goto } from '$app/navigation';
	import { fade, fly, scale } from 'svelte/transition';

	const pb = new PocketBase('https://jpi.sophnexacademy.com.ng');

	let shipments: any[] = [];
	let loading = true;
	let showForm = false;
	let editing: any = null;

	let localEstimatedDelivery = '';
	let successMsg: string | null = null;
	let errorMsg: string | null = null;

	let selectedFiles: File[] = [];
	let filePreviews: { url: string; name: string; type: string }[] = [];
	let existingFiles: string[] = []; // filenames stored on record (for editing)

	let historyEntries: { event: string; location?: string; timestamp: string }[] = [];
	let newHistoryEvent = '';
	let newHistoryLocation = '';
	let newHistoryTimestamp = '';

	const statuses = ['Pending', 'In-transit', 'Held at Customs', 'Delivered'];
	const paymentStatuses = ['Unpaid', 'Paid', 'Partially Paid', 'Refunded'];

	let formData: any = getEmptyForm();

	function localInputToPbDate(local: string) {
		if (!local) return '';
		return new Date(local).toISOString();
	}

	async function logout() {
		const response = await fetch('/api/admin-logout', {
			method: 'POST'
		});

		if (response.ok) {
			await goto('/admin/login');
		} else {
			alert('Logout failed. Please try again.');
		}
	}

	function getEmptyForm() {
		return {
			tracking_number: '',
			origin: '',
			destination: '',
			current_location: '',
			estimated_delivery: '',
			status: 'Pending',
			sender_name: '',
			receiver_name: '',
			receiver_email: '',
			receiver_phone: '',
			package_contents: '',
			amount_due: 0,
			payment_status: 'Unpaid',
			payment_reason: '',
			weight: 0,
			history: [],
			package_images: []
		};
	}

	function pbDateToLocalInput(isoString) {
		if (!isoString) return '';
		const date = new Date(isoString);
		// format to yyyy-mm-ddThh:mm for input[type=datetime-local]
		const tzOffsetMs = date.getTimezoneOffset() * 60000;
		const localISO = new Date(date.getTime() - tzOffsetMs).toISOString().slice(0, 16);
		return localISO;
	}

	function updateEstimatedDelivery(e) {
		const value = (e.target as HTMLInputElement).value;
		formData.estimated_delivery = value ? new Date(value).toISOString() : '';
	}

	async function loadShipments() {
		loading = true;
		try {
			const records = await pb.collection('shipments').getFullList({ sort: '-created' });
			shipments = records.map((r) => ({
				...r,
				history: Array.isArray(r.history) ? r.history : [] // ensures array
			}));
		} catch (err) {
			errorMsg = `Failed to load shipments: ${err?.message ?? err}`;
			setTimeout(() => (errorMsg = null), 4000);
		} finally {
			loading = false;
		}
	}

	function generateTracking() {
		formData.tracking_number = `swift${Math.floor(Math.random() * 10000000)}`;
	}

	function openNew() {
		formData = getEmptyForm();
		historyEntries = [];
		selectedFiles = [];
		filePreviews = [];
		existingFiles = [];
		editing = null;
		localEstimatedDelivery = '';
		generateTracking();
		showForm = true;
	}

	function editShipment(item: any) {
		editing = item;
		existingFiles = Array.isArray(item.package_images) ? [...item.package_images] : [];
		localEstimatedDelivery = pbDateToLocalInput(item.estimated_delivery);
		formData = { ...getEmptyForm(), ...item };

		historyEntries = Array.isArray(item.history) ? [...item.history] : []; // <— bind history
		selectedFiles = [];
		filePreviews = [];
		showForm = true;
	}

	function handleFileChange(e: Event) {
		const target = e.target as HTMLInputElement;
		if (!target.files) return;
		const files = Array.from(target.files);
		selectedFiles = [...selectedFiles, ...files];
		files.forEach((f) =>
			filePreviews.push({ url: URL.createObjectURL(f), name: f.name, type: f.type })
		);
		target.value = '';
	}

	function removeSelectedFile(idx: number) {
		URL.revokeObjectURL(filePreviews[idx].url);
		filePreviews.splice(idx, 1);
		selectedFiles.splice(idx, 1);
	}

	async function removeExistingFile(idx: number) {
		if (!editing) return alert('No shipment selected.');
		if (!confirm('Remove this image?')) return;
		try {
			// remove from local list
			const removed = existingFiles.splice(idx, 1);
			// update record to drop that file
			await pb.collection('shipments').update(editing.id, { package_images: existingFiles });
			// reflect locally
			formData.package_images = [...existingFiles];
			alert('Image removed.');
		} catch (err: any) {
			alert('Failed to remove image.');
		}
	}

	function addHistoryEntry() {
		if (!newHistoryEvent.trim()) return;

		const isoTimestamp = newHistoryTimestamp
			? new Date(newHistoryTimestamp).toISOString()
			: new Date().toISOString();

		historyEntries.unshift({
			event: newHistoryEvent.trim(),
			location: newHistoryLocation.trim() || undefined,
			timestamp: isoTimestamp
		});

		newHistoryEvent = '';
		newHistoryLocation = '';
		newHistoryTimestamp = '';
	}

	async function removeHistoryEntry(entryToRemove: any) {
		if (!editing?.id) return alert('No shipment selected.');
		if (!confirm('Are you sure you want to delete this history entry?')) return;

		const indexToRemove = historyEntries.findIndex((entry) => entry === entryToRemove);
		if (indexToRemove === -1) return;
		historyEntries.splice(indexToRemove, 1);

		try {
			await pb.collection('shipments').update(editing.id, { history: historyEntries });
			successMsg = 'History entry removed';
			setTimeout(() => (successMsg = null), 2500);
		} catch (err: any) {
			errorMsg = 'Failed to remove history entry';
			setTimeout(() => (errorMsg = null), 3000);
		}
	}

	async function clearAllHistory() {
		if (!editing?.id) return alert('No shipment selected.');

		if (!confirm('Are you sure you want to clear all history?')) return;

		historyEntries = [];

		try {
			await pb.collection('shipments').update(editing.id, { history: [] });
			successMsg = 'All history cleared';
			setTimeout(() => (successMsg = null), 2500);
		} catch (err: any) {
			errorMsg = 'Failed to clear history';
			setTimeout(() => (errorMsg = null), 3000);
		}
	}

	// Save shipment: uses FormData so files upload OK via PocketBase
	async function saveShipment(event: Event) {
		event.preventDefault();
		try {
			// Build the data to save
			const data: any = {
				...formData,
				estimated_delivery: localInputToPbDate(localEstimatedDelivery),
				history: historyEntries, // <-- include the array properly
				package_images: [...existingFiles] // start with existing images
			};

			// If user uploaded new files, add them
			if (selectedFiles.length > 0) {
				const uploadedFiles = await uploadFiles(selectedFiles);
				data.package_images = [...existingFiles, ...uploadedFiles];
			}

			if (editing?.id) {
				// Update record
				await pb.collection('shipments').update(editing.id, data);
			} else {
				// Create new record
				await pb.collection('shipments').create(data);
			}

			showForm = false;
			await loadShipments();
			alert('Shipment saved successfully!');
		} catch (err: any) {
			alert(`Error saving shipment: ${err?.message ?? err}`);
		}
	}

	async function deleteShipment(id: string) {
		if (!confirm('Delete this shipment?')) return;
		try {
			await pb.collection('shipments').delete(id);
			successMsg = 'Shipment deleted';
			setTimeout(() => (successMsg = null), 2500);
			await loadShipments();
		} catch (err: any) {
			errorMsg = 'Failed to delete shipment';
			setTimeout(() => (errorMsg = null), 3000);
		}
	}

	let unsubscribe: (() => void) | null = null;
	onMount(async () => {
		await loadShipments();

		// subscribe once
		const sub = pb.collection('shipments').subscribe('*', () => {
			// only reload if the form is not open
			if (!showForm) loadShipments();
		});
		unsubscribe = () => sub.unsubscribe();
	});

	onDestroy(() => unsubscribe?.());
</script>

<div class="mt-18 min-h-screen bg-gradient-to-br from-yellow-50 to-red-50 p-6">
	<div class="mx-auto max-w-7xl space-y-6">
		<header class="flex items-center justify-between">
			<h1 class="text-3xl font-extrabold text-blue-700">📦 SwiftPort Logistics Dashboard</h1>
			<div class="flex items-center gap-2">
				<button class="btn rounded-xl px-5 btn-primary" on:click={openNew}>➕ Add Shipment</button>
				<button class="btn rounded-xl btn-outline btn-error" on:click={logout}>Logout</button>
			</div>
		</header>

		{#if successMsg}
			<div class="alert alert-success shadow-md" transition:fly={{ y: 10 }}>
				{successMsg}
			</div>
		{/if}

		{#if errorMsg}
			<div class="alert alert-error shadow-md" transition:fly={{ y: 10 }}>
				{errorMsg}
			</div>
		{/if}

		{#if showForm}
			<form
				class="rounded-2xl border border-red-100 bg-white/90 p-6 shadow-xl"
				transition:scale
				on:submit={saveShipment}
			>
				<h2 class="mb-4 text-lg font-semibold text-slate-800">
					{editing ? '✏️ Edit Shipment' : '🚀 New Shipment'}
				</h2>

				<div class="grid gap-4 md:grid-cols-2">
					<!-- Column 1 -->
					<div class="space-y-2">
						<div class="form-control mb-2">
							<label for="tracking_number" class="label"><span>Tracking Number</span></label>
							<div class="flex gap-2">
								<input
									class="input-bordered input w-full"
									id="tracking_number"
									bind:value={formData.tracking_number}
									required
								/>
								<button class="btn btn-ghost" on:click={generateTracking}>Gen</button>
							</div>
						</div>

						<div class="form-control mb-2">
							<label for="sender_name" class="label"><span>Sender Name</span></label>
							<input
								class="input-bordered input w-full"
								id="sender_name"
								bind:value={formData.sender_name}
								required
							/>
						</div>

						<div class="form-control mb-2">
							<label for="receiver_name" class="label"><span>Receiver Name</span></label>
							<input
								class="input-bordered input w-full"
								id="receiver_name"
								bind:value={formData.receiver_name}
								required
							/>
						</div>

						<div class="form-control mb-2">
							<label for="receiver_email" class="label"><span>Receiver Email</span></label>
							<input
								class="input-bordered input w-full"
								type="email"
								id="receiver_email"
								bind:value={formData.receiver_email}
								required
							/>
						</div>

						<div class="form-control mb-2">
							<label for="receiver_phone" class="label"><span>Receiver Phone</span></label>
							<input
								class="input-bordered input w-full"
								id="receiver_phone"
								bind:value={formData.receiver_phone}
								required
							/>
						</div>

						<div class="form-control mb-2">
							<label for="package_contents" class="label"><span>Package Contents</span></label>
							<textarea
								class="textarea-bordered textarea w-full"
								rows="3"
								id="package_contents"
								bind:value={formData.package_contents}
								required
							></textarea>
						</div>

						<div class="grid grid-cols-2 gap-2">
							<div class="form-control">
								<label for="weight" class="label"><span>Weight (kg)</span></label>
								<input
									class="input-bordered input"
									type="number"
									id="weight"
									min="0"
									step="0.01"
									bind:value={formData.weight}
									required
								/>
							</div>

							<div class="form-control">
								<label for="amount_due" class="label"><span>Amount Due (USD)</span></label>
								<input
									class="input-bordered input"
									type="number"
									id="amount_due"
									min="0"
									step="0.01"
									bind:value={formData.amount_due}
									required
								/>
							</div>
						</div>
					</div>

					<!-- Column 2 -->
					<div class="space-y-2">
						<div class="form-control mb-2">
							<label for="origin" class="label"><span>Origin</span></label>
							<input
								class="input-bordered input w-full"
								id="origin"
								bind:value={formData.origin}
								required
							/>
						</div>

						<div class="form-control mb-2">
							<label for="destination" class="label"><span>Destination</span></label>
							<input
								class="input-bordered input w-full"
								id="destination"
								bind:value={formData.destination}
								required
							/>
						</div>

						<div class="form-control mb-2">
							<label for="current_location" class="label"><span>Current Location</span></label>
							<input
								class="input-bordered input w-full"
								id="current_location"
								bind:value={formData.current_location}
							/>
						</div>

						<div class="form-control mb-2">
							<label for="status" class="label"><span>Status</span></label>
							<select
								class="select-bordered select w-full"
								id="status"
								bind:value={formData.status}
							>
								{#each statuses as s}
									<option>{s}</option>
								{/each}
							</select>
						</div>

						<div class="form-control mb-2">
							<label for="estimated_delivery" class="label"><span>Estimated Delivery</span></label>
							<input
								type="datetime-local"
								id="estimated_delivery"
								class="input-bordered input w-full"
								bind:value={localEstimatedDelivery}
								required
								on:change={updateEstimatedDelivery}
							/>
						</div>

						<div class="form-control mb-2">
							<label for="payment_status" class="label"><span>Payment Status</span></label>
							<select
								class="select-bordered select w-full"
								id="payment_status"
								bind:value={formData.payment_status}
							>
								{#each paymentStatuses as p}
									<option>{p}</option>
								{/each}
							</select>
						</div>

						<div class="form-control mb-2">
							<label for="payment_reason" class="label"><span>Payment Reason</span></label>
							<input
								class="input-bordered input w-full"
								id="payment_reason"
								bind:value={formData.payment_reason}
							/>
						</div>
					</div>
				</div>

				<!-- Files -->
				<!-- <div class="mt-4">
					<label class="label"><span>Package Images</span></label>

					{#if editing && existingFiles.length}
						<div class="mb-3">
							<div class="text-sm font-semibold mb-2">Existing images</div>
							<div class="image-grid">
								{#each existingFiles as ef, i}
									<div class="relative">
										Show image from PocketBase files endpoint; adapt URL as needed
										<img src={`https://jpi.sophnexacademy.com.ng/api/files/shipments/${editing.id}/${ef}`} alt={ef} class="thumb" />
										<button class="btn btn-xs btn-ghost absolute top-0 right-0" on:click={() => removeExistingFile(i)}>✕</button>
									</div>
								{/each}
							</div>
						</div>
					{/if}

					<div class="mb-2">
						<input type="file" multiple accept="image/*" on:change={handleFileChange} />
					</div>

					{#if filePreviews.length}
						<div class="mb-2">
							<div class="text-sm font-semibold mb-2">New uploads</div>
							<div class="image-grid">
								{#each filePreviews as fp, i}
									<div class="relative">
										<img src={fp.url} alt={fp.name} class="thumb" />
										<button class="btn btn-xs btn-ghost absolute top-0 right-0" on:click={() => removeSelectedFile(i)}>✕</button>
									</div>
								{/each}
							</div>
						</div>
					{/if}
				</div> -->

				<!-- History -->
				<div class="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
					<h3 class="mb-2 text-sm font-bold text-slate-700">Tracking History</h3>
					<div class="grid grid-cols-1 gap-2 md:grid-cols-3">
						<input
							class="input-bordered input input-sm"
							placeholder="Event"
							bind:value={newHistoryEvent}
						/>
						<input
							class="input-bordered input input-sm"
							placeholder="Location"
							bind:value={newHistoryLocation}
						/>
						<input
							type="datetime-local"
							class="input-bordered input input-sm"
							bind:value={newHistoryTimestamp}
						/>
					</div>
					<div class="mt-2 flex gap-2">
						<button class="btn btn-outline btn-sm" on:click={addHistoryEntry}>Add</button>
						<button class="btn btn-sm" on:click={clearAllHistory}>Clear all</button>
					</div>

					{#if historyEntries.length}
						<ul class="mt-3 max-h-40 space-y-2 overflow-auto">
							<!-- Sort here for display only, so original array indices are preserved -->
							{#each [...historyEntries].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) as h}
								<li class="flex items-start justify-between rounded-md bg-white p-2 shadow-sm">
									<div>
										<div class="text-sm font-semibold">{h.event}</div>
										<div class="text-xs text-slate-500">
											{h.location || '—'} •
											{new Date(h.timestamp).toLocaleString()}
										</div>
									</div>
									<button
										class="btn text-red-500 btn-ghost btn-xs"
										on:click={() => removeHistoryEntry(h)}>✕</button
									>
								</li>
							{/each}
						</ul>
					{/if}
				</div>

				<div class="mt-6 flex justify-end gap-2">
					<button type="button" class="btn" on:click={() => (showForm = false)}>Cancel</button>
					<button type="submit" class="btn btn-success">
						{editing ? 'Update' : 'Create'}
					</button>
				</div>
			</form>
		{/if}

		<section>
			{#if loading}
				<div class="p-6 text-center">Loading shipments…</div>
			{:else if !shipments.length}
				<div class="rounded-lg bg-white p-6 text-center shadow">📭 No shipments found.</div>
			{:else}
				<div class="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-xl">
					<table class="table w-full table-zebra">
						<thead class="sticky top-0 bg-blue-600 text-white">
							<tr>
								<th>Tracking</th>
								<th>Sender</th>
								<th>Receiver</th>
								<th>Status</th>
								<th>Location</th>
								<th>Amount</th>
								<th>History</th>
								<th></th>
							</tr>
						</thead>
						<tbody>
							{#each shipments as s (s.id)}
								<tr transition:fade>
									<td class="font-semibold">{s.tracking_number}</td>
									<td>{s.sender_name}</td>
									<td>{s.receiver_name}</td>
									<td>
										<span
											class={`badge ${s.status === 'Delivered' ? 'badge-success' : s.status === 'Held at Customs' ? 'badge-warning' : 'badge-info'}`}
										>
											{s.status}
										</span>
									</td>
									<td>{s.current_location}</td>
									<td>${s.amount_due}</td>
									<td>{Array.isArray(s.history) ? s.history.length : 0}</td>
									<td>
										<div class="flex gap-1">
											<button class="btn btn-outline btn-xs" on:click={() => editShipment(s)}
												>Edit</button
											>
											<button
												class="btn text-white btn-xs btn-error"
												on:click={() => deleteShipment(s.id)}>Delete</button
											>
										</div>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</section>
	</div>
</div>

<style>
	/* small helper for image grid */
	.image-grid {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
	}
	.thumb {
		width: 72px;
		height: 72px;
		object-fit: cover;
		border-radius: 6px;
		border: 1px solid rgba(0, 0, 0, 0.06);
	}
</style>
