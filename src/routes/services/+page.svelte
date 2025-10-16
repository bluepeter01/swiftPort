<script>
	import { fly } from 'svelte/transition';
</script>

<div class="mt-18 min-h-screen bg-gradient-to-b from-white to-blue-50 px-6 py-16">
	<div class="mx-auto max-w-5xl text-center" transition:fly={{ y: 20, duration: 500 }}>
		<h1 class="mb-6 text-4xl font-extrabold text-blue-700">Our Shipping & Logistics Services</h1>
		<p class="text-lg leading-relaxed text-gray-600">
			We offer a wide range of international and domestic shipping solutions tailored to your
			business and personal needs.
		</p>
	</div>

	<div class="mx-auto mt-12 grid max-w-6xl gap-8 md:grid-cols-3">
		<div class="rounded-2xl bg-white p-6 text-center shadow-lg">
			<h2 class="mb-3 text-xl font-bold text-blue-600">✈️ Air Freight</h2>
			<p class="text-gray-600">
				Fast and reliable air delivery for urgent shipments across international borders.
			</p>
		</div>

		<div class="rounded-2xl bg-white p-6 text-center shadow-lg">
			<h2 class="mb-3 text-xl font-bold text-blue-600">🚢 Sea Freight</h2>
			<p class="text-gray-600">
				Economical large-scale shipping through trusted ocean freight partners.
			</p>
		</div>

		<div class="rounded-2xl bg-white p-6 text-center shadow-lg">
			<h2 class="mb-3 text-xl font-bold text-blue-600">🚚 Door-to-Door Delivery</h2>
			<p class="text-gray-600">
				We pick up and deliver directly to your doorstep — anywhere, anytime.
			</p>
		</div>

		<div class="rounded-2xl bg-white p-6 text-center shadow-lg">
			<h2 class="mb-3 text-xl font-bold text-blue-600">📦 Warehouse & Storage</h2>
			<p class="text-gray-600">
				Secure warehousing with inventory management for businesses of all sizes.
			</p>
		</div>

		<div class="rounded-2xl bg-white p-6 text-center shadow-lg">
			<h2 class="mb-3 text-xl font-bold text-blue-600">🧾 Customs Clearance</h2>
			<p class="text-gray-600">
				Expert handling of all customs documentation and clearance processes.
			</p>
		</div>

		<div class="rounded-2xl bg-white p-6 text-center shadow-lg">
			<h2 class="mb-3 text-xl font-bold text-blue-600">💬 Customer Support</h2>
			<p class="text-gray-600">
				24/7 customer care via WhatsApp and email to keep you informed at every step.
			</p>
		</div>
	</div>
</div>
