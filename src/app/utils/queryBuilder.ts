// define the class
// make it generic so it can be used for any type of query (doct, patient)
// generic T - > model tupe, for example: Doctor, Patient, etc. TWhereInput - type of the input
//TWhereInput - its like what you fiter like isDeleted, name etc... 
// TIncludeInput - its like what you want to include in the response like appointments, prescriptions etc...

import { IQueryConfig, IQueryParams, PrismaCountArgs, PrismaFindManyArgs, PrismaModelDelegate, PrismaStringFilter, PrismaWhereConditions } from "../interfaces/query.interface"

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
        this.query = {
            where: {},
            include: {},
            select: {},
            orderBy: {},
            skip: 0,
            take: 0,
        };
        this.countQuery = {
            where: {},
        };
    }

    //search method
    search(): this {
        const { searchTerm } = this.queryParams;
        const { searchableFields } = this.config;
        //doctorSearchableFields = ['user.name', 'user.email', 'specialization.name']
        //check if searchTerm, searchableFields exists and searchabfleFields length is greater than 0
        if (searchTerm && searchableFields && searchableFields.length > 0) {
            const searchConditions: Record<string, unknown>[] =
                searchableFields.map((field) => {
                    if (field.includes(".")) {
                        const parts = field.split(".")

                        if (parts.length === 2) { // specialties.spcialty.description
                            const [relation, nestedField] = parts;
                            const strignFilter: PrismaStringFilter = {
                                contains: searchTerm,
                                mode: "insensitive" as const
                            }

                            return {
                                [relation]: {
                                    [nestedField]: strignFilter
                                }
                            }

                        } else if (parts.length === 3) {
                            const [relation, nestedRelation, nestedField] = parts;
                            const strignFilter: PrismaStringFilter = {
                                contains: searchTerm,
                                mode: "insensitive" as const
                            }

                            return {
                                [relation]: {
                                    [nestedRelation]: {
                                        [nestedField]: strignFilter
                                    }
                                }
                            }
                        }

                        //direct fileds like name,email etc..
                        const stringFilter: PrismaStringFilter = {
                            contains: searchTerm,
                            mode: "insensitive" as const
                        }
                        return {
                            [field]: stringFilter
                        }
                    }
                })

            const whereConditios = this.query.where as PrismaWhereConditions
            whereConditios.OR = searchConditions;
            const countWhereConditions = this.countQuery.where as PrismaWhereConditions


        }

        return this;
    }
}