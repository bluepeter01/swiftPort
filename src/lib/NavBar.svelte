<script>
	import ShipError from './ShipError.svelte';

	function closeDrawer() {
		document.getElementById('my-drawer').checked = false;
	}
</script>

<header class="fixed top-0 z-800 w-full items-center rounded-b-3xl bg-blue-700 p-2 px-4">
	<nav class="z-200 flex items-center justify-between">
		<div class="flex items-center gap-2 text-white">
			<img
				class="h-15 w-15 rounded-full"
				src="/Gemini_Generated_Image_l3496wl3496wl349.png"
				alt=""
			/>

			<a href="/"
				><h1 class="cursor-pointer text-xl font-bold italic">
					SWIFTPORT <span class="ml-1">LOGISTICS</span>
				</h1></a
			>
		</div>

		<ul class="quicksand hidden gap-5 text-white md:flex">
			<!-- <li class="cursor-pointer hover:text-blue-900 hover:underline transition-transform duration-300 hover:scale-105">Home</li> -->
			<a href="/track"><li class="cursor-pointer hover:underline">Track</li></a>

			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
			<li onclick={my_modal_1.showModal()} class="cursor-pointer hover:underline">Ship</li>

			<a href="/about"><li class="cursor-pointer hover:underline">About Us</li></a>

			<a href="/services"><li class="cursor-pointer hover:underline">Services</li></a>

			<a href="/contact"><li class="mr-6 cursor-pointer hover:underline">Contact Us</li></a>
		</ul>

		<div class="relative inset-0 z-50 md:hidden">
			<div class="drawer">
				<input id="my-drawer" type="checkbox" class="drawer-toggle" />

				<div class="drawer-content">
					<!-- Page content here -->
					<label
						for="my-drawer"
						class="drawer-button cursor-pointer text-white hover:text-purple-400"
					>
						<svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" viewBox="0 0 21 21">
							<path
								fill="none"
								stroke="currentColor"
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M4.5 6.5h12m-12.002 4h11.997M4.5 14.5h11.995"
								stroke-width="1"
							/>
						</svg>
					</label>
				</div>

				<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<div class="drawer-side">
					<label for="my-drawer" aria-label="close sidebar" class="drawer-overlay"></label>
					<!-- svelte-ignore a11y_missing_attribute -->
					<ul class="menu bg-base-200 text-base-content min-h-full w-80 p-4">
						<div
							onclick={closeDrawer}
							class="flex space-x-2 rounded-lg p-2 text-xl font-semibold text-indigo-900 transition-transform duration-300 hover:scale-105"
						>
							<a href="/">SWIFTPORT LOGISTICS</a>
							<span
								><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
									><path
										fill="currentColor"
										d="M14.707 7.293a1 1 0 1 0-1.414 1.414L15.586 11H6a1 1 0 1 0 0 2h9.586l-2.293 2.293a1 1 0 0 0 1.414 1.414l4-4a1 1 0 0 0 0-1.414z"
									/></svg
								></span
							>
						</div>
						<!-- Sidebar content here -->
						<li onclick={closeDrawer} class="p-2"><a href="/track">Track</a></li>
						<li onclick={closeDrawer} class="p-2"><a onclick={my_modal_1.showModal()}>Ship</a></li>
						<li onclick={closeDrawer} class="p-2"><a href="/about">About Us</a></li>
						<li onclick={closeDrawer} class="p-2"><a href="/services">Services</a></li>
						<li onclick={closeDrawer} class="p-2"><a href="/contact">Contact Us</a></li>
						<div onclick={closeDrawer} class="fixed bottom-8 left-10">
							<a href="/services" class="transiton-transform duration-300 hover:scale-105"
								>SwiftPort Services</a
							>
						</div>
					</ul>
				</div>
			</div>
		</div>
	</nav>

	<!-- Open the modal using ID.showModal() method -->

	<ShipError />
</header>
