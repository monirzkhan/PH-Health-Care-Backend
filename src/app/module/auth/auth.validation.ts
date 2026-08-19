import z from "zod"

const PatientRegistrationZodSchema=z.object({
    name: z.string().min(6, "Minimum 6 charecters"),
    email: z.email("Not an email"),
    password: z.string()
    .min(6)
    .refine((val) => /[A-Z]/.test(val), "Add at least one uppercase letter")
    .refine((val) => /[a-z]/.test(val), "Add at least one lowercase letter")
    .refine((val) => /[^A-Za-z0-9]/.test(val), "Needs special char")
    .refine((val) => /[0-9]/.test(val), "Add at least one number"),
    patient:z.object({
        
        contactNumber: z.string().optional()
    })

})

export const patientValidation={
    PatientRegistrationZodSchema
} 