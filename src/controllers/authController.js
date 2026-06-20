import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import prisma from '../config/prisma.js'

export const register = async (req, res) => {
    try {
        const { email, password, ime, telefon } = req.body

        const postojeciKorisnik = await prisma.user.findUnique({
            where: { email }
        })

        if (postojeciKorisnik) {
            return res.status(409).json({ error: 'Korisnik sa ovim emailom već postoji' })
        }

        const hashLozinke = await bcrypt.hash(password, 10)

        const noviKorisnik = await prisma.user.create({
            data: {
                email,
                password: hashLozinke,
                ime,
                telefon
            },
            select: {
                id: true,
                email: true,
                ime: true,
                role: true,
                createdAt: true
            }
        })

        res.status(201).json({
            message: 'Registracija uspešna',
            user: noviKorisnik
        })

    } catch (error) {
        console.error('Greška pri registraciji:', error)
        res.status(500).json({ error: 'Greška na serveru' })
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body

        const korisnik = await prisma.user.findUnique({
            where: { email }
        })

        if (!korisnik) {
            return res.status(401).json({ error: 'Pogrešan email ili lozinka' })
        }

        const lozinkaTacna = await bcrypt.compare(password, korisnik.password)

        if (!lozinkaTacna) {
            return res.status(401).json({ error: 'Pogrešan email ili lozinka' })
        }

        const token = jwt.sign(
            { userId: korisnik.id, role: korisnik.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        )

        res.json({
            message: 'Prijava uspešna',
            token,
            user: {
                id: korisnik.id,
                email: korisnik.email,
                ime: korisnik.ime,
                role: korisnik.role
            }
        })

    } catch (error) {
        console.error('Greška pri prijavi:', error)
        res.status(500).json({ error: 'Greška na serveru' })
    }
}