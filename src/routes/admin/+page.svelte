<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import PocketBase from 'pocketbase';
	import { fade } from 'svelte/transition';

	// <-- CHANGE THIS if you test from phone: use your PC LAN IP (e.g. http://192.168.43.101:8090)
	const pb = new PocketBase('http://127.0.0.1:8090');

	let shipments: any[] = [];
	let loading = true;
	let showForm = false;
	let editing: any = null;

	// Local date-time value for display in <input type="datetime-local">
	let localEstimatedDelivery = '';

	// Convert PocketBase ISO date → local datetime for input
	function pbDateToLocalInput(isoString) {
		if (!isoString) return '';
		const date = new Date(isoString);
		// Format for datetime-local input (YYYY-MM-DDTHH:mm)
		return date.toISOString().slice(0, 16);
	}

	// Convert datetime-local → PocketBase ISO string
	function updateEstimatedDelivery(e) {
		const value = e.target.value;
		formData.estimated_delivery = value ? new Date(value).toISOString() : '';
	}

	// UI messages
	let successMsg: string | null = null;
	let errorMsg: string | null = null;

	// local file selection & previews
	let selectedFiles: File[] = [];
	let filePreviews: { url: string; name: string; type: string }[] = [];
	// existing remote files on the record (filenames returned by PB)

	// Tracking history editor local
	let historyEntries: { event: string; location?: string; timestamp: string }[] = [];
	let newHistoryEvent = '';
	let newHistoryLocation = '';
	let newHistoryTimestamp = '';

	const statuses = ['Pending', 'In-transit', 'Held at Customs', 'Delivered'];

	// default form model
	let formData: any = getEmptyForm();
	let existingFiles: string[] = [];

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
			// package_images will be uploaded as files; existingFiles holds already-uploaded files
			package_images: []
		};
	}

	// load shipments (no sort to avoid created field issues)
	async function loadShipments() {
		loading = true;
		try {
			const records = await pb.collection('shipments').getFullList();
			shipments = records;
			console.log('Shipments loaded', shipments);
		} catch (err) {
			console.error('Failed to load shipments', err);
			errorMsg = `Failed to load shipments: ${err.message || err}`;
			setTimeout(() => (errorMsg = null), 5000);
		} finally {
			loading = false;
		}
	}

	// generate quick tracking number
	function generateTracking() {
		formData.tracking_number = `swift${Math.floor(Math.random() * 10000000)}`;
	}

	// open form for new record
	function openNew() {
		formData = getEmptyForm();
		historyEntries = [];
		selectedFiles = [];
		filePreviews = [];
		existingFiles = [];
		editing = null;
		generateTracking();
		showForm = true;
	}

	// open form for editing
	function editShipment(item: any) {
		editing = item;
		existingFiles = Array.isArray(item.package_images) ? [...item.package_images] : [];
		localEstimatedDelivery = pbDateToLocalInput(item.estimated_delivery);
		// copy fields from record into formData
		formData = {
			tracking_number: item.tracking_number || '',
			origin: item.origin || '',
			destination: item.destination || '',
			current_location: item.current_location || '',
			estimated_delivery: item.estimated_delivery || '',
			status: item.status || 'Pending',
			sender_name: item.sender_name || '',
			receiver_name: item.receiver_name || '',
			receiver_email: item.receiver_email || '',
			receiver_phone: item.receiver_phone || '',
			package_contents: item.package_contents || '',
			amount_due: item.amount_due ?? 0,
			payment_status: item.payment_status || 'Unpaid',
			payment_reason: item.payment_reason || '',
			weight: item.weight ?? 0,
			history: item.history || [],
			package_images: item.package_images || []
		};

		// history load for editing (work with JS array)
		historyEntries = Array.isArray(item.history) ? [...item.history] : [];

		// existingFiles to display already-uploaded files (filenames)
		existingFiles = Array.isArray(item.package_images) ? [...item.package_images] : [];

		selectedFiles = [];
		filePreviews = [];

		showForm = true;
	}

	// file input handler
	function handleFileChange(e: Event) {
		const target = e.target as HTMLInputElement;
		if (!target.files) return;

		// convert FileList to array and append
		const files = Array.from(target.files);
		selectedFiles = [...selectedFiles, ...files];

		// generate previews
		files.forEach((f) => {
			const url = URL.createObjectURL(f);
			filePreviews.push({ url, name: f.name, type: f.type });
		});
		// reset input value so same file can be reselected if desired
		target.value = '';
	}

	// remove a selected (not-yet-uploaded) file
	function removeSelectedFile(idx: number) {
		const removed = filePreviews.splice(idx, 1);
		selectedFiles.splice(idx, 1);
		// revoke object url
		if (removed[0]) URL.revokeObjectURL(removed[0].url);
	}

	// remove an existing file reference (this only removes the link from UI; to delete on server you'd need to update record with updated file list)
	// function removeExistingFile(idx: number) {
	// 	existingFiles.splice(idx, 1);
	// }
	async function removeExistingFile(idx: number) {
		if (!editing) return alert('No shipment selected to update.');
		if (!confirm('Remove this image from the shipment?')) return;

		try {
			// Remove from local array
			existingFiles.splice(idx, 1);

			// Update formData to reflect new list
			formData.package_images = [...existingFiles];

			// Push change to PocketBase
			await pb.collection('shipments').update(editing.id, {
				package_images: formData.package_images
			});

			alert('Image removed successfully.');
		} catch (err) {
			console.error('Failed to remove image:', err);
			alert('Failed to remove image.');
		}
	}

	// history editor helpers
	function addHistoryEntry() {
		if (!newHistoryEvent.trim()) return;
		historyEntries.unshift({
			event: newHistoryEvent.trim(),
			location: newHistoryLocation.trim() || undefined,
			timestamp: newHistoryTimestamp || new Date().toISOString()
		});
		newHistoryEvent = '';
		newHistoryLocation = '';
		newHistoryTimestamp = '';
	}

	function removeHistoryEntry(i: number) {
		historyEntries.splice(i, 1);
	}

	// build payload and save (create or update)
	async function saveShipment() {
		// basic validation
		if (!formData.tracking_number || !formData.origin || !formData.destination) {
			errorMsg = 'Tracking number, origin and destination are required';
			setTimeout(() => (errorMsg = null), 4000);
			return;
		}

		// build FormData so file uploads are handled
		const fd = new FormData();

		// append regular fields. Append as strings
		const fieldsToAppend: any = {
			tracking_number: formData.tracking_number,
			origin: formData.origin,
			destination: formData.destination,
			current_location: formData.current_location || '',
			estimated_delivery: formData.estimated_delivery || '',
			status: formData.status,
			sender_name: formData.sender_name,
			receiver_name: formData.receiver_name,
			receiver_email: formData.receiver_email,
			receiver_phone: formData.receiver_phone,
			package_contents: formData.package_contents,
			amount_due:
				typeof formData.amount_due === 'number'
					? formData.amount_due
					: Number(formData.amount_due || 0),
			payment_status: formData.payment_status,
			payment_reason: formData.payment_reason,
			weight: typeof formData.weight === 'number' ? formData.weight : Number(formData.weight || 0)
		};

		for (const k in fieldsToAppend) {
			fd.append(k, String(fieldsToAppend[k] ?? ''));
		}

		// history: merge existing history (if any) with edited entries
		// if editing, prefer historyEntries (the UI) otherwise keep current
		const finalHistory = historyEntries.length ? historyEntries : formData.history || [];
		fd.append('history', JSON.stringify(finalHistory));

		// If there are selected new files, append them
		selectedFiles.forEach((file) => {
			// append multiple files under same field name: "package_images"
			fd.append('package_images', file, file.name);
		});

		// If there are existingFiles (filenames), we want to preserve them as well.
		// PocketBase will keep already uploaded files unless overwritten; but when using FormData for update without explicitly changing files,
		// existing ones remain. If we want to send an explicit array, append JSON string of filenames (only if needed).
		if (existingFiles && existingFiles.length) {
			// append as JSON string so the server knows about them if needed
			// (not strictly required in many PB setups)
			fd.append('existing_files', JSON.stringify(existingFiles));
		}

		try {
			if (editing && editing.id) {
				// update
				await pb.collection('shipments').update(editing.id, fd);
				successMsg = 'Shipment updated';
			} else {
				// create
				await pb.collection('shipments').create(fd);
				successMsg = 'Shipment created';
			}

			// small UI feedback
			setTimeout(() => (successMsg = null), 3000);

			// reset and reload list
			resetForm();
			showForm = false;
			localEstimatedDelivery = '';
			await loadShipments();
		} catch (err: any) {
			console.error('Save failed:', err);
			errorMsg = err?.message || 'Failed to save shipment';
			setTimeout(() => (errorMsg = null), 5000);
		}
	}

	function resetForm() {
		formData = getEmptyForm();
		selectedFiles.forEach((f, i) => {
			if (filePreviews[i]) URL.revokeObjectURL(filePreviews[i].url);
		});
		selectedFiles = [];
		filePreviews = [];
		historyEntries = [];
		existingFiles = [];
		editing = null;
	}

	// delete record
	async function deleteShipment(id: string) {
		if (!confirm('Delete this shipment? This cannot be undone.')) return;
		try {
			await pb.collection('shipments').delete(id);
			successMsg = 'Shipment deleted';
			setTimeout(() => (successMsg = null), 2500);
			await loadShipments();
		} catch (err) {
			console.error('delete failed', err);
			errorMsg = 'Failed to delete shipment';
			setTimeout(() => (errorMsg = null), 3000);
		}
	}

	// real-time subscription handle
	let unsubscribe: (() => void) | null = null;

	onMount(async () => {
		await loadShipments();

		try {
			const sub = pb.collection('shipments').subscribe('*', (e) => {
				// you can inspect e.action (create/update/delete) for more intelligent updates
				loadShipments();
			});
			unsubscribe = () => sub.unsubscribe();
		} catch (err) {
			console.warn('Realtime subscribe failed (probably not critical)', err);
		}
	});

	onDestroy(() => {
		if (unsubscribe) unsubscribe();
		// revoke any object URLs
		filePreviews.forEach((p) => URL.revokeObjectURL(p.url));
	});
