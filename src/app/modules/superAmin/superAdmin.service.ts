import { UserStatus } from "@prisma/prisma/enums";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { SpecialtyType, UpdateSpecialType } from "../specialty/dto/specialtyDto";
import { Request, Response } from "express";
import { AppError } from "@/app/errorHelpers/AppError";
import status from "http-status";
import { getAccessToken, getRegreshtoken } from "@/app/utils/token";
import { IUpdateAdminPayload } from "./dto/updateSuperAdminDto";


export const AdminService = {

    //! Get all admin 
    async getAllAdmins() {
        // return await prisma.admin.findMany();
        return await prisma.admin.findMany({
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


    //! get admin by id
    async getAdminById(id: string) {
        const admin = await prisma.admin.findUnique({
            where: {
                id: id
            },
        })
        if (!admin) {
            throw new AppError(status.NOT_FOUND, "Admin not found")
        }

        return {
            ...admin,
        };
    },


    //! update Admin
    async updateAdmin(id: string, payload: IUpdateAdminPayload) {
        // Check if admin exists and not deleted
        const existingAdmin = await prisma.admin.findUnique({
            where: { id, isDeleted: false },
        });

        if (!existingAdmin) {
            throw new AppError(status.NOT_FOUND, "Admin not found");
        }

        const { ...adminData } = payload;

        // Update admin basic information
        return await prisma.admin.update({
            where: { id },
            data: adminData,
        });
    },

    //!soft Delete admin
    async softDeleteById(id: string) {


        // Check if admin exists and not already deleted
        const admin = await prisma.admin.findUnique({
            where: { id },
        });


        if (!admin) {
            throw new AppError(status.NOT_FOUND, "Doctor not found")
        }

        if (admin.isDeleted) {
            throw new AppError(status.NO_CONTENT, "Already deleted")
        }



        return await prisma.admin.update({
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