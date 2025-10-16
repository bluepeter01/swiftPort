<script>
	import { fade } from 'svelte/transition';
</script>

<section class="mt-18 min-h-screen bg-gradient-to-b from-white to-blue-50 px-6 py-16 text-gray-800">
	<div in:fade class="mx-auto max-w-4xl">
		<h1 class="mb-6 text-4xl font-extrabold text-blue-700">Privacy Policy</h1>
		<p class="mb-6 text-gray-600">
			Your privacy matters. SwiftPort Logistics is committed to protecting your data and ensuring
			transparency in how it’s used.
		</p>

		<h2 class="mt-8 mb-2 text-2xl font-semibold text-blue-600">1. Information We Collect</h2>
		<p class="text-gray-700">
			We collect data like your name, address, phone number, and shipment details when you use our
			services.
		</p>

		<h2 class="mt-8 mb-2 text-2xl font-semibold text-blue-600">2. How We Use Your Data</h2>
		<p class="text-gray-700">
			Data is used solely for shipping, customer support, and service optimization. We never sell or
			trade user data.
		</p>

		<h2 class="mt-8 mb-2 text-2xl font-semibold text-blue-600">3. Your Rights</h2>
		<p class="text-gray-700">
			You can request data deletion, correction, or export anytime by contacting <a
				class="text-blue-600 underline"
				href="mailto:privacy@swiftportlogistics.com">privacy@swiftportlogistics.com</a
			>.
		</p>
	</div>
</section>
