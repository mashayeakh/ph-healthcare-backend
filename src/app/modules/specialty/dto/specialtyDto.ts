export type SpecialtyType = {
    id: string,
    title: string,
    description?: string | null,
    icon?: string | null;
    createdAt: string;
    updatedAt: string;
    isDeleted: boolean;
    deletedAt: string | null;
}



export type UpdateSpecialType = {
    id?: string,
    title?: string,
    description?: string | null,
    icon?: string | null;
} 