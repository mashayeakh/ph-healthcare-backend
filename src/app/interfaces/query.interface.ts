//what you see in many you nee to put here

export interface PrismaFindManyArgs {
    where?: Record<string, unknown>
    include?: Record<string, unknown>
    select?: Record<string, boolean | Record<string, unknown>>
    orderBy?: Record<string, unknown> | Record<string, unknown>[]
    skip?: number,
    take?: number,
    cursor?: Record<string, unknown>
    distinct?: string[] | string,
    //other than above, you can add other things so we will use [key: string]: unknown] to allow any other properties
    [key: string]: unknown
}


export interface PrismaCountArgs {
    where?: Record<string, unknown>
    include?: Record<string, unknown>
    select?: Record<string, boolean | Record<string, unknown>>
    orderBy?: Record<string, unknown> | Record<string, unknown>[]
    skip?: number,
    take?: number,
    cursor?: Record<string, unknown>
    distinct?: string[] | string,
    //other than above, you can add other things so we will use [key: string]: unknown] to allow any other properties
    [key: string]: unknown
}