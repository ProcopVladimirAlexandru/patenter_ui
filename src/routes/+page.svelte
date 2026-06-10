<script lang="ts">
    import { getPatent, postInfringementDetectionTask, getInfringementDetectionTaskResult } from "$lib/connectors/patenter";
    import type { Patent } from "$lib/types/patents";
    import type { InfringementDetection } from "$lib/types/detections";
    import { TaskStatuses } from "$lib/types/tasks";

    let patentUid = $state('');
    let patent: Patent | null = $state(null);
    let patentError: Error | null = $state(null);

    let taskUid: string | null = $state(null);
    let taskInterval: number | null = $state(null);
    let taskError: Error | null = $state(null);
    let taskLoading: boolean = $state(false);
    let timeElapsed: number = $state(0);
    let useCache: boolean = $state(true);

    let detections: InfringementDetection[] | null = $state(null);
    $effect(() => {
        if (detections) {
            document.getElementById("all-detections-h1")?.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
        }
    });
    $effect(() => {
       if (taskLoading) {
        const interval = setInterval(() => {
            timeElapsed += 1;
        }, 1000);
        return () => clearInterval(interval);
       }
    });
</script>

<style>
    .loader {
        width: 32px;
        height: 32px;
        border: 3px solid #FFF;
        border-bottom-color: #FF3D00;
        border-radius: 50%;
        display: inline-block;
        box-sizing: border-box;
        animation: rotation 1s linear infinite;
    }

    @keyframes rotation {
        0% {
            transform: rotate(0deg);
        }

        100% {
            transform: rotate(360deg);
        }
    }
</style>

<h3 style="font-family: Arial, sans-serif; margin-bottom: 8px; color: #328;">Enter a Patent Publication Number:</h3>
<input
    placeholder="Patent Publication Number"
    type="text"
    class="border border-gray-300 rounded px-2 py-1 mt-2 cursor-pointer"
    style="width: 256px; margin-bottom: 16px; height: 32px; font-family: Arial, sans-serif; font-size: 14px;"
    bind:value={patentUid}
/>
<button onclick={async () => {
    console.log("will search for patent with uid: ", patentUid);
    detections = null;
    try {
        patent = await getPatent(patentUid);
        patentError = null;
    } catch (error) {
        console.error("Failed to fetch patent:", error);
        patentError = error as Error;
        patent = null;
    }
}} style="cursor: {patentUid ? 'pointer' : 'not-allowed'}; border-radius: 4px; height: 32px; background-color: {patentUid ? '#228' : '#ccc'}; color: white; font-weight: bold; font-size: 14px; font-family: Arial, sans-serif;"
    disabled={!patentUid}
>
    Search
</button>


