# ChurnIQ - Telecom Customer Churn Prediction Dashboard

A telecom intelligence dashboard for analyzing customer churn patterns and predicting which customers are at risk of leaving. The application combines a React + Vite frontend with a FastAPI backend and an XGBoost machine learning model to provide churn insights, risk scoring, and recommendations.

## Dashboard Overview

The dashboard includes:

- Executive overview with churn KPIs and summary metrics
- Churn analysis by contract type, internet service, tenure range, and payment method
- Customer prediction workflow with input form for customer attributes
- Risk customer tracking for high-priority accounts
- Explainable AI factors that show which features drive churn risk
- Actionable recommendations for retention and pricing strategies

The UI presents a modern analytics experience with filter controls, metric cards, and chart-based insights similar to the current interface shown in the app.

## Features

### 1. Churn Analysis
- Explore churn rate by:
  - Contract type
  - Internet service
  - Tenure range
  - Payment method
- Visualize patterns using bar charts and percentage comparisons

### 2. Customer Prediction
- Submit customer details through a prediction form
- Estimate churn probability using the trained XGBoost model
- Classify risk as Low, Medium, or High

### 3. Risk Customers
- Review at-risk customers and prioritize intervention
- Use model explanations to understand the main drivers behind churn risk

### 4. Recommendations
- Suggest retention actions such as:
  - contract changes
  - support offers
  - security packages
  - pricing reviews

## Tech Stack

### Frontend
- React
- Vite
- Recharts
- React Router
- Lucide icons

### Backend
- Python
- FastAPI
- Pandas
- scikit-learn
- XGBoost
- Joblib

## Project Structure

```bash
customer churn prediction/
│
├── backend/
│   ├── app.py
│   └── requirements.txt
├── src/
│   ├── components/
│   ├── data/
│   ├── pages/
│   ├── services/
│   ├── styles/
│   ├── App.jsx
│   └── main.jsx
├── .gitignore
├── customer.ipynb
├── churn_model.pkl
├── threshold.pkl
├── index.html
├── package.json
├── package-lock.json
├── Telco_customer_churn.xlsx
├── vite.config.js
└── README.md
```

## Prerequisites

- Node.js 18+
- Python 3.10+
- npm
- pip

## Installation

### 1. Install frontend dependencies

```bash
npm install
```

### 2. Install backend dependencies

```bash
cd backend
pip install -r requirements.txt
```

## Run the Application

### Start the backend

```bash
cd backend
python app.py
```

The backend runs with FastAPI and exposes prediction endpoints and health checks.

### Start the frontend

From the project root:

```bash
npm run dev
```

Then open the local Vite URL shown in the terminal, typically:

```bash
http://localhost:5173
```

## API Health Check

The backend includes a health endpoint:

```bash
http://localhost:8000/health
```

## Model Notes

- The project uses a trained `XGBoost` churn model stored in `churn_model.pkl`
- The churn decision threshold is stored in `threshold.pkl`
- The backend maps frontend input fields to the trained model features before scoring

## Example Use Case

A telecom operator can:

- inspect churn patterns by customer segment
- identify which plan or payment types are most churn-prone
- predict churn probability for individual customers
- provide retention offers tailored to the strongest churn drivers

## License

This project is for educational and demonstration purposes.

## Author

Developed as a telecom customer churn intelligence dashboard using machine learning and modern web analytics.
