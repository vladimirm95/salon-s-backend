import { z } from 'zod'

export const registerSchema = z.object({
    email: z.string().email('Email nije validan'),
    password: z.string().min(6, 'Lozinka mora imati bar 6 karaktera'),
    ime: z.string().min(2, 'Ime mora imati bar 2 karaktera'),
    telefon: z.string().optional()
})

export const loginSchema = z.object({
    email: z.string().email('Email nije validan'),
    password: z.string().min(1, 'Lozinka je obavezna')
})