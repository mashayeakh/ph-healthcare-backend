// define the class
// make it generic so it can be used for any type of query (doct, patient)
// generic T - > model tupe, for example: Doctor, Patient, etc. TWhereInput - type of the input
//TWhereInput - its like what you fiter like isDeleted, name etc... 
// TIncludeInput - its like what you want to include in the response like appointments, prescriptions etc...

import { IQueryConfig, IQueryParams, PrismaCountArgs, PrismaFindManyArgs, PrismaModelDelegate } from "../interfaces/query.interface"

//now declare a few private proereties in the class
export class QueryBuilder<
    T,
    TWhereInput = Record<string, unknown>,
    TIncludeInput = Record<string, unknown>
> {
    private query: PrismaFindManyArgs
    private countQuery: PrismaCountArgs
    private page: number = 1
    private limit: number = 10
    private skip: number = 0
    private sortBy: string = "createdAt"
    private sortOrder: "asc" | "desc" = "desc"
    private selectFields: Record<string, boolean>


    //call the constructor to initialize the query and countQuery
    constructor(
        private modelName: PrismaModelDelegate,
        private queryParams: IQueryParams,
        private config: IQueryConfig
    ) { 
        this.query={
            where:{},
            include:{},
            select:{},
            orderBy:{},
            skip:0,
            take:0,
        };
        this.countQuery={
            where:{},
        };
    }
}