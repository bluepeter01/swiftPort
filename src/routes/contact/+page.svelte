<script>
	import WhatsAppButton from '$lib/WhatsAppButton.svelte';
	export let phone = '+16578022801'; // replace with your WhatsApp number (e.g., "2348012345678" for Nigeria)
	let whatsappMessage = 'Hello! I’d like to inquire about SwiftPort shipping.';

	let name = '';
	let email = '';
	let message = '';
	let success = false;

	function handleSubmit(e) {
		e.preventDefault();
		success = true;
		setTimeout(() => (success = false), 4000);
		name = '';
		email = '';
		message = '';
	}
</script>

<div class="mt-18 min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-100 px-6 py-16">
	<div class="mx-auto mb-10 max-w-3xl text-center">
		<h1 class="mb-4 text-4xl font-extrabold text-blue-700">Contact Us</h1>
		<p class="text-lg text-gray-600">
			We’re here to help! Get in touch with our customer service for inquiries, support, or
			feedback.
		</p>
	</div>

	<form
		class="mx-auto max-w-2xl space-y-5 rounded-2xl bg-white p-8 shadow-xl"
		on:submit={handleSubmit}
	>
		<input
			type="text"
			bind:value={name}
			placeholder="Your Name"
			required
			class="input-bordered input w-full"
		/>

		<input
			type="email"
			bind:value={email}
			placeholder="Your Email"
			required
			class="input-bordered input w-full"
		/>

		<textarea
			bind:value={message}
			placeholder="Your Message"
			rows="5"
			required
			class="textarea-bordered textarea w-full"
		></textarea>

		<button type="submit" class="btn w-full bg-blue-600 text-white hover:bg-blue-700">
			Send Message
		</button>

		{#if success}
			<div class="mt-4 alert alert-success">
				<p>✅ Message sent successfully! Our support team will contact you soon.</p>
			</div>
		{/if}
	</form>

	<div class="mt-12 text-center text-gray-700">
		<p>📍 Headquarters: 150 Buchanan Street, Glasgow G1 2JX, United Kingdom</p>

		<p>📞 Phone: +1 (813) 394-8987</p>
		<a
			href={`https://wa.me/${phone}?text=${encodeURIComponent(whatsappMessage)}`}
			target="_blank"
			rel="noopener noreferrer"
			class="mx-auto flex w-fit items-center justify-center gap-2 rounded-full bg-green-500 px-5 py-3 text-white shadow-lg transition-all duration-300 hover:bg-green-600"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="currentColor"
				viewBox="0 0 24 24"
				class="h-6 w-6"
			>
				<path
					d="M12.02 2C6.49 2 2 6.47 2 12c0 2.1.55 4.07 1.62 5.82L2 22l4.33-1.6A9.88 9.88 0 0012 22c5.53 0 10-4.47 10-10S17.55 2 12.02 2zM12 20.3c-1.75 0-3.44-.47-4.93-1.35l-.35-.2-2.57.95.88-2.66-.22-.34A8.26 8.26 0 013.7 12c0-4.6 3.75-8.33 8.33-8.33S20.36 7.4 20.36 12 16.6 20.3 12 20.3zm4.74-6.57c-.26-.13-1.54-.76-1.78-.84-.24-.09-.42-.13-.6.13-.18.27-.69.84-.85 1.02-.16.18-.31.2-.58.07-.26-.13-1.1-.4-2.09-1.26a7.7 7.7 0 01-1.44-1.8c-.15-.27 0-.41.11-.54.11-.13.26-.34.38-.5.13-.18.17-.27.25-.45.08-.18.04-.34-.02-.47-.07-.13-.6-1.46-.82-2-.22-.52-.44-.45-.6-.45l-.51-.01c-.18 0-.46.07-.7.34-.24.27-.92.9-.92 2.2s.94 2.55 1.07 2.72c.13.18 1.83 2.8 4.44 3.93.62.27 1.1.43 1.48.55.62.2 1.18.17 1.63.1.5-.08 1.54-.63 1.76-1.23.22-.6.22-1.12.15-1.23-.06-.1-.23-.16-.48-.29z"
				/>
			</svg>
			<span class="hidden text-sm font-medium sm:inline">Chat with us</span>
		</a>

		<p>
			✉️ Email: <a href="mailto:swiftportlogisticsusa@gmail.com" class="text-blue-600"
				>swiftportlogisticsusa@gmail.com</a
			>
		</p>
	</div>
</div>
