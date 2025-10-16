<script>
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
		<p>📍 Headquarters: 123 SwiftPort Blvd, New York, USA</p>
		<p>📞 Phone: +1 (555) 234-6789</p>
		<p>💬 WhatsApp: <a href="https://wa.me/15552346789" class="text-blue-600">Chat Now</a></p>
		<p>
			✉️ Email: <a href="mailto:support@swiftportlogistics.online" class="text-blue-600"
				>support@swiftportlogistics.online</a
			>
		</p>
	</div>
</div>
