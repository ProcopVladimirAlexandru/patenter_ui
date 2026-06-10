<script lang="ts">
    import { getPatent } from '$lib/connectors/patenter';
    const patentsPromise = getPatent(patentUid);
</script>


{#await patentsPromise}
    <p>Loading...</p>
{:then patents}
    <h1>Welcome to SvelteKit</h1>
    <p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>
    <pre>{JSON.stringify(patents, null, 2)}</pre>
{/await}
