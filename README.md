# Finance Dashboard (React + Tailwind)

This is a simple finance dashboard project made with React.
I built it in a beginner style, so the code is easy to read and not overly complex.

## What this project does

This app helps track money in a simple way.
It shows income, expenses, balance, charts, and transaction records.

## Features implemented

- Dashboard cards for:
  - Total Balance
  - Total Income
  - Total Expenses
- Charts:
  - Simple line chart for transaction amount trend
  - Pie chart for expense categories
- Transactions table with:
  - Date
  - Amount
  - Category
  - Type
- Filter dropdown:
  - All
  - Income
  - Expense
- Search input for quick find (date/category/amount)
- Role switch:
  - Admin can add a new transaction
  - Viewer can only see data
- Insights section:
  - Highest expense category
  - Total savings
- Empty state messages when no data is found
- Basic responsive layout with Tailwind grid/flex

## Tech used

- React
- Vite
- Tailwind CSS
- Recharts (for simple charts)

## How to run this project

1. Install dependencies:

```bash
npm install
```

2. Start development server:

```bash
npm run dev
```

3. Open browser and visit the local URL shown in terminal.

## Build for production

```bash
npm run build
```

## What I learned while building it

- How to manage data using `useState`
- How to update values with `useEffect`
- How to create basic charts from array data
- How to make a simple role based UI in React
- How to use Tailwind classes for quick styling
- How to make basic search and filter logic

## Notes

- Data is mock/hardcoded in `src/mockData.js`.
- The UI is intentionally simple and slightly imperfect like a fresher project.
