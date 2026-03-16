//patient's basic info

import { BloodGroup, Gender } from "@prisma/prisma/enums";

export interface IUpdatePatientInfoPayload {
    name: string;
    profilePhoto: string;
    contactNumber: string;
    address: string;
}


//patient's basic health info
export interface IUpdatePatientHealthDataPayload {
    gender: Gender;
    dateOfBirth: Date;
    bloodGroup: BloodGroup;
    hasAllergies: boolean;
    hasDiabetes: boolean;
    height: string;
    weight: string;
    smokingStatus: boolean;
    dietaryPreference: string;
    pregnancyStatus: boolean;
    mentalHealthHistory: string;
    immunizationStatus: string;
    hasPastSurgeries: boolean;
    recentAnxiety: boolean;
    recentDepression: boolean;
    maritalStatus: string;
}


//patient's basic medical report
export interface IUpdatePatientMedicalReportPayload {
    reportName?: string;
    reportLink?: string;
    shouldDelete?: boolean;
    reportId?: string;
}



//patient's profile 
export interface IUpdatePatientProfilePayload {
    patientInfo?: IUpdatePatientInfoPayload;
    patientHealthData?: IUpdatePatientHealthDataPayload;
    medicalReports?: IUpdatePatientMedicalReportPayload[]; // can upload multiple file at the same time
}

