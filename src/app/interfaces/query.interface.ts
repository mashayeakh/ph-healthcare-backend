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


//for model
export interface PrismaModelDelegate {
    findMany(args?: any): Promise<any[]>
    count(args?: any): Promise<number>
}


//for all the search params

export interface IQueryParams {
    searchItem?: string,
    page?: string,
    limit?: string,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc',
    fileds?: string,
    includes?: string,
    [key: string]: string | undefined
}


//for the config
export interface IQueryConfig {
    searchableFields: string[],
    filterableFields: string[]
}







