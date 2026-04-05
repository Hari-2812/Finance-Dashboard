import express from 'express'
import cors from 'cors'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const app = express()
const PORT = 5000

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dataFilePath = path.join(__dirname, 'data', 'transactions.json')

app.use(cors())
app.use(express.json())

async function readTransactions() {
  const text = await fs.readFile(dataFilePath, 'utf-8')
  return JSON.parse(text)
}

async function saveTransactions(items) {
  await fs.writeFile(dataFilePath, JSON.stringify(items, null, 2))
}

app.get('/transactions', async (req, res) => {
  try {
    const items = await readTransactions()
    res.json(items)
  } catch (error) {
    res.status(500).json({ message: 'Cannot read transactions' })
  }
})

app.post('/transactions', async (req, res) => {
  try {
    const { date, amount, category, type } = req.body

    if (!date || !amount || !category || !type) {
      return res.status(400).json({ message: 'Please send all fields' })
    }

    const items = await readTransactions()
    const newItem = {
      id: Date.now(),
      date,
      amount: Number(amount),
      category,
      type,
    }

    items.unshift(newItem)
    await saveTransactions(items)
    res.status(201).json(newItem)
  } catch (error) {
    res.status(500).json({ message: 'Cannot add transaction' })
  }
})

app.put('/transactions/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    const { date, amount, category, type } = req.body
    if (!date || !amount || !category || !type) {
      return res.status(400).json({ message: 'Please send all fields' })
    }
    const items = await readTransactions()

    const index = items.findIndex((item) => item.id === id)
    if (index === -1) {
      return res.status(404).json({ message: 'Transaction not found' })
    }

    items[index] = {
      ...items[index],
      date,
      amount: Number(amount),
      category,
      type,
    }

    await saveTransactions(items)
    res.json(items[index])
  } catch (error) {
    res.status(500).json({ message: 'Cannot update transaction' })
  }
})

app.delete('/transactions/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    const items = await readTransactions()
    const exists = items.some((item) => item.id === id)
    if (!exists) {
      return res.status(404).json({ message: 'Transaction not found' })
    }

    const nextItems = items.filter((item) => item.id !== id)
    await saveTransactions(nextItems)

    res.json({ message: 'Deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Cannot delete transaction' })
  }
})

app.listen(PORT, () => {
  console.log(`Backend server started on http://localhost:${PORT}`)
})
