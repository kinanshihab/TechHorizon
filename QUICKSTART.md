# Quick Start Guide

## The Problem
You need **both** servers running at the same time:
1. Backend (Python) - serves the data
2. Frontend (React) - shows the website

## Step-by-Step

### 1. Start the Backend
Open a terminal and run:
```bash
cd backend
python -m uvicorn main:app --reload
```

You should see: `Uvicorn running on http://127.0.0.1:8000`

**Keep this terminal open!**

### 2. Start the Frontend
Open a **new** terminal (don't close the first one) and run:
```bash
cd frontend
npm run dev
```

You should see: `Local: http://localhost:5173/`

### 3. Open the Website
Go to `http://localhost:5173/` in your browser.

## Common Issues

**"Module not found" error in backend**
```bash
cd backend
pip install -r requirements.txt
```

**"Command not found: npm" in frontend**
You need Node.js installed. Download from: https://nodejs.org/

**"Cannot connect to backend" in browser**
Make sure the backend terminal is still running and shows no errors.

**Charts show "No Data"**
The large CSV files aren't in the repo. Either:
- Download them from the links in `data/README.md`, OR
- The app will work with limited demo data from `mock_job_data.csv`
