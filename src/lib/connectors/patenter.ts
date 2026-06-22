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
    const response = await fetch(`http://localhost:8444/api/v1/patents/${patentUid}/infringement_detection_task?use_cache=${useCache}`, {
        method: 'POST',
    });
    if (!response.ok) {
        throw new Error(`Failed to detect infringement: ${response.statusText}`);
    }
    const data = await response.json();
    return data.data.uid; 
}


async function getInfringementDetectionTaskResult(patentUid: string, taskUid: string, useCache: boolean): Promise<InfringementDetectionResponse> {
    const response = await fetch(`http://localhost:8444/api/v1/patents/${patentUid}/infringement_detection_task/${taskUid}?use_cache=${useCache}`);
    if (!response.ok) {
        throw new Error("Failed to get infringement detection task");
    }
    return await response.json();
}

export { getPatents, getPatent, postInfringementDetectionTask, getInfringementDetectionTaskResult };
