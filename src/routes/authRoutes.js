import { Router } from 'express'
import { register, login } from '../controllers/authController.js'
import { validate } from '../middleware/validate.js'
import { registerSchema, loginSchema } from '../validators/authValidator.js'
import { requireAuth } from '../middleware/authMiddleware.js'

const router = Router()

router.post('/register', validate(registerSchema), register)

router.post('/login', validate(loginSchema), login)

router.get('/me', requireAuth, (req, res) => {
    res.json({ user: req.user })
})

export default router