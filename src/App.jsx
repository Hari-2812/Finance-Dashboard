import { useEffect, useMemo, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { startTransactions } from './mockData'

const pieColors = ['#4F46E5', '#6366F1', '#14B8A6', '#F59E0B', '#EC4899', '#8B5CF6', '#EF4444']
const API_URL = 'http://localhost:5000/transactions'

function fixTypeText(typeValue) {
  if (String(typeValue).toLowerCase() === 'income') return 'Income'
  return 'Expense'
}

function normalizeList(items) {
  return items.map((item) => ({
    ...item,
    amount: Number(item.amount),
    type: fixTypeText(item.type),
  }))
}

function App() {
  const [listData, setListData] = useState([])
  const [role, setRole] = useState(localStorage.getItem('role') || 'Admin')
  const [searchText, setSearchText] = useState('')
  const [filterType, setFilterType] = useState('All')
  const [sortBy, setSortBy] = useState('newest')

  const [formDate, setFormDate] = useState('')
  const [formAmount, setFormAmount] = useState('')
  const [formCategory, setFormCategory] = useState('Food')
  const [formType, setFormType] = useState('Expense')
  const [editId, setEditId] = useState(null)

  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')

  // load data from backend
  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      setErrorMsg('')

      try {
        const res = await fetch(API_URL)
        if (!res.ok) throw new Error('API error')
        const data = await res.json()
        setListData(normalizeList(data))
      } catch (error) {
        const localBackup = localStorage.getItem('transactions_backup')
        if (localBackup) {
          setListData(normalizeList(JSON.parse(localBackup)))
          setErrorMsg('Backend not reachable. Showing LocalStorage backup.')
        } else {
          setListData(normalizeList(startTransactions))
          setErrorMsg('Backend not reachable. Showing backup data from file.')
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  useEffect(() => {
    localStorage.setItem('transactions_backup', JSON.stringify(listData))
  }, [listData])

  useEffect(() => {
    localStorage.setItem('role', role)
  }, [role])

  // if switched to viewer, clear form/edit states
  useEffect(() => {
    if (role === 'Viewer') {
      setEditId(null)
      setFormDate('')
      setFormAmount('')
      setFormCategory('Food')
      setFormType('Expense')
    }
  }, [role])

  const totals = useMemo(() => {
    let income = 0
    let expense = 0

    listData.forEach((item) => {
      if (item.type === 'Income') income += Number(item.amount)
      if (item.type === 'Expense') expense += Number(item.amount)
    })

    return {
      income,
      expense,
      balance: income - expense,
    }
  }, [listData])

  const viewData = useMemo(() => {
    let next = [...listData]

    next = next.filter((item) => {
      const search = searchText.toLowerCase()
      const typeOk = filterType === 'All' ? true : item.type === filterType
      const searchOk =
        item.category.toLowerCase().includes(search) ||
        item.date.includes(search) ||
        String(item.amount).includes(search)

      return typeOk && searchOk
    })

    if (sortBy === 'newest') next.sort((a, b) => new Date(b.date) - new Date(a.date))
    if (sortBy === 'oldest') next.sort((a, b) => new Date(a.date) - new Date(b.date))
    if (sortBy === 'amountHigh') next.sort((a, b) => b.amount - a.amount)
    if (sortBy === 'amountLow') next.sort((a, b) => a.amount - b.amount)

    return next
  }, [listData, searchText, filterType, sortBy])

  const lineData = useMemo(() => {
    const byDate = [...listData].sort((a, b) => new Date(a.date) - new Date(b.date))
    let runningBalance = 0

    return byDate.map((item) => {
      if (item.type === 'Income') runningBalance += Number(item.amount)
      else runningBalance -= Number(item.amount)

      return {
        date: item.date.slice(5),
        balance: runningBalance,
      }
    })
  }, [listData])

  const pieData = useMemo(() => {
    const mapObj = {}

    listData
      .filter((item) => item.type === 'Expense')
      .forEach((item) => {
        if (!mapObj[item.category]) mapObj[item.category] = 0
        mapObj[item.category] += Number(item.amount)
      })

    return Object.keys(mapObj).map((key) => ({ name: key, value: mapObj[key] }))
  }, [listData])

  const highestExpenseText = useMemo(() => {
    if (!pieData.length) return 'No expense data'

    const top = pieData.reduce((max, item) => (item.value > max.value ? item : max), pieData[0])
    return `${top.name} ($${top.value})`
  }, [pieData])

  const monthlyCompare = useMemo(() => {
    if (!listData.length) {
      return {
        currentMonthIncome: 0,
        currentMonthExpense: 0,
        lastMonthIncome: 0,
        lastMonthExpense: 0,
        currentLabel: 'N/A',
        lastLabel: 'N/A',
      }
    }

    // student style: pick latest month from data
    const sorted = [...listData].sort((a, b) => new Date(b.date) - new Date(a.date))
    const latest = new Date(sorted[0].date)
    const currentMonth = latest.getMonth()
    const currentYear = latest.getFullYear()

    const prevMonthDate = new Date(currentYear, currentMonth - 1, 1)
    const prevMonth = prevMonthDate.getMonth()
    const prevYear = prevMonthDate.getFullYear()

    let currentMonthIncome = 0
    let currentMonthExpense = 0
    let lastMonthIncome = 0
    let lastMonthExpense = 0

    listData.forEach((item) => {
      const d = new Date(item.date)
      const month = d.getMonth()
      const year = d.getFullYear()

      if (month === currentMonth && year === currentYear) {
        if (item.type === 'Income') currentMonthIncome += item.amount
        if (item.type === 'Expense') currentMonthExpense += item.amount
      }

      if (month === prevMonth && year === prevYear) {
        if (item.type === 'Income') lastMonthIncome += item.amount
        if (item.type === 'Expense') lastMonthExpense += item.amount
      }
    })

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    return {
      currentMonthIncome,
      currentMonthExpense,
      lastMonthIncome,
      lastMonthExpense,
      currentLabel: `${monthNames[currentMonth]} ${currentYear}`,
      lastLabel: `${monthNames[prevMonth]} ${prevYear}`,
    }
  }, [listData])

  async function submitForm(e) {
    e.preventDefault()

    if (!formDate || !formAmount || !formCategory) {
      alert('Please fill all fields')
      return
    }

    const payload = {
      date: formDate,
      amount: Number(formAmount),
      category: formCategory,
      type: fixTypeText(formType),
    }

    try {
      if (editId) {
        const res = await fetch(`${API_URL}/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error('Cannot update')
        const updated = await res.json()
        const safeUpdated = normalizeList([updated])[0]
        setListData((prev) =>
          prev.map((item) => (item.id === editId ? safeUpdated : item)),
        )
      } else {
        const res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error('Cannot add')
        const created = await res.json()
        setListData((prev) => [...normalizeList([created]), ...prev])
      }

      setEditId(null)
      setFormDate('')
      setFormAmount('')
      setFormCategory('Food')
      setFormType('Expense')
    } catch (error) {
      alert('Action failed. Please check backend server.')
    }
  }

  function startEdit(item) {
    setEditId(item.id)
    setFormDate(item.date)
    setFormAmount(String(item.amount))
    setFormCategory(item.category)
    setFormType(item.type)
  }

  async function removeItem(id) {
    const ok = window.confirm('Delete this item?')
    if (!ok) return

    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Cannot delete')
      setListData((prev) => prev.filter((item) => item.id !== id))
    } catch (error) {
      alert('Delete failed. Please check backend server.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 text-gray-800">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-indigo-700">Finance Dashboard</h1>
            <p className="text-xs text-gray-500">Simple tracker project</p>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm">Role:</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white"
            >
              <option>Admin</option>
              <option>Viewer</option>
            </select>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-5 grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-4">
        <aside className="bg-white border border-gray-200 rounded-xl p-4 h-fit shadow-sm">
          <p className="text-xs uppercase text-gray-500 mb-2">Navigation</p>
          <ul className="space-y-2 text-sm">
            <li className="bg-indigo-50 text-indigo-700 px-3 py-2 rounded-md">Overview</li>
            <li className="hover:bg-gray-100 px-3 py-2 rounded-md transition">Transactions</li>
            <li className="hover:bg-gray-100 px-3 py-2 rounded-md transition">Insights</li>
          </ul>
          <div className="mt-5 p-3 rounded-md bg-gray-50 border text-xs text-gray-600">
            Current mode: <b>{role}</b>
          </div>
        </aside>

        <main>
          {errorMsg && (
            <div className="mb-3 bg-amber-50 border border-amber-300 text-amber-700 text-sm rounded-lg p-2">{errorMsg}</div>
          )}

          {listData.length === 0 && !isLoading && (
            <div className="mb-4 text-sm bg-white border border-gray-200 rounded-xl p-3">No data available</div>
          )}

          <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:-translate-y-0.5 transition">
              <p className="text-sm text-gray-500">Total Balance</p>
              <p className="text-2xl font-semibold text-indigo-700 mt-1">${totals.balance}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:-translate-y-0.5 transition">
              <p className="text-sm text-gray-500">Income</p>
              <p className="text-2xl font-semibold text-green-600 mt-1">${totals.income}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:-translate-y-0.5 transition">
              <p className="text-sm text-gray-500">Expense</p>
              <p className="text-2xl font-semibold text-red-500 mt-1">${totals.expense}</p>
            </div>
          </section>

          <section className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-5">
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <h2 className="font-semibold mb-3">Balance Trend</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="balance" stroke="#4F46E5" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <h2 className="font-semibold mb-3">Expense by Category</h2>
              <div className="h-64">
                {!pieData.length ? (
                  <p className="text-sm text-gray-500 mt-10">No transactions available</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90}>
                        {pieData.map((entry, i) => (
                          <Cell key={entry.name} fill={pieColors[i % pieColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <p className="text-sm text-gray-500">Highest spending category</p>
              <p className="font-semibold mt-1">{highestExpenseText}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <p className="text-sm text-gray-500">Monthly income vs expense</p>
              <p className="text-xs text-gray-500 mt-1">{monthlyCompare.currentLabel}</p>
              <p className="font-semibold text-green-600">Income: ${monthlyCompare.currentMonthIncome}</p>
              <p className="font-semibold text-red-500">Expense: ${monthlyCompare.currentMonthExpense}</p>
              <p className="text-xs text-gray-500 mt-2">{monthlyCompare.lastLabel}</p>
              <p className="font-semibold text-green-600">Income: ${monthlyCompare.lastMonthIncome}</p>
              <p className="font-semibold text-red-500">Expense: ${monthlyCompare.lastMonthExpense}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <p className="text-sm text-gray-500">Total savings</p>
              <p className="font-semibold mt-1 text-indigo-700">${totals.balance}</p>
            </div>
          </section>

          {role === 'Admin' && (
            <section className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm mb-5">
              <h2 className="font-semibold mb-3">{editId ? 'Edit Transaction' : 'Add Transaction'}</h2>
              <form onSubmit={submitForm} className="grid grid-cols-1 md:grid-cols-5 gap-2">
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
                <input
                  type="number"
                  placeholder="Amount"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option>Food</option>
                  <option>Transport</option>
                  <option>Shopping</option>
                  <option>Salary</option>
                  <option>Freelance</option>
                  <option>Bills</option>
                  <option>Entertainment</option>
                </select>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option>Income</option>
                  <option>Expense</option>
                </select>
                <button
                  type="submit"
                  className="bg-indigo-600 text-white rounded-md px-3 py-2 text-sm hover:bg-indigo-700 transition"
                >
                  {editId ? 'Update' : 'Add'}
                </button>
              </form>
            </section>
          )}

          <section className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <h2 className="font-semibold mb-3">Transactions</h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
              <input
                type="text"
                placeholder="Search by date/category/amount"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option>All</option>
                <option>Income</option>
                <option>Expense</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="newest">Sort: Newest Date</option>
                <option value="oldest">Sort: Oldest Date</option>
                <option value="amountHigh">Sort: Amount High to Low</option>
                <option value="amountLow">Sort: Amount Low to High</option>
              </select>
              <div className="text-xs text-gray-500 flex items-center">Rows: {viewData.length}</div>
            </div>

            {isLoading ? (
              <p className="text-sm text-gray-500">Loading transactions...</p>
            ) : viewData.length === 0 ? (
              <p className="text-sm text-gray-500">No transactions available</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      <th className="border p-2">Date</th>
                      <th className="border p-2">Amount</th>
                      <th className="border p-2">Category</th>
                      <th className="border p-2">Type</th>
                      {role === 'Admin' && <th className="border p-2">Action</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {viewData.map((item) => (
                      <tr key={item.id} className="hover:bg-indigo-50 transition">
                        <td className="border p-2">{item.date}</td>
                        <td className="border p-2">${item.amount}</td>
                        <td className="border p-2">{item.category}</td>
                        <td className="border p-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              item.type === 'Income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {item.type}
                          </span>
                        </td>
                        {role === 'Admin' && (
                          <td className="border p-2">
                            <div className="flex gap-2">
                              <button
                                onClick={() => startEdit(item)}
                                className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs hover:bg-blue-200 transition"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => removeItem(item.id)}
                                className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs hover:bg-red-200 transition"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  )
}

export default App
