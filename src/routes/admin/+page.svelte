<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import PocketBase from 'pocketbase';
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
	let existingFiles: string[] = [];

	let historyEntries: { event: string; location?: string; timestamp: string }[] = [];
	let newHistoryEvent = '';
	let newHistoryLocation = '';
	let newHistoryTimestamp = '';

	const statuses = ['Pending', 'In-transit', 'Held at Customs', 'Delivered'];

	let formData: any = getEmptyForm();

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
		return date.toISOString().slice(0, 16);
	}

	function updateEstimatedDelivery(e) {
		const value = e.target.value;
		formData.estimated_delivery = value ? new Date(value).toISOString() : '';
	}

	async function loadShipments() {
		loading = true;
		try {
			const records = await pb.collection('shipments').getFullList({ sort: '-created' });
			shipments = records;
		} catch (err) {
			errorMsg = `Failed to load shipments: ${err.message || err}`;
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
		generateTracking();
		showForm = true;
	}

	function editShipment(item: any) {
		editing = item;
		existingFiles = Array.isArray(item.package_images) ? [...item.package_images] : [];
		localEstimatedDelivery = pbDateToLocalInput(item.estimated_delivery);
		formData = { ...getEmptyForm(), ...item };
		historyEntries = Array.isArray(item.history) ? [...item.history] : [];
		showForm = true;
	}

	function handleFileChange(e: Event) {
		const target = e.target as HTMLInputElement;
		if (!target.files) return;
		const files = Array.from(target.files);
		selectedFiles = [...selectedFiles, ...files];
		files.forEach((f) => filePreviews.push({ url: URL.createObjectURL(f), name: f.name, type: f.type }));
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
			existingFiles.splice(idx, 1);
			formData.package_images = [...existingFiles];
			await pb.collection('shipments').update(editing.id, { package_images: existingFiles });
			alert('Image removed.');
		} catch (err) {
			alert('Failed to remove image.');
		}
	}

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

	async function saveShipment() {
		if (!formData.tracking_number || !formData.origin || !formData.destination) {
			errorMsg = 'Tracking number, origin and destination are required';
			setTimeout(() => (errorMsg = null), 4000);
			return;
		}
		const fd = new FormData();
		for (const [k, v] of Object.entries({
			...formData,
			history: JSON.stringify(historyEntries)
		})) fd.append(k, String(v ?? ''));

		selectedFiles.forEach((file) => fd.append('package_images', file, file.name));

		try {
			if (editing) {
				await pb.collection('shipments').update(editing.id, fd);
				successMsg = 'Shipment updated';
			} else {
				await pb.collection('shipments').create(fd);
				successMsg = 'Shipment created';
			}
			setTimeout(() => (successMsg = null), 3000);
			showForm = false;
			await loadShipments();
		} catch (err) {
			errorMsg = err.message || 'Failed to save shipment';
			setTimeout(() => (errorMsg = null), 5000);
		}
	}

	async function deleteShipment(id: string) {
		if (!confirm('Delete this shipment?')) return;
		try {
			await pb.collection('shipments').delete(id);
			successMsg = 'Shipment deleted';
			setTimeout(() => (successMsg = null), 2500);
			await loadShipments();
		} catch {
			errorMsg = 'Failed to delete shipment';
		}
	}

	let unsubscribe: (() => void) | null = null;
	onMount(async () => {
		await loadShipments();
		const sub = pb.collection('shipments').subscribe('*', () => loadShipments());
		unsubscribe = () => sub.unsubscribe();
	});
	onDestroy(() => unsubscribe?.());
</script>



