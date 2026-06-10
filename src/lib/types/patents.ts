interface PatentDates {
    application: string
    filing: string
    publication: string
}

interface PatentClaim {
    number: number
    preamble: string | null
    text: string | null
    elements: string[]
}


interface Patent {
    publicationNumber: string
    title: string
    assignees: string[]
    abstract: string
    claims: PatentClaim[]
    dates: PatentDates
    status: string
}


export type {Patent, PatentClaim, PatentDates}