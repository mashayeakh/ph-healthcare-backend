// define the class
// make it generic so it can be used for any type of query (doct, patient)
// generic T - > model tupe, for example: Doctor, Patient, etc. TWhereInput - type of the input
//TWhereInput - its like what you fiter like isDeleted, name etc... 
// TIncludeInput - its like what you want to include in the response like appointments, prescriptions etc...

import { IQueryConfig, IQueryParams, PrismaCountArgs, PrismaFindManyArgs, PrismaModelDelegate, PrismaNumberFilter, PrismaStringFilter, PrismaWhereConditions } from "../interfaces/query.interface"

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

    //filter method
    filter(): this {


        // doctors?specialty=cardiology&appoitmentFee[lt]=100
        const { filterableFields } = this.config;
        const excludeFiled = [
            'searchTerm',
            'page',
            'limit',
            'sortBy',
            'sortOrder',
            'fields',
            'includes'
        ]
        const filterParams: Record<string, unknown> = {};

        //{specialty:'cardiology', appointmentFee:{lt:100}}
        Object.keys(this.queryParams).forEach((key) => {
            if (!excludeFiled.includes(key)) {
                filterParams[key] = this.queryParams[key];
            }
        })


        const queryWhere = this.query.where as Record<string, unknown>
        const countQueryWhere = this.countQuery.where as Record<string, unknown>

        Object.keys(filterParams).forEach((key) => {
            const value = filterParams[key];

            if (value === undefined || value === "") {
                return;
            }

            const isAllowedField =
                !filterableFields ||
                filterableFields.length === 0 ||
                filterableFields.includes(key)

            if (!isAllowedField) {
                return;
            }

            //doctotFieldrelatedFilds=['specialties.specialty.title','appointmentFee']

            //doctors?user.name=jhon=>{user:{name:"jhon"}}
            if (key.includes(".")) {
                const parts = key.split(".");

                if (filterableFields && !filterableFields.includes(key)) {
                    return;
                }



                if (parts.length === 2) {
                    const [relation, nestedField] = parts;

                    if (!queryWhere[relation]) {
                        queryWhere[relation] = {};
                        countQueryWhere[relation] = {};
                    }

                    queryWhere[relation] = {
                        [nestedField]: this.parseFilterValue(value)
                    }

                    countQueryWhere[relation] = {
                        [nestedField]: this.parseFilterValue(value)
                    }
                    return;
                } else if (parts.length === 3) {
                    const [relation, nestedRelation, nestedField] = parts;

                    if (!queryWhere[relation]) {
                        queryWhere[relation] = {};
                        countQueryWhere[relation] = {};
                    }

                    queryWhere[relation] = {
                        [nestedRelation]: {
                            [nestedField]: this.parseFilterValue(value)
                        }
                    }

                    countQueryWhere[relation] = {
                        [nestedRelation]: {
                            [nestedField]: this.parseFilterValue(value)
                        }
                    }
                    return
                }
            } //for direct fidles
            else {
                queryWhere[key] = this.parseFilterValue(value)
                countQueryWhere[key] = this.parseFilterValue(value)

                return;
            }


            //for range filter
            if (typeof value === "object" && value !== null && !Array.isArray(value)) {
                queryWhere[key] = this.parseFilterValue(value as Record<string, string | number>);
                countQueryWhere[key] = this.parseFilterValue(value)
                return;
            }


            //direct value parsing like true, false, number, array etc..
            queryWhere[key] = this.parseFilterValue(value);
            countQueryWhere[key] = this.parseFilterValue(value)
        })

        return this;
    }

    //pagination
    paginate(): this {

        //convert the page into number
        const page = Number(this.queryParams.page) || 1
        const limit = Number(this.queryParams.limit) || 1

        this.page = page;
        this.limit = limit;
        this.skip = (page - 1) * limit

        this.query.skip = this.skip;
        this.query.take = this.limit

        return this;
    }


    sort(): this {

        const sortBy = this.queryParams.sortBy || "createdAt"
        const sortOrder = this.queryParams.sortOrder === "asc" ? "asc" : "desc"

        // this.query.orderBy = {
        //     [sortBy]: sortOrder
        // }

        this.sortBy = sortBy;
        this.sortOrder = sortOrder

        // doct.sortBy=user.name&sortOrder=asc=>orderBy:{user:{name:"asc"}}}

        if(sortBy.includes(".") ){
            const parts = sortBy.split(".");

            if(parts.length === 2){
                const [relation, nestedField] = parts;

                this.query.orderBy = {
                    [relation]: {
                        [nestedField]: sortOrder
                    }
                }
            }else if(parts.length === 3){
                const [relation, nestedRelation, nestedField] = parts;

                this.query.orderBy = {
                    [relation]: {
                        [nestedRelation]: {
                            [nestedField]: sortOrder
                        }
                    }
                }
            }else{
                this.query.orderBy = {
                    [sortBy]: sortOrder
                }
            }
        }


        return this;
    }



    private parseFilterValue(value: unknown): unknown {
        if (value === 'true') {
            return true;
        }
        if (value === 'false') {
            return false;
        }
        if (typeof value === 'string' && !isNaN(Number(value)) && value !== "") {
            return Number(value)
        }

        if (Array.isArray(value)) {
            return {
                in: value.map((item) => this.parseFilterValue(item))
            }
        }
        return value;
    }

    private parseRangeFilter(value: Record<string, string | number>): PrismaNumberFilter | PrismaStringFilter | Record<string, unknown> {
        const rangeQuery: Record<string, string | number | (string | number)[]> = {}

        Object.keys(value).forEach((op) => {
            const operatorVal = value[op];

            const parsedVal: string | number = typeof operatorVal === "string" && !isNaN(Number(operatorVal)) ? Number(operatorVal) : operatorVal;

            switch (op) {
                case "lt":
                case "lte":
                case "gt":
                case "gte":
                case "equals":
                case "not":
                case "contains":
                case "startsWith":
                case "endsWith":
                    rangeQuery[op] = parsedVal;
                    break;

                case "in":
                case "notIn":
                    if (Array.isArray(operatorVal)) {
                        rangeQuery[op] = operatorVal;
                    } else {
                        rangeQuery[operatorVal] = [parsedVal]
                    }
                    break;
                default:
                    break;

            }
        });

        return Object.keys(rangeQuery).length > 0 ? rangeQuery : value
    }
}

