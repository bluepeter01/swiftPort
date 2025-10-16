<script lang="ts">
	import { fade, fly, scale } from 'svelte/transition';
	import { writable } from 'svelte/store';

	const showModal = writable(false);
	const selectedJob = writable<{ title: string; location: string } | null>(null);

	function openModal(job) {
		selectedJob.set(job);
		showModal.set(true);
	}

	function closeModal() {
		showModal.set(false);
		setTimeout(() => selectedJob.set(null), 300);
	}

	const jobs = [
		{ title: 'Logistics Coordinator', location: 'New York, USA' },
		{ title: 'Warehouse Supervisor', location: 'Hamburg, Germany' },
		{ title: 'Customer Support Agent(Remote)', location: 'Global' },
		{ title: 'Software Engineer (Remote)', location: 'Global' },
		{ title: 'Fleet Manager', location: 'Dubai, UAE' },
		{ title: 'Marketing Specialist', location: 'London, UK' }
	];
</script>

<section
	class="mt-18 min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-100 px-6 py-16 text-gray-800"
>
	<div in:fly={{ y: 30, duration: 600 }} class="mx-auto max-w-4xl text-center">
		<h1 class="mb-4 text-4xl font-extrabold text-blue-700">Join the SwiftPort Family</h1>
		<p class="mb-10 text-lg text-gray-600">
			At <span class="font-semibold text-blue-600">SwiftPort Logistics</span>, we’re redefining what
			it means to deliver — not just parcels, but
			<strong>innovation, connection, and opportunity</strong>. Join our global team and be part of
			a movement that connects businesses and people worldwide.
		</p>
	</div>

	<div
		class="mx-auto grid max-w-6xl gap-8 md:grid-cols-2 lg:grid-cols-3"
		in:fade={{ delay: 200, duration: 800 }}
	>
		{#each jobs as job}
			<div
				class="rounded-2xl bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
			>
				<h2 class="text-xl font-semibold text-blue-600">{job.title}</h2>
				<p class="mb-4 text-gray-500">{job.location}</p>
				<button
					class="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700"
					on:click={() => openModal(job)}
				>
					Apply Now
				</button>
			</div>
		{/each}
	</div>

	<!-- Modal -->
	{#if $showModal}
		<div
			class="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black backdrop-blur-sm"
			in:fade
			out:fade
		>
			<div
				class="w-11/12 max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl"
				in:scale={{ duration: 250 }}
				out:scale={{ duration: 150 }}
			>
				<h2 class="mb-3 text-2xl font-bold text-blue-700">Application Unavailable</h2>
				{#if $selectedJob}
					<p class="mb-5 text-gray-600">
						Unfortunately, the position of <span class="font-semibold text-blue-600"
							>{$selectedJob.title}</span
						>
						in <span class="font-semibold text-blue-600">{$selectedJob.location}</span>
						is currently <strong>not open for applications in your region</strong>.
					</p>
				{/if}

				<p class="mb-6 text-gray-500">
					SwiftPort Logistics frequently expands its hiring network. Please check back later or
					subscribe to our newsletter for updates on international openings and remote roles.
				</p>

				<div class="flex flex-col justify-center gap-3 sm:flex-row">
					<a
						href="/careers"
						class="btn rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
						on:click={closeModal}
					>
						View Other Roles
					</a>
					<button
						on:click={closeModal}
						class="btn rounded-lg border border-gray-300 px-5 py-2 text-gray-700 hover:bg-gray-100"
					>
						Close
					</button>
				</div>
			</div>
		</div>
	{/if}
</section>
