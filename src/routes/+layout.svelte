<script>
	import '../app.css';
	import Footer from '../lib/Footer.svelte';
	import NavBar from '../lib/NavBar.svelte';

	let { children } = $props();
</script>

<div class="">
	<NavBar />

	{@render children()}
	<Footer />
</div>