<div class="min-h-screen bg-gradient-to-br from-yellow-50 to-red-50 p-6">
	<div class="mx-auto max-w-7xl space-y-6">
		<header class="flex items-center justify-between">
			<h1 class="text-3xl font-extrabold text-red-700">📦 SwiftPort Logistics Dashboard</h1>
			<button class="btn btn-primary rounded-xl px-5" on:click={openNew}>➕ Add Shipment</button>
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
			<section
				class="rounded-2xl border border-red-100 bg-white/90 p-6 shadow-xl"
				transition:scale
			>
				<h2 class="mb-4 text-lg font-semibold text-slate-800">
					{editing ? '✏️ Edit Shipment' : '🚀 New Shipment'}
				</h2>

				<div class="grid gap-4 md:grid-cols-2">
					<!-- Input fields -->
					<div class="form-control">
						<label class="label"><span>Tracking Number</span></label>
						<input class="input input-bordered w-full" bind:value={formData.tracking_number} />
					</div>

					<div class="form-control">
						<label class="label"><span>Sender Name</span></label>
						<input class="input input-bordered w-full" bind:value={formData.sender_name} />
					</div>

					<div class="form-control">
						<label class="label"><span>Receiver Name</span></label>
						<input class="input input-bordered w-full" bind:value={formData.receiver_name} />
					</div>

					<div class="form-control">
						<label class="label"><span>Receiver Email</span></label>
						<input class="input input-bordered w-full" type="email" bind:value={formData.receiver_email} />
					</div>

					<div class="form-control">
						<label class="label"><span>Origin</span></label>
						<input class="input input-bordered w-full" bind:value={formData.origin} />
					</div>

					<div class="form-control">
						<label class="label"><span>Destination</span></label>
						<input class="input input-bordered w-full" bind:value={formData.destination} />
					</div>

					<div class="form-control">
						<label class="label"><span>Status</span></label>
						<select class="select select-bordered w-full" bind:value={formData.status}>
							{#each statuses as s}
								<option>{s}</option>
							{/each}
						</select>
					</div>

					<div class="form-control">
						<label class="label"><span>Estimated Delivery</span></label>
						<input type="datetime-local" class="input input-bordered w-full" bind:value={localEstimatedDelivery} on:change={updateEstimatedDelivery} />
					</div>
				</div>

				<!-- History -->
				<div class="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
					<h3 class="mb-2 text-sm font-bold text-slate-700">Tracking History</h3>
					<div class="grid grid-cols-1 gap-2 md:grid-cols-3">
						<input class="input input-sm input-bordered" placeholder="Event" bind:value={newHistoryEvent} />
						<input class="input input-sm input-bordered" placeholder="Location" bind:value={newHistoryLocation} />
						<input class="input input-sm input-bordered" placeholder="Timestamp (optional)" bind:value={newHistoryTimestamp} />
					</div>
					<div class="mt-2 flex gap-2">
						<button class="btn btn-outline btn-sm" on:click={addHistoryEntry}>Add</button>
						<button class="btn btn-sm" on:click={() => (historyEntries = [])}>Clear all</button>
					</div>
					{#if historyEntries.length}
						<ul class="mt-3 max-h-40 space-y-2 overflow-auto">
							{#each historyEntries as h, idx}
								<li class="flex items-start justify-between rounded-md bg-white p-2 shadow-sm">
									<div>
										<div class="text-sm font-semibold">{h.event}</div>
										<div class="text-xs text-slate-500">{h.location ?? '—'} • {new Date(h.timestamp).toLocaleString()}</div>
									</div>
									<button class="btn btn-ghost btn-xs text-red-500" on:click={() => removeHistoryEntry(idx)}>✕</button>
								</li>
							{/each}
						</ul>
					{/if}
				</div>

				<div class="mt-6 flex justify-end gap-2">
					<button class="btn" on:click={() => (showForm = false)}>Cancel</button>
					<button class="btn btn-success" on:click={saveShipment}>
						{editing ? 'Update' : 'Create'}
					</button>
				</div>
			</section>
		{/if}

		<section>
			{#if loading}
				<div class="p-6 text-center">Loading shipments…</div>
			{:else if !shipments.length}
				<div class="rounded-lg bg-white p-6 text-center shadow">
					📭 No shipments found.
				</div>
			{:else}
				<div class="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-xl">
					<table class="table table-zebra w-full">
						<thead class="sticky top-0 bg-red-600 text-white">
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
											class={`badge ${s.status === 'Delivered' ? 'badge-success' :
												s.status === 'Held at Customs' ? 'badge-warning' : 'badge-info'}`}>
											{s.status}
										</span>
									</td>
									<td>{s.current_location}</td>
									<td>${s.amount_due}</td>
									<td>{Array.isArray(s.history) ? s.history.length : 0}</td>
									<td>
										<div class="flex gap-1">
											<button class="btn btn-outline btn-xs" on:click={() => editShipment(s)}>Edit</button>
											<button class="btn btn-error btn-xs text-white" on:click={() => deleteShipment(s.id)}>Del</button>
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


