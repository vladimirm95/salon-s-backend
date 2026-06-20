import prisma from '../config/prisma.js'

export const createAppointment = async (req, res) => {
    try {
        const { datum, staffId, serviceId, napomena } = req.body
        const userId = req.user.userId

        const service = await prisma.service.findUnique({
            where: { id: serviceId }
        })

        if (!service || !service.aktivna) {
            return res.status(404).json({ error: 'Usluga ne postoji ili nije aktivna' })
        }

        const staff = await prisma.staff.findUnique({
            where: { id: staffId }
        })

        if (!staff || !staff.aktivan) {
            return res.status(404).json({ error: 'Frizer ne postoji ili nije aktivan' })
        }

        const datumPocetak = new Date(datum)
        const datumKraj = new Date(datumPocetak.getTime() + service.trajanje * 60000)

        const preklapanje = await prisma.appointment.findFirst({
            where: {
                staffId,
                status: { in: ['PENDING', 'CONFIRMED'] },
                datum: {
                    gte: new Date(datumPocetak.getTime() - 1000 * 60 * 60 * 4),
                    lte: datumKraj
                }
            },
            include: { service: true }
        })

        if (preklapanje) {
            const preklapanjeKraj = new Date(
                preklapanje.datum.getTime() + preklapanje.service.trajanje * 60000
            )
            if (datumPocetak < preklapanjeKraj && datumKraj > preklapanje.datum) {
                return res.status(409).json({ error: 'Frizer je već zauzet u tom terminu' })
            }
        }

        const noviTermin = await prisma.appointment.create({
            data: {
                datum: datumPocetak,
                userId,
                staffId,
                serviceId,
                napomena
            },
            include: {
                service: true,
                staff: true
            }
        })

        res.status(201).json({
            message: 'Termin uspešno zakazan',
            appointment: noviTermin
        })

    } catch (error) {
        console.error('Greška pri zakazivanju:', error)
        res.status(500).json({ error: 'Greška na serveru' })
    }
}

export const getMyAppointments = async (req, res) => {
    try {
        const userId = req.user.userId

        const termini = await prisma.appointment.findMany({
            where: { userId },
            include: {
                service: true,
                staff: true
            },
            orderBy: { datum: 'asc' }
        })

        res.json({ appointments: termini })

    } catch (error) {
        console.error('Greška pri dohvatanju termina:', error)
        res.status(500).json({ error: 'Greška na serveru' })
    }
}

export const getAllAppointments = async (req, res) => {
    try {
        const termini = await prisma.appointment.findMany({
            include: {
                service: true,
                staff: true,
                user: {
                    select: { id: true, ime: true, email: true, telefon: true }
                }
            },
            orderBy: { datum: 'asc' }
        })

        res.json({ appointments: termini })

    } catch (error) {
        console.error('Greška pri dohvatanju termina:', error)
        res.status(500).json({ error: 'Greška na serveru' })
    }
}

export const cancelAppointment = async (req, res) => {
    try {
        const { id } = req.params
        const userId = req.user.userId
        const role = req.user.role

        const termin = await prisma.appointment.findUnique({
            where: { id }
        })

        if (!termin) {
            return res.status(404).json({ error: 'Termin ne postoji' })
        }

        if (termin.userId !== userId && role !== 'ADMIN') {
            return res.status(403).json({ error: 'Nemate dozvolu da otkažete ovaj termin' })
        }

        const azuriranTermin = await prisma.appointment.update({
            where: { id },
            data: { status: 'CANCELLED' }
        })

        res.json({
            message: 'Termin otkazan',
            appointment: azuriranTermin
        })

    } catch (error) {
        console.error('Greška pri otkazivanju:', error)
        res.status(500).json({ error: 'Greška na serveru' })
    }
}

export const updateAppointmentStatus = async (req, res) => {
    try {
        const { id } = req.params
        const { status } = req.body

        const termin = await prisma.appointment.update({
            where: { id },
            data: { status }
        })

        res.json({
            message: 'Status termina ažuriran',
            appointment: termin
        })

    } catch (error) {
        console.error('Greška pri ažuriranju statusa:', error)
        res.status(500).json({ error: 'Greška na serveru' })
    }
}