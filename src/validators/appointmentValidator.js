import { z } from 'zod'

export const createAppointmentSchema = z.object({
    datum: z.string().datetime('Datum mora biti validan ISO format'),
    staffId: z.string().uuid('staffId mora biti validan UUID'),
    serviceId: z.string().uuid('serviceId mora biti validan UUID'),
    napomena: z.string().optional()
})

export const updateStatusSchema = z.object({
    status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'])
})