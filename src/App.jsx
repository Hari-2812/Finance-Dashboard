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

const pieColors = ['#EF4444', '#FB7185', '#F59E0B', '#6366F1', '#14B8A6', '#A855F7']

function App() {
  // student style state handling
  const [transactions, setTransactions] = useState(startTransactions)
  const [filterType, setFilterType] = useState('All')
  const [searchText, setSearchText] = useState('')
  const [role, setRole] = useState('Admin')

  const [formDate, setFormDate] = useState('')
  const [formAmount, setFormAmount] = useState('')
  const [formCategory, setFormCategory] = useState('')
  const [formType, setFormType] = useState('Expense')

  const [income, setIncome] = useState(0)
  const [expense, setExpense] = useState(0)

  useEffect(() => {
    let tempIncome = 0
    let tempExpense = 0

    transactions.forEach((item) => {
      if (item.type === 'Income') {
        tempIncome += Number(item.amount)
      } else {
        tempExpense += Number(item.amount)
      }
    })

    setIncome(tempIncome)
    setExpense(tempExpense)
  }, [transactions])

  const totalBalance = income - expense

  const filteredTransactions = useMemo(() => {
    return transactions.filter((item) => {
      const typeMatch = filterType === 'All' ? true : item.type === filterType

      const searchLower = searchText.toLowerCase()
      const searchMatch =
        item.category.toLowerCase().includes(searchLower) ||
        String(item.amount).includes(searchLower) ||
        item.date.includes(searchLower)

      return typeMatch && searchMatch
    })
  }, [transactions, filterType, searchText])

  const lineData = useMemo(() => {
    // simple chart data by date
    return transactions.map((item) => {
      return {
        date: item.date.slice(5),
        amount: Number(item.amount),
        type: item.type,
      }
    })
  }, [transactions])

  const pieData = useMemo(() => {
    const expenseOnly = transactions.filter((item) => item.type === 'Expense')
    const mapObj = {}

    expenseOnly.forEach((item) => {
      if (!mapObj[item.category]) {
        mapObj[item.category] = 0
      }
      mapObj[item.category] += Number(item.amount)
    })

    return Object.keys(mapObj).map((key) => ({
      name: key,
      value: mapObj[key],
    }))
  }, [transactions])

  const highestExpenseCategory = useMemo(() => {
    if (pieData.length === 0) return 'No expense yet'

    let maxObj = pieData[0]
    pieData.forEach((item) => {
      if (item.value > maxObj.value) {
        maxObj = item
      }
    })

    return `${maxObj.name} ($${maxObj.value})`
  }, [pieData])

  const addTransaction = (e) => {
    e.preventDefault()

    if (!formDate || !formAmount || !formCategory) {
      alert('Please fill all fields')
      return
    }

    const newItem = {
      id: Date.now(),
      date: formDate,
      amount: Number(formAmount),
      category: formCategory,
      type: formType,
    }

    setTransactions([newItem, ...transactions])

    // reset form simple way
    setFormDate('')
    setFormAmount('')
    setFormCategory('')
    setFormType('Expense')
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">My Finance Dashboard</h1>

        <div className="bg-white border border-gray-200 rounded p-3 mb-4">
          <label className="text-sm mr-2">Switch Role:</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          >
            <option>Admin</option>
            <option>Viewer</option>
          </select>
          <span className="ml-3 text-xs text-gray-500">Current: {role}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded border hover:shadow-sm">
            <p className="text-gray-500 text-sm">Total Balance</p>
            <p className="text-xl font-semibold mt-1">${totalBalance}</p>
          </div>
          <div className="bg-white p-4 rounded border hover:shadow-sm">
            <p className="text-gray-500 text-sm">Income</p>
            <p className="text-xl font-semibold mt-1 text-green-600">${income}</p>
          </div>
          <div className="bg-white p-4 rounded border hover:shadow-sm">
            <p className="text-gray-500 text-sm">Expenses</p>
            <p className="text-xl font-semibold mt-1 text-red-500">${expense}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <div className="bg-white p-4 rounded border">
            <h2 className="font-semibold mb-3">Amount Trend (Simple Line Chart)</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="amount" stroke="#4F46E5" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-4 rounded border">
            <h2 className="font-semibold mb-3">Expense Categories (Pie)</h2>
            <div className="h-64">
              {pieData.length === 0 ? (
                <p className="text-gray-500 mt-10">No expense data to show.</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85}>
                      {pieData.map((entry, index) => (
                        <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded border mb-6">
          <h2 className="font-semibold mb-3">Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-gray-50 p-3 rounded border">
              <p className="text-sm text-gray-500">Highest Expense Category</p>
              <p className="font-medium mt-1">{highestExpenseCategory}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded border">
              <p className="text-sm text-gray-500">Total Savings</p>
              <p className="font-medium mt-1">${totalBalance}</p>
            </div>
          </div>
        </div>

        {role === 'Admin' && (
          <div className="bg-white p-4 rounded border mb-6">
            <h2 className="font-semibold mb-3">Add Transaction (Admin Only)</h2>
            <form onSubmit={addTransaction} className="grid grid-cols-1 md:grid-cols-5 gap-2">
              <input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="border rounded px-2 py-2 text-sm"
              />
              <input
                type="number"
                placeholder="Amount"
                value={formAmount}
                onChange={(e) => setFormAmount(e.target.value)}
                className="border rounded px-2 py-2 text-sm"
              />
              <input
                type="text"
                placeholder="Category"
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="border rounded px-2 py-2 text-sm"
              />
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value)}
                className="border rounded px-2 py-2 text-sm"
              >
                <option>Income</option>
                <option>Expense</option>
              </select>
              <button
                type="submit"
                className="bg-indigo-500 hover:bg-indigo-600 text-white rounded px-3 py-2 text-sm"
              >
                Add
              </button>
            </form>
          </div>
        )}

        <div className="bg-white p-4 rounded border">
          <h2 className="font-semibold mb-3">Transactions</h2>

          <div className="flex flex-col md:flex-row gap-2 md:items-center mb-3">
            <input
              type="text"
              placeholder="Search by date/category/amount"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="border rounded px-3 py-2 text-sm w-full md:w-72"
            />

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border rounded px-3 py-2 text-sm w-full md:w-40"
            >
              <option>All</option>
              <option>Income</option>
              <option>Expense</option>
            </select>
          </div>

          {filteredTransactions.length === 0 ? (
            <p className="text-gray-500 text-sm">No transactions found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-left text-sm">
                    <th className="p-2 border">Date</th>
                    <th className="p-2 border">Amount</th>
                    <th className="p-2 border">Category</th>
                    <th className="p-2 border">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 text-sm">
                      <td className="p-2 border">{item.date}</td>
                      <td className="p-2 border">${item.amount}</td>
                      <td className="p-2 border">{item.category}</td>
                      <td className="p-2 border">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            item.type === 'Income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {item.type}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
