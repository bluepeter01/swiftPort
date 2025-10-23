<script>
	import WhatsAppButton from '$lib/WhatsAppButton.svelte';
	import '../app.css';
	import Footer from '../lib/Footer.svelte';
	import NavBar from '../lib/NavBar.svelte';

	let { children } = $props();
</script>

<div class="">
	<NavBar />

	{@render children()}
</div>

<footer>
	<Footer />
</footer>

<!-- Floating WhatsApp chat button -->
<WhatsAppButton
	phone="+18133948987"
	message="Hello! I’d like to inquire about SwiftPort shipping."
/>
<!-- +18133948987 -->
