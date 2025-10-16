<dialog id="my_modal_1" class="modal modal-bottom sm:modal-middle">
	<div
		class="relative modal-box overflow-hidden rounded-2xl border border-blue-200 bg-white p-8 shadow-2xl transition-all duration-300"
	>
		<!-- Subtle top gradient bar -->
		<div
			class="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600"
		></div>

		<!-- Header with icon -->
		<div class="mb-4 flex items-center gap-3">
			<div class="rounded-full bg-blue-100 p-3">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="2"
					stroke="currentColor"
					class="h-6 w-6 text-blue-600"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M12 9v2m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0Z"
					/>
				</svg>
			</div>
			<h3 class="text-2xl font-bold text-blue-700">Service Unavailable in Your Region</h3>
		</div>

		<!-- Message -->
		<p class="mb-4 leading-relaxed text-gray-600">
			We’re sorry — SwiftPort currently does not offer shipping or delivery services in your area.
			Our logistics network is expanding rapidly, and we’re working hard to bring our trusted
			delivery solutions to your region soon.
		</p>

		<p class="mb-6 text-sm text-gray-500">
			If you’d like to receive updates about when SwiftPort becomes available in your region, you
			can contact our support team or subscribe to our service alerts.
		</p>

		<!-- Call to action buttons -->
		<div class="modal-action flex flex-col justify-end gap-3 sm:flex-row">
			<a
				href="https://wa.me/1234567890"
				target="_blank"
				class="btn border-none bg-green-500 text-white transition-transform duration-300 hover:scale-105 hover:bg-green-600"
			>
				Contact via WhatsApp
			</a>

			<!-- This button will close the modal properly -->
			<button
				class="btn border border-gray-300 bg-white text-gray-700 transition-transform duration-300 hover:scale-105 hover:bg-gray-100"
				on:click={() => document.getElementById('my_modal_1').close()}
			>
				Close
			</button>
		</div>

		<!-- Decorative subtle background icon -->
		<svg
			class="absolute -right-4 -bottom-4 h-24 w-24 text-blue-400 opacity-10"
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke-width="1.5"
			stroke="currentColor"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M3 3h18v4H3V3zm0 6h18v4H3V9zm0 6h18v4H3v-4z"
			/>
		</svg>
	</div>

	<!-- Overlay click closes modal -->
	<form method="dialog" class="modal-backdrop">
		<button>close</button>
	</form>
</dialog>