</script>

<div class="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-100 p-6">
	<div class="mx-auto mt-22 max-w-7xl">
		<header class="mb-6 flex items-center justify-between">
			<h1 class="text-3xl font-extrabold text-blue-700">📦 Shipment Admin Dashboard</h1>
			<div>
				<button class="btn rounded-lg btn-primary" on:click={openNew}>➕ Add Shipment</button>
			</div>
		</header>

		{#if successMsg}
			<div
				class="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-green-800"
				transition:fade
			>
				{successMsg}
			</div>
		{/if}

		{#if errorMsg}
			<div class="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-red-800" transition:fade>
				{errorMsg}
			</div>
		{/if}

		{#if showForm}
			<section
				class="mb-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-lg"
				transition:fade
			>
				<h2 class="mb-4 text-lg font-semibold text-slate-800">
					{editing ? 'Edit Shipment' : 'New Shipment'}
				</h2>

				<div class="form-grid">
					<div>
						<label class="mb-1 block text-sm font-semibold text-slate-600">Tracking Number</label>
						<input
							class="input-bordered input w-full"
							bind:value={formData.tracking_number}
							placeholder="Tracking number"
						/>
					</div>

					<div>
						<label class="mb-1 block text-sm font-semibold text-slate-600">Sender Name</label>
						<input
							class="input-bordered input w-full"
							bind:value={formData.sender_name}
							placeholder="Sender name"
						/>
					</div>

					<div>
						<label class="mb-1 block text-sm font-semibold text-slate-600">Receiver Name</label>
						<input
							class="input-bordered input w-full"
							bind:value={formData.receiver_name}
							placeholder="Receiver name"
						/>
					</div>

					<div>
						<label class="mb-1 block text-sm font-semibold text-slate-600">Receiver Email</label>
						<input
							class="input-bordered input w-full"
							bind:value={formData.receiver_email}
							type="email"
							placeholder="Receiver email"
						/>
					</div>

					<div>
						<label class="mb-1 block text-sm font-semibold text-slate-600">Receiver Phone</label>
						<input
							class="input-bordered input w-full"
							bind:value={formData.receiver_phone}
							placeholder="Receiver phone"
						/>
					</div>

					<div>
						<label class="mb-1 block text-sm font-semibold text-slate-600">Origin</label>
						<input
							class="input-bordered input w-full"
							bind:value={formData.origin}
							placeholder="Origin"
						/>
					</div>

					<div>
						<label class="mb-1 block text-sm font-semibold text-slate-600">Destination</label>
						<input
							class="input-bordered input w-full"
							bind:value={formData.destination}
							placeholder="Destination"
						/>
					</div>

					<div>
						<label class="mb-1 block text-sm font-semibold text-slate-600">Current Location</label>
						<input
							class="input-bordered input w-full"
							bind:value={formData.current_location}
							placeholder="Current location"
						/>
					</div>

					<div>
						<label class="mb-1 block text-sm font-semibold text-slate-600">
							Estimated Delivery
						</label>
						<input
							class="input-bordered input w-full"
							type="datetime-local"
							bind:value={localEstimatedDelivery}
							on:change={updateEstimatedDelivery}
						/>
					</div>

					<div>
						<label class="mb-1 block text-sm font-semibold text-slate-600">Status</label>
						<select class="select-bordered select w-full" bind:value={formData.status}>
							{#each statuses as s}
								<option value={s}>{s}</option>
							{/each}
						</select>
					</div>

					<div>
						<label class="mb-1 block text-sm font-semibold text-slate-600">Weight (kg)</label>
						<input
							class="input-bordered input w-full"
							bind:value={formData.weight}
							type="number"
							step="0.1"
						/>
					</div>

					<div>
						<label class="mb-1 block text-sm font-semibold text-slate-600">Amount Due ($)</label>
						<input
							class="input-bordered input w-full"
							bind:value={formData.amount_due}
							type="number"
						/>
					</div>

					<div>
						<label class="mb-1 block text-sm font-semibold text-slate-600">Payment Status</label>
						<select class="select-bordered select w-full" bind:value={formData.payment_status}>
							<option>Unpaid</option>
							<option>Paid</option>
						</select>
					</div>

					<div>
						<label class="mb-1 block text-sm font-semibold text-slate-600">Payment Reason</label>
						<input
							class="input-bordered input w-full"
							bind:value={formData.payment_reason}
							placeholder="Payment reason"
						/>
					</div>

					<div class="md:col-span-2">
						<label class="mb-1 block text-sm font-semibold text-slate-600">Package Contents</label>
						<textarea
							class="textarea-bordered textarea w-full"
							bind:value={formData.package_contents}
							rows="3"
							placeholder="Describe package contents"
						></textarea>
					</div>
				</div>

				<!-- History editor -->
				<div class="mt-6 rounded-lg border border-gray-100 bg-gray-50 p-4">
					<h3 class="mb-2 text-sm font-semibold text-slate-700">Tracking History</h3>

					<div class="grid grid-cols-1 gap-2 md:grid-cols-3">
						<input
							class="input-bordered input input-sm"
							bind:value={newHistoryEvent}
							placeholder="Event (e.g., Arrived at hub)"
						/>
						<input
							class="input-bordered input input-sm"
							bind:value={newHistoryLocation}
							placeholder="Location (optional)"
						/>
						<input
							class="input-bordered input input-sm"
							bind:value={newHistoryTimestamp}
							placeholder="Timestamp (ISO or leave empty)"
						/>
					</div>

					<div class="mt-2 flex gap-2">
						<button class="btn btn-outline btn-sm" on:click={addHistoryEntry}>Add history</button>
						<button
							class="btn btn-sm"
							on:click={() => {
								historyEntries = [];
							}}>Clear all</button
						>
					</div>

					{#if historyEntries.length}
						<ul class="mt-3 max-h-40 space-y-2 overflow-auto">
							{#each historyEntries as h, idx}
								<li class="flex items-start justify-between rounded-md bg-white p-2 shadow-sm">
									<div>
										<div class="text-sm font-semibold text-slate-700">{h.event}</div>
										<div class="text-xs text-slate-500">
											{h.location ?? '—'} • {new Date(h.timestamp).toLocaleString()}
										</div>
									</div>
									<button
										class="btn text-red-500 btn-ghost btn-xs"
										on:click={() => removeHistoryEntry(idx)}>Remove</button
									>
								</li>
							{/each}
						</ul>
					{/if}
				</div>

				<!-- Files -->
				<div class="mt-6">
					<h3 class="mb-2 text-sm font-semibold text-slate-700">Package Images / Videos</h3>
					<input
						class="file-input-bordered file-input w-full"
						type="file"
						multiple
						accept="image/*,video/*"
						on:change={handleFileChange}
					/>

					{#if existingFiles.length}
						<div class="mt-3 grid grid-cols-3 gap-2">
							{#each existingFiles as f, i}
								<div class="relative overflow-hidden rounded-md border bg-white p-1">
									{#if f.match(/\.(mp4|mov|webm)$/i)}
										<video
											class="h-28 w-full object-cover"
											src={`http://127.0.0.1:8090/api/files/shipments/${editing?.id}/${f}`}
											controls
										></video>
									{:else}
										<img
											class="h-28 w-full object-cover"
											src={`http://127.0.0.1:8090/api/files/shipments/${editing?.id}/${f}`}
											alt={f}
										/>
									{/if}
									<button
										class="btn absolute top-1 right-1 text-red-500 btn-ghost btn-xs"
										on:click={() => removeExistingFile(i)}>✕</button
									>
								</div>
							{/each}
						</div>
					{/if}

					{#if filePreviews.length}
						<div class="mt-3 grid grid-cols-3 gap-2">
							{#each filePreviews as p, idx}
								<div class="relative overflow-hidden rounded-md border bg-white p-1">
									{#if p.type.startsWith('video')}
										<video class="h-28 w-full object-cover" src={p.url} controls></video>
									{:else}
										<img class="h-28 w-full object-cover" src={p.url} alt={p.name} />
									{/if}
									<button
										class="btn absolute top-1 right-1 text-red-500 btn-ghost btn-xs"
										on:click={() => removeSelectedFile(idx)}>✕</button
									>
									<div class="mt-1 truncate text-xs">{p.name}</div>
								</div>
							{/each}
						</div>
					{/if}
				</div>

				<!-- actions -->
				<div class="mt-6 flex items-center justify-end gap-2">
					<button class="btn btn-ghost" on:click={() => (showForm = false)}>Cancel</button>
					<button class="btn btn-success" on:click={saveShipment}
						>{editing ? 'Update shipment' : 'Create shipment'}</button
					>
				</div>
			</section>
		{/if}

		<!-- Shipments Table -->
		<section>
			{#if loading}
				<div class="rounded-lg bg-white p-6 text-center shadow-sm">Loading shipments…</div>
			{:else if shipments.length === 0}
				<div class="rounded-lg bg-white p-6 text-center shadow-sm">No shipments found.</div>
			{:else}
				<div class="overflow-x-auto rounded-2xl border border-gray-100 bg-white p-4 shadow-lg">
					<table class="table w-full">
						<thead class="bg-blue-600 text-white">
							<tr>
								<th>Tracking</th>
								<th>Sender</th>
								<th>Receiver</th>
								<th>Status</th>
								<th>Location</th>
								<th>Amount</th>
								<th>History</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{#each shipments as s (s.id)}
								<tr class="hover:bg-blue-50">
									<td class="font-medium">{s.tracking_number}</td>
									<td>{s.sender_name}</td>
									<td>{s.receiver_name}</td>
									<td>
										<span
											class={`badge ${s.status === 'Delivered' ? 'badge-success' : s.status === 'Held at Customs' ? 'badge-warning' : 'badge-info'}`}
											>{s.status}</span
										>
									</td>
									<td>{s.current_location}</td>
									<td>${s.amount_due}</td>
									<td>
										{#if Array.isArray(s.history) && s.history.length}
											<span class="text-xs text-slate-600">{s.history.length} events</span>
										{:else}
											<span class="text-xs text-slate-400">—</span>
										{/if}
									</td>
									<td class="space-x-1">
										<button class="btn btn-outline btn-xs" on:click={() => editShipment(s)}
											>Edit</button
										>
										<button
											class="btn text-white btn-xs btn-error"
											on:click={() => deleteShipment(s.id)}>Delete</button
										>
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
	/* small helpers */
	.form-grid {
		display: grid;
		gap: 0.75rem;
		grid-template-columns: 1fr;
	}
	@media (min-width: 768px) {
		.form-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}
</style>
