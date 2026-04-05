# Finance Dashboard (Beginner Project)

This is a beginner-friendly finance dashboard project with a cleaner fintech-style UI redesign.
It has a React frontend and a simple Node.js + Express backend.
The app helps track income and expense transactions.

## Project overview

In this project, user can:
- See total balance, total income, total expense
- Check charts for money trend and expense categories
- Search, filter and sort transactions
- Switch role between Admin and Viewer
- Admin can add, edit and delete transactions
- Viewer can only view data
- See insights like highest spending category, monthly comparison and savings

## Features

### Dashboard
- Total Balance card
- Income card
- Expense card
- Line chart (time-based transaction amount)
- Pie chart (expense categories)

### Transactions
- Table columns: Date, Amount, Category, Type
- Search by date/category/amount
- Filter by type (All/Income/Expense)
- Sorting by date and amount

### Role-based UI
- Role switch dropdown (Admin / Viewer)
- Admin: add/edit/delete transactions
- Viewer: view only

### Insights
- Highest spending category
- Monthly expense comparison (this month vs last month)
- Total savings (income - expense)

### Small enhancements
- LocalStorage backup for transactions
- Role saved in LocalStorage
- Simple hover transitions
- Responsive layout with Tailwind
- Empty states and loading message

## Tech stack

Frontend:
- React
- Vite
- Tailwind CSS
- Recharts

Backend:
- Node.js
- Express.js
- JSON file storage (for beginner simplicity)

## Folder structure

- `src/` -> frontend code
- `backend/` -> backend API code
- `backend/data/transactions.json` -> simple data storage

## How to run (Frontend + Backend)

### 1) Frontend setup

```bash
npm install
npm run dev
```

Frontend runs on Vite default port (usually `http://localhost:5173`).

### 2) Backend setup

Open another terminal:

```bash
cd backend
npm install
npm run dev
```

Backend runs on `http://localhost:5000`.

## API endpoints

- `GET /transactions` -> get all
- `POST /transactions` -> add new
- `PUT /transactions/:id` -> update by id
- `DELETE /transactions/:id` -> delete by id

## What I learned (student notes)

- How to connect React with backend API using `fetch`
- How to manage loading and error state
- How to do CRUD operations in a simple full-stack app
- How to handle role-based UI logic
- How to keep local backup using LocalStorage
- How to build simple but useful dashboard charts

## Notes

- This project is intentionally simple and beginner style.
- JSON file is used instead of database to keep learning easy.
- Sample transactions were refreshed with more realistic recent values and categories.
