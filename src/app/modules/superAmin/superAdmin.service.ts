import { UserStatus } from "@prisma/prisma/enums";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { SpecialtyType, UpdateSpecialType } from "../specialty/dto/specialtyDto";
import { Request, Response } from "express";
import { AppError } from "@/app/errorHelpers/AppError";
import status from "http-status";
import { getAccessToken, getRegreshtoken } from "@/app/utils/token";
import { IUpdateSuperAdminPayload } from "../superAmin/dto/updateSuperAdminDto";


export const SuperAdminService = {

    //! Get all super-admin 
    async getAllSuperAdmins() {
        // return await prisma.admin.findMany();
        return await prisma.superAdmin.findMany({
            where: {
                isDeleted: false,
            },
            orderBy: {
                createdAt: "desc"
            },
            select: {
                id: true,
                name: true,
                email: true,
                profilePhoto: true,
                contactNumber: true,
                createdAt: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        status: true,
                        isDeleted: true,
                        createdAt: true,
                    }
                }
            }
        })
    },


    //! get super-admin by id
    async getSuperAdminById(id: string) {
        const superAdmin = await prisma.superAdmin.findUnique({
            where: {
                id: id
            },
        })
        if (!superAdmin) {
            throw new AppError(status.NOT_FOUND, "Super Admin not found")
        }

        return {
            ...superAdmin,
        };
    },


    //! update super-admin
    async updateSuperAdmin(id: string, payload: IUpdateSuperAdminPayload) {
        // Check if super-admin exists and not deleted
        const existingSuperAdmin = await prisma.superAdmin.findUnique({
            where: { id, isDeleted: false },
        });

        if (!existingSuperAdmin) {
            throw new AppError(status.NOT_FOUND, "Super Admin not found");
        }

        const { ...superAdminData } = payload;

        // Update super-admin basic information
        return await prisma.superAdmin.update({
            where: { id },
            data: superAdminData,
        });
    },

    //!soft Delete super-admin
    async softDeleteById(id: string) {

        // Check if super-admin exists and not already deleted
        const superAdmin = await prisma.superAdmin.findUnique({
            where: { id },
        });

        if (!superAdmin) {
            throw new AppError(status.NOT_FOUND, "Super Admin not found")
        }

        if (superAdmin.isDeleted) {
            throw new AppError(status.NO_CONTENT, "Already deleted")
        }


        return await prisma.superAdmin.update({
            where: {
                id: id
            },
            data: {
                isDeleted: true,
                deletedAt: new Date()
            }
        })
    },
} 