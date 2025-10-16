<script>
	import { fade } from 'svelte/transition';
</script>

<div class="mt-18 min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-100 px-6 py-16">
	<div class="mx-auto max-w-4xl text-center" transition:fade>
		<h1 class="mb-6 text-4xl font-extrabold text-blue-700">About SwiftPort Logistics</h1>
		<p class="mb-8 text-lg leading-relaxed text-gray-600">
			At <span class="font-semibold text-blue-600">SwiftPort Logistics</span>, we redefine the
			experience of global shipping by providing fast, secure, and transparent logistics solutions
			across the world. With a commitment to innovation and reliability, we make sure your packages
			arrive safely — and on time.
		</p>
	</div>

	<!-- Mission & Vision -->
	<div class="mx-auto mt-12 grid max-w-5xl gap-10 md:grid-cols-2">
		<div class="rounded-2xl bg-white p-6 shadow-lg">
			<h2 class="mb-3 text-xl font-bold text-blue-600">🌍 Our Mission</h2>
			<p class="text-gray-600">
				To simplify international shipping and create a seamless connection between businesses and
				customers worldwide through technology-driven logistics.
			</p>
		</div>

		<div class="rounded-2xl bg-white p-6 shadow-lg">
			<h2 class="mb-3 text-xl font-bold text-blue-600">🚀 Our Vision</h2>
			<p class="text-gray-600">
				To become the leading trusted name in global logistics, offering end-to-end delivery
				solutions powered by transparency, speed, and trust.
			</p>
		</div>
	</div>

	<!-- Why Choose Us -->
	<div class="mx-auto mt-16 max-w-3xl text-center">
		<h2 class="mb-4 text-2xl font-bold text-blue-700">💡 Why Choose Us?</h2>
		<ul class="space-y-3 text-lg text-gray-700">
			<li>✅ Real-time tracking of your shipments</li>
			<li>✅ Worldwide delivery coverage</li>
			<li>✅ Fast customs clearance</li>
			<li>✅ 24/7 customer support via WhatsApp & Email</li>
			<li>✅ Secure and insured shipping options</li>
		</ul>
	</div>

	<!-- Registrations & Certifications -->
	<div class="mx-auto mt-20 max-w-4xl text-center">
		<h2 class="mb-6 text-2xl font-bold text-blue-700">📜 Our Registrations & Certifications</h2>
		<p class="mb-8 text-lg text-gray-600">
			SwiftPort Logistics operates with full legal and international compliance, ensuring trust and
			accountability in every shipment we handle.
		</p>

		<div class="grid gap-6 md:grid-cols-2">
			<div class="rounded-2xl border border-blue-100 bg-white p-6 shadow-md">
				<h3 class="mb-2 font-bold text-blue-600">🏢 Business Registration</h3>
				<p class="text-gray-600">
					Registered under the U.S. Corporate Affairs Commission<br />
					<span class="font-semibold">Reg. No: SPC-2024-879231</span>
				</p>
			</div>

			<div class="rounded-2xl border border-blue-100 bg-white p-6 shadow-md">
				<h3 class="mb-2 font-bold text-blue-600">🌐 International Freight License</h3>
				<p class="text-gray-600">
					Certified by the International Freight Forwarders Association (IFFA)<br />
					<span class="font-semibold">License No: IFFA-019384</span>
				</p>
			</div>

			<div class="rounded-2xl border border-blue-100 bg-white p-6 shadow-md">
				<h3 class="mb-2 font-bold text-blue-600">🛡️ Insurance & Compliance</h3>
				<p class="text-gray-600">
					All shipments are fully insured under Lloyd’s of London policy.<br />
					<span class="font-semibold">Coverage ID: LL-0948374</span>
				</p>
			</div>

			<div class="rounded-2xl border border-blue-100 bg-white p-6 shadow-md">
				<h3 class="mb-2 font-bold text-blue-600">📦 Customs & Export Certification</h3>
				<p class="text-gray-600">
					Approved by the U.S. Customs and Border Protection (CBP) Authority<br />
					<span class="font-semibold">CBP Certification No: USCBP-223451</span>
				</p>
			</div>
		</div>
	</div>
</div>
