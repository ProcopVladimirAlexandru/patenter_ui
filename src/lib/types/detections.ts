import type { DataResponse } from "./responses";
import type { TaskStatuses } from "./tasks";

interface InfringementDetectionPerClaimResponseModel {
    claimNumber: number
    claimText: string
    infringingText: string
}


interface InfringementDetection {
    infringingEnterprise: string
    infringingProduct: string
    url: string
    modelUid: string
    perClaimAnalysis: InfringementDetectionPerClaimResponseModel[] | null
}


interface InfringementDetectionResponse extends DataResponse {
    taskStatus: TaskStatuses
    data: {
        detections: InfringementDetection[]
    }
}

export type {InfringementDetection, InfringementDetectionPerClaimResponseModel, InfringementDetectionResponse}
 