{#if patent}
	<h1>Patent <span style="color: #228;">"{patent.title}" ({patent.publicationNumber})</span></h1>
    <h2 style="margin-top: 16px;">Summary</h2>
    <p><span style="font-weight: bold; color: #228;">Assignees:</span> {patent.assignees.join(", ")}</p>
    <p><span style="font-weight: bold; color: #228;">Abstract:</span> {patent.abstract}</p>
    <p><span style="font-weight: bold; color: #228;">Filed On:</span> {patent.dates.filing}</p>
    <p><span style="font-weight: bold; color: #228;">Publication Date:</span> {patent.dates.publication}</p>
    <br>
    <h2 style="margin-top: 16px;">Claims</h2>
    {#each patent.claims as claim}
        <p><span style="font-weight: bold; color: #228;">Claim {claim.number}:</span> {claim.text}</p>
    {/each}
{/if}

{#if patentError}
	<p style="color: red;">{patentError.message}</p>
{/if}

{#if taskError}
	<p style="color: red;">{taskError.message}</p>
{/if}


{#if detections && detections.length > 0 && !taskError && !patentError}
    <br/><br/>
    <h2 id="all-detections-h1" style="margin-top: 16px;">Detections:</h2>
    {#each detections as detection}
    <div style="margin-bottom: 48px;border-bottom: 1px solid #ccc;padding-bottom: 16px;">
        <h3><span style="font-weight: bold; color: #228;">Infringing Enterprise:</span> {detection.infringingEnterprise}</h3>
        <h3><span style="font-weight: bold; color: #228;">Infringing Product:</span> {detection.infringingProduct}</h3>
        <p><span style="font-weight: bold; color: #228;">URL:</span> <a href={detection.url}>{detection.url}</a></p>

        {#if detection.perClaimAnalysis && detection.perClaimAnalysis.length > 0}
        <h4 style="margin-top: 8px;">Per Claim Analysis by <span style="color: #228;">Model {detection.modelUid.toUpperCase()}</span>:</h4>
        {#each detection.perClaimAnalysis as claim}
        <div style="margin-bottom: 16px;border-bottom: 1px solid #ccc;padding-bottom: 8px;">
        <!--  -->
            <p><span style="font-weight: bold; color: #2adb3b;">Claim {claim.claimNumber}:</span> {claim.claimText}</p>
            <p><span style="font-weight: bold; color: red;">Infringing Text:</span> {claim.infringingText}</p>
        </div>
        {/each}
        {/if}
    </div>
    {/each}
{/if}

{#if patent && !patentError}
<div style="margin-top: 16px;border: 2px solid #ccc;padding: 8px;border-radius: 4px;max-width: fit-content;">
<div>
<input type="checkbox" id="use-cache-checkbox" name="use-cache-checkbox" bind:checked={useCache}> 
<label for="use-cache-checkbox">Use Cache</label>
</div>
<div>
<button
    id="detect-infringement-btn"
    style="font-size: 16px; margin-top: 16px; padding: 8px 16px; background-color: #282; color: white; border: none; border-radius: 4px; cursor: pointer; font-family: Arial, sans-serif; font-size: 14px; font-weight: bold;"
    onclick={async () => {
        timeElapsed = 0;
        if (!patent || patentError) {
            return;
        }
        console.log("will detect infringement for patent: ", patent.publicationNumber);
        document.getElementById("detect-infringement-btn")?.scrollIntoView({ behavior: "instant", block: "start", inline: "nearest" });
        try {
            taskUid = await postInfringementDetectionTask(patent.publicationNumber, useCache);
            taskLoading = true;
        } catch (error) {
            console.error("Failed to detect infringement:", error);
            taskError = error as Error;
            taskLoading = false;
            return;
        }

        console.log("infringement detection task created with id: ", taskUid);
        const pollCount = 120;
        const pollInterval = 5000;
        for (let i = 0; i < pollCount; i++) {
            console.log(`polling ${i + 1}/${pollCount} for task result: ${taskUid}`);
            await new Promise((resolve) => setTimeout(resolve, pollInterval));

            try {
                const taskResult = await getInfringementDetectionTaskResult(taskUid);
                if (taskResult.success) {
                    detections = [...taskResult.data.detections, ...(detections || [])];
                    taskError = null;
                    taskLoading = false;
                    break;
                }
                else {
                    if (taskResult.taskStatus === TaskStatuses.FAILURE) {
                        detections = null;
                        taskError = new Error("Task failed");
                        taskLoading = false;
                        break;
                    }
                    else if (taskResult.taskStatus === TaskStatuses.STARTED) {
                        taskLoading = true;
                        continue;
                    }
                    else if (taskResult.taskStatus === TaskStatuses.PENDING) {
                        taskLoading = true;
                        continue;
                    }
                    else {
                        detections = null;
                        taskError = new Error("Unknown task status: " + taskResult.taskStatus);
                        taskLoading = false;
                        break;
                    }
                }
            } catch (error) {
                console.error("Failed to get task status:", error);
                taskError = error as Error;
                detections = null;
                taskLoading = false;
                return;
            }
        }
    }}
>
    Detect Infringement
</button>
{#if taskLoading}
    <span>
        Loading
        <!-- animated CSS loading spinner here -->
         <div class="loader"></div>
         <div style="margin-left: 10px; display: inline-block;">Time Elapsed: {timeElapsed} seconds</div>
    </span>
{/if}
</div>
</div>
{/if}


<!-- {#await patentsPromise}
    <p>Loading...</p>
{:then patents}
    <h1>Welcome to SvelteKit</h1>
    <p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>
    <pre>{JSON.stringify(patents, null, 2)}</pre>
{/await} -->
