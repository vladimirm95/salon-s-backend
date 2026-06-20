import { Router } from 'express'
import {
    createAppointment,
    getMyAppointments,
    getAllAppointments,
    cancelAppointment,
    updateAppointmentStatus
} from '../controllers/appointmentController.js'
import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js'
import { validate } from '../middleware/validate.js'
import { createAppointmentSchema, updateStatusSchema } from '../validators/appointmentValidator.js'

const router = Router()

router.post('/', requireAuth, validate(createAppointmentSchema), createAppointment)
router.get('/mine', requireAuth, getMyAppointments)
router.get('/', requireAuth, requireAdmin, getAllAppointments)
router.patch('/:id/cancel', requireAuth, cancelAppointment)
router.patch('/:id/status', requireAuth, requireAdmin, validate(updateStatusSchema), updateAppointmentStatus)

export default router