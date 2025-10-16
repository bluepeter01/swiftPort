<script>
	import { fade } from 'svelte/transition';
</script>

<section class="mt-18 min-h-screen bg-gradient-to-b from-white to-blue-50 px-6 py-16 text-gray-800">
	<div in:fade class="mx-auto max-w-4xl">
		<h1 class="mb-6 text-4xl font-extrabold text-blue-700">Cookie Policy</h1>
		<p class="mb-6 text-gray-600">
			This site uses cookies to improve user experience and website performance.
		</p>

		<h2 class="mt-8 mb-2 text-2xl font-semibold text-blue-600">1. What Are Cookies?</h2>
		<p class="text-gray-700">
			Cookies are small text files stored on your device to remember preferences and enhance
			browsing.
		</p>

		<h2 class="mt-8 mb-2 text-2xl font-semibold text-blue-600">2. How We Use Them</h2>
		<p class="text-gray-700">
			We use cookies for analytics, language settings, and remembering shipment preferences. You may
			disable cookies in your browser anytime.
		</p>

		<h2 class="mt-8 mb-2 text-2xl font-semibold text-blue-600">3. Managing Cookies</h2>
		<p class="text-gray-700">
			To control cookies, visit your browser’s settings. Some features may not function properly if
			cookies are disabled.
		</p>
	</div>
</section>
