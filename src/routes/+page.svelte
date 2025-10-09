<script lang="ts">
	import { onMount } from 'svelte';
	import { track } from '$lib/variable.svelte';
	import { goto } from '$app/navigation';
	import Div1 from '$lib/Div1.svelte';
	import Div2 from '$lib/Div2.svelte';

	let trackCode = '';

	onMount(() => {
		// Check if trackCode is already in localStorage
		const stored = localStorage.getItem('trackCode');

		if (stored) {
			trackCode = stored;
		} else {
			trackCode = track.trackCode || ''; // default to empty if trackCode is not available
			localStorage.setItem('trackCode', trackCode);
		}
	});

	function handleSubmit(event: any) {
		event.preventDefault(); // Prevent form submission and page refresh
		localStorage.setItem('trackCode', trackCode); // Store the trackCode in localStorage
		track.trackCode = trackCode; // Sync the trackCode with the variable store (if necessary)

		// Optionally, navigate to a new page after form submission (e.g., the tracking page)
		goto('/track'); // Navigate to the '/track' page or whatever the route is
	}
</script>

<main>
	<div
		class="hero z-10 min-h-screen"
		style="background-image: url(/Gemini_Generated_Image_l3496wl3496wl349.png);"
	>
		<div class="hero-overlay"></div>
		<div class="hero-content text-neutral-content text-center">
			<div class="max-w-md">
				<fieldset class="fieldset">
					<title class="fieldset-legend p-1 text-3xl text-white md:text-4xl">
						Track Your Shipment
					</title>

					<form
						onsubmit={handleSubmit}
						class="items-center justify-center gap-2 rounded-lg p-2 md:flex"
					>
						<input
							type="text"
							bind:value={trackCode}
							class="h-17 w-full rounded-lg bg-white p-3 text-lg text-black focus:ring-2 focus:ring-indigo-500 focus:outline-none sm:w-fit"
							placeholder="Enter your tracking number"
							required
						/>

						<button
							type="submit"
							class="mt-2 flex w-full cursor-pointer items-center justify-center rounded-b-lg bg-blue-500 p-5 text-lg text-white transition-transform duration-300 hover:scale-105 md:mt-0 md:rounded-lg"
						>
							Track
						</button>
					</form>
				</fieldset>
			</div>
		</div>
	</div>

	<div class="">
		<Div1 />
	</div>

	<div class="">
		<Div2 />
	</div>
</main>
