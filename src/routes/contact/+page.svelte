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
		<p>📍 Headquarters: 150 Buchanan Street, Glasgow G1 2JX, United Kingdom</p>

		<p>📞 Phone: +1 (813) 394-8987</p>
		<p>💬 WhatsApp: <a href="https://wa.me/+18133948987" class="text-blue-600">Chat Now</a></p>
		<p>
			✉️ Email: <a href="mailto:swiftportlogisticsusa@gmail.com" class="text-blue-600"
				>swiftportlogisticsusa@gmail.com</a
			>
		</p>
	</div>
</div>
