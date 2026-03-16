import { IRequestUser } from "@/app/interfaces/requestUserInterface";
import { IUpdatePatientHealthDataPayload, IUpdatePatientInfoPayload, IUpdatePatientProfilePayload } from "./patient.interface";
import { prisma } from "@/app/lib/prisma";
import { convertDateTime } from "../schedule/schedule.utils";
import { convertToDateTime } from "./patient.util";

export const PatientService = {

    //!update my patient profile
    async updateMyProfile(payload: IUpdatePatientProfilePayload, user: IRequestUser) {
        //find the patient
        const patientData = await prisma.patient.findUniqueOrThrow({
            where: {
                email: user.email
            },
            include: {
                patientHealthData: true,
                medicalReports: true,
            }
        })

        //tranasaction to update multiple model at a time
        await prisma.$transaction(async (tx) => {
            if (payload.patientInfo) {
                //update patient info
                const result = await tx.patient.update({
                    where: {
                        id: patientData.id
                    },
                    data: {
                        ...payload.patientInfo
                    }
                })

                //now update the user of that patient model as well
                if (payload.patientInfo.name || payload.patientInfo.profilePhoto) {
                    const userData = {
                        name: payload.patientInfo.name ? payload.patientInfo.name : patientData.name,

                        image: payload.patientInfo.profilePhoto ? payload.patientInfo.profilePhoto : patientData.profilePhoto
                    }

                    //update the user now
                    await tx.user.update({
                        where: {
                            id: patientData.userId
                        }, data: {
                            ...userData
                        }
                    })
                };

            }
            //now patient health data
            if (payload.patientHealthData) {
                const healthDataToSave: IUpdatePatientHealthDataPayload = {
                    ...payload.patientHealthData
                }

                if (payload.patientHealthData.dateOfBirth) {
                    //changing
                    healthDataToSave.dateOfBirth = convertToDateTime(
                        typeof healthDataToSave.dateOfBirth === "string" ? healthDataToSave.dateOfBirth : undefined
                    ) as Date;
                }
                //now upsert the patient health data 
                await tx.patientHealthData.upsert({
                    where: {
                        id: patientData.id
                    },
                    update: healthDataToSave,
                    create: {
                        patientId: patientData.id,
                        ...healthDataToSave
                    }
                })
            };

            //medical reports
            if (payload.medicalReports && Array.isArray(payload.medicalReports) && payload.medicalReports.length > 0) {
                for (const report of payload.medicalReports) {
                    if (report.shouldDelete && report.reportId) {
                        //delete
                        await tx.medicalReport.delete({
                            where: {
                                id: report.reportId
                            }
                        })
                    } else if (report.reportName && report.reportLink) {
                        //create
                        await tx.medicalReport.create({
                            data: {
                                patientId: patientData.id,
                                reportLink: report.reportLink,
                                reportName: report.reportName
                            }
                        });
                    }
                }
            }

        })
        const result = await prisma.patient.findUnique({
            where: {
                id: patientData.id
            },
            include: {
                user: true,
                patientHealthData: true,
                medicalReports: true,
            }
        })

        return result;
    }
}