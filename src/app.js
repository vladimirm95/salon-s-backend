import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'

dotenv.config()

const app = express()

app.use(helmet())
app.use(cors())
app.use(express.json())

app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Salon S backend radi!' })
})

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
    console.log(`Server pokrenut na portu ${PORT}`)
})

export default app