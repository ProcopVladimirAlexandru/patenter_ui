import type { Patent } from '$lib/types/patents';
import type { InfringementDetection, InfringementDetectionResponse } from '$lib/types/detections';

async function getPatents(): Promise<Array<Patent>> {
    const response = await fetch('http://localhost:8444/api/v1/patents');
    const data = await response.json();
    return data.data.patents;
}


async function getPatent(patentUid: string): Promise<Patent> {
    const response = await fetch(`http://localhost:8444/api/v1/patents/${patentUid}`);
    if (response.status === 404) {
        throw new Error(`Patent not found: ${patentUid}`);
    }
    if (!response.ok) {
        throw new Error(`Failed to fetch patent: ${response.statusText}`);
    }
    const data = await response.json();
    return data.data;
}

async function postInfringementDetectionTask(patentUid: string, useCache: boolean): Promise<string> {
    console.log("useCache === ", useCache);
    if (useCache) {
        const patentUidToTaskUid: Record<string, string> = {
            "US11936297B2": "03529338-a232-4de2-b7e8-ee7a3b737f06",
            "US11689112B2": "8b19bfec-b372-4915-a0f0-585954b5a124",
            "US11021062B2": "163881e1-7520-4466-8224-a19be722442e",
            "US10259329B2": "2aab941e-a8d7-4d12-b98e-c5d364c504bd",
            "US9917470B2": "44e81dbd-6cbc-47e7-a72d-8ac9cb66f63e",
            "US9768639B2": "864657e6-1a6b-49bd-aa8a-f09cd647a98b",
            "US9809126B2": "29c9dff0-7967-48dc-8242-b1ae56b35655",
            "US12451793B2": "0218b0a0-f3e0-4301-b6a1-735ca6ba0568",
            "US9834102B2": "6fd7bd76-d491-481d-905b-47add8a23da6",
            "US9579978B2": "ed6c8ab3-262c-46d8-b957-639913159ed4",
            "US11043831B2": "8074ca5f-bcaf-437e-83f9-f3f358cdb1a5"
        };
        if (patentUidToTaskUid[patentUid]) {
            return patentUidToTaskUid[patentUid];
        }
    }

    const response = await fetch(`http://localhost:8444/api/v1/patents/${patentUid}/infringement_detection_task`, {
        method: 'POST',
    });
    if (!response.ok) {
        throw new Error(`Failed to detect infringement: ${response.statusText}`);
    }
    const data = await response.json();
    return data.data.uid; 
}


async function getInfringementDetectionTaskResult(taskUid: string): Promise<InfringementDetectionResponse> {
    const response = await fetch(`http://localhost:8444/api/v1/patents/infringement_detection_task/${taskUid}`);
    if (!response.ok) {
        throw new Error("Failed to get infringement detection task");
    }
    return await response.json();
}

export { getPatents, getPatent, postInfringementDetectionTask, getInfringementDetectionTaskResult };
