<script>
	import { fade, fly } from 'svelte/transition';
</script>

<section class="mt-18 min-h-screen bg-white px-6 py-16 text-gray-800">
	<div in:fly={{ y: 30, duration: 600 }} class="mx-auto max-w-4xl text-center">
		<h1 class="mb-4 text-4xl font-extrabold text-blue-700">Press & Media</h1>
		<p class="mb-10 text-lg text-gray-600">
			Stay up-to-date with the latest news, updates, and innovations from
			<span class="font-semibold text-blue-600">SwiftPort Logistics</span>. For press inquiries,
			contact:
			<a href="mailto:press@swiftportlogistics.com" class="text-blue-600 underline"
				>press@swiftportlogistics.com</a
			>
		</p>
	</div>

	<div class="mx-auto max-w-4xl space-y-8" in:fade={{ delay: 200, duration: 800 }}>
		{#each [{ title: 'SwiftPort Expands Into Asia-Pacific', date: 'September 2025', content: 'SwiftPort Logistics announces new distribution hubs in Singapore and Tokyo to support increasing global trade demands.' }, { title: 'New AI Tracking System Launched', date: 'June 2025', content: 'Our upgraded AI-powered tracking gives customers instant insight into shipment locations and predictive delivery times.' }, { title: 'SwiftPort Named Among Top 50 Global Logistics Innovators', date: 'March 2025', content: 'SwiftPort joins the elite list of logistics companies leading the charge in sustainability and delivery technology.' }] as article}
			<div class="rounded-2xl bg-blue-50 p-6 shadow transition duration-300 hover:bg-blue-100">
				<h2 class="text-2xl font-semibold text-blue-700">{article.title}</h2>
				<p class="mb-2 text-sm text-gray-500">{article.date}</p>
				<p class="text-gray-700">{article.content}</p>
			</div>
		{/each}
	</div>
</section>
