# VendorHub AI

VendorHub AI is a full-stack AI-powered vendor marketplace platform designed to connect buyers with vendors while providing tools for product discovery, ordering, communication, reviews, subscriptions, risk monitoring, and platform management.

The platform is built with a modern web architecture consisting of a **Next.js frontend** and a **FastAPI backend**, supported by a relational database and asynchronous SQLAlchemy services.


---

## 🚀 Features

### 👤 User Authentication & Accounts

- User registration and login
- Secure authentication and authorization
- Email/password based account access
- Email verification
- User profile management
- Role-based access for platform users and vendors

---

### 🏪 Vendor Management

Vendors can create and manage their presence on the platform.

Features include:

- Vendor registration
- Vendor profiles
- Vendor information management
- Vendor verification workflow
- Vendor product/service management
- Vendor performance and risk information
- Vendor-specific marketplace activity

---

### 🛍️ Marketplace

The platform provides a marketplace where users can discover and interact with vendor offerings.

Core functionality includes:

- Product/service discovery
- Vendor browsing
- Product information
- Product availability
- Vendor-related marketplace data
- Search and browsing workflows

---

### 📦 Orders

Users can place and manage orders through the platform.

Order functionality includes:

- Order creation
- Order tracking
- Order status management
- Order cancellation
- Cancellation reasons
- Order-related dispute information
- Order history

The backend provides structured order data that can be used by both buyers and vendors.

---

### ⭐ Reviews & Ratings

Vendor and product experiences can be evaluated through reviews.

Features include:

- Creating reviews
- Review management
- Review reporting
- Review moderation workflow
- Review status management
- Report reasons
- Moderation history

Reported reviews can be reviewed and processed through the platform's moderation system.

---

### ⚠️ Disputes & Reporting

VendorHub AI includes functionality for handling potentially problematic transactions and user-generated content.

Supported workflows include:

- Order disputes
- Cancellation claims
- Review reports
- Dispute reasons
- Report status tracking
- Resolution workflows

The system distinguishes between open disputes and cancelled-order claims.

---

### 💬 Messaging

The platform includes a messaging layer that allows users to communicate through conversations.

Messaging functionality includes:

- Conversations
- User-to-user messaging
- Message history
- Message attachments
- Message deletion/soft deletion
- Conversation-level activity

The messaging data can also be used as a source for detecting unusual activity and potential fraud patterns.

---

### 🤖 AI & Risk Monitoring

VendorHub AI includes risk-analysis functionality for identifying potentially suspicious vendor activity.

Risk monitoring can evaluate:

- Overall vendor risk scores
- Fraud indicators
- Certification status
- Risk score deterioration
- Historical risk reports
- Fraud flag frequency
- Vendor risk trends

The platform can identify vendors that meet high-risk conditions such as:

- Low overall risk score
- Multiple fraud indicators
- Expired certification
- Unverified certification
- Significant deterioration in risk score

---

### 🕵️ Fraud Monitoring

Fraud monitoring provides additional signals based on platform activity.

Supported fraud-monitoring areas include:

#### Flagged Vendors

Identifies vendors matching high-risk criteria and provides reasons for each flag.

#### Risk Deterioration

Detects vendors whose risk score has significantly decreased compared with their previous report.

#### Messaging Anomalies

Analyzes messaging activity for signals such as:

- High message volume
- Potential spam/bot behaviour
- High attachment ratios
- Unusual message deletion patterns

#### Fraud Flag Frequency

Provides aggregated information about commonly detected fraud indicators.

---

### 💳 Subscription Plans

VendorHub AI supports subscription-based platform functionality.

Features include:

- Pricing plans
- Plan creation
- Plan updates
- Plan deletion
- Subscription management
- Subscriber information
- Subscription status
- Subscription start dates
- Renewal dates
- Billing history
- Subscription revenue tracking

---

## 🧱 Technology Stack

### Frontend

- **Next.js**
- **React**
- **TypeScript**
- **Tailwind CSS**
- **Axios**
- **Lucide React**

The frontend provides the user-facing marketplace and application interfaces.

---

### Backend

- **Python**
- **FastAPI**
- **SQLAlchemy**
- **Async SQLAlchemy**
- **Pydantic**

The backend exposes REST APIs for authentication, marketplace functionality, orders, reviews, messaging, subscriptions, risk monitoring, and other platform services.

---

### Database

The backend uses a relational database accessed through SQLAlchemy's asynchronous database layer.

Database models cover areas including:

- Users
- Vendors
- Products
- Orders
- Reviews
- Review reports
- Subscriptions
- Pricing plans
- Billing history
- Messages
- Conversations
- Risk reports

---

## 📁 Project Structure

A simplified project structure is shown below:

```text
VendorHub-AI/
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── utils/
│   │   └── ...
│   │
│   ├── public/
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── schemas/
│   ├── common/
│   ├── database/
│   ├── services/
│   └── ...
│
└── README.md
````

> The exact folder structure may vary depending on the current project version.

---

# 🔌 API Architecture

The backend follows a controller/route architecture.

```text
Frontend
   │
   │ HTTP / REST API
   ▼
FastAPI Routes
   │
   ▼
Controllers / Services
   │
   ▼
SQLAlchemy Models
   │
   ▼
Relational Database
```

The frontend communicates with the backend using HTTP requests through an Axios-based API client.

---

## 🔐 Authentication

Authentication-protected endpoints use the application's authentication middleware/dependency system.

Typical request flow:

```text
User
 │
 ▼
Login / Registration
 │
 ▼
Authentication
 │
 ▼
Authenticated Session / Token
 │
 ▼
Protected API Endpoint
 │
 ▼
Backend Authorization
```

Email verification is supported as part of the account lifecycle.

---

# 🧩 Core Platform Modules

| Module           | Description                                                |
| ---------------- | ---------------------------------------------------------- |
| Authentication   | Registration, login, account access and email verification |
| Users            | User accounts and profiles                                 |
| Vendors          | Vendor registration, profiles and verification             |
| Marketplace      | Vendor/product discovery                                   |
| Orders           | Order creation and management                              |
| Reviews          | Ratings, reviews and reports                               |
| Messaging        | Conversations and user communication                       |
| Disputes         | Order dispute and cancellation claim handling              |
| Subscriptions    | Plans, subscribers and billing                             |
| Risk Analysis    | Vendor risk scoring and historical analysis                |
| Fraud Monitoring | Fraud indicators and suspicious activity detection         |

---

# 🛠️ Installation

## Prerequisites

Make sure the following are installed:

* Node.js
* npm
* Python 3.10+
* pip
* A supported relational database

---

## 1. Clone the Repository

```bash
git clone <repository-url>
cd VendorHub-AI
```

---

# 💻 Frontend Setup

Navigate to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create the environment file:

```bash
.env.local
```

Configure the required backend/API environment variables according to the project's API configuration.

Start the development server:

```bash
npm run dev
```

The frontend will then be available through the local Next.js development server.

---

# ⚙️ Backend Setup

Navigate to the backend:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate it on Windows:

```bash
venv\Scripts\activate
```

On macOS/Linux:

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Configure the backend environment variables using the project's `.env` configuration.

Start the FastAPI server:

```bash
uvicorn main:app --reload
```

---

# 🌐 Frontend ↔ Backend Communication

The frontend communicates with the FastAPI backend through REST endpoints.

Example:

```typescript
import apiClient from './utils/api/apiClient';

const response = await apiClient.get('/vendors');
```

The API client centralizes backend communication and allows authentication and common request configuration to be handled consistently.

---

# 📊 Risk & Fraud Architecture

Risk monitoring is primarily based on historical vendor risk reports.

```text
Vendor Activity
      │
      ▼
Risk Analysis
      │
      ▼
Risk Reports
      │
      ├── Overall Risk Score
      ├── Fraud Indicators
      ├── Certification Status
      └── Historical Risk Data
              │
              ▼
       Fraud Monitoring
              │
       ┌──────┼─────────┐
       ▼      ▼         ▼
    Flagged  Score    Messaging
    Vendors  Drop     Anomalies
```

This allows the platform to identify both:

* Vendors with currently high-risk characteristics
* Vendors whose risk profile is deteriorating over time

---

# 📝 Review Moderation

Review reports follow a moderation lifecycle.

```text
Review
  │
  ▼
Reported
  │
  ▼
PENDING
  │
  ├───────────────┐
  ▼               ▼
APPROVED        REMOVED
  │               │
  ▼               ▼
RESOLVED_       RESOLVED_
APPROVED        REJECTED
```

Moderation actions can also include administrator notes associated with the report resolution.

---

# 💳 Subscription Architecture

Subscription functionality is organized around pricing plans, subscriptions, and billing history.

```text
Pricing Plan
     │
     ▼
Subscription
     │
     ▼
Billing History
     │
     ▼
Revenue Tracking
```

This allows the platform to track subscriber status, plan information, renewal dates, and subscription revenue.

---

# 🔒 Security Considerations

The application should be configured with secure environment variables for:

* Database credentials
* Authentication secrets
* API configuration
* Application secrets
* Third-party service credentials where applicable

Sensitive credentials should **never be committed to Git**.

Use environment files locally:

```text
.env
.env.local
```

and ensure they are included in `.gitignore`.

---

# 🧪 Development

For local development, run the frontend and backend independently.

### Terminal 1 — Backend

```bash
cd backend
.\venv\Scripts\activate 
uvicorn main:app --reload
```

### Terminal 2 — Frontend

```bash
cd frontend
npm run dev
```

---

# 🐛 Troubleshooting

### Backend cannot be reached

Verify that:

* FastAPI is running
* The frontend API base URL is correct
* The backend port is correct
* CORS configuration allows the frontend origin

### Database connection errors

Check:

* Database URL
* Database credentials
* Database availability
* SQLAlchemy configuration
* Environment variables

### Authentication errors

Check:

* Authentication configuration
* Token/session handling
* Frontend API client configuration
* Backend authentication dependencies

### API requests return Network Error

Verify that the backend is reachable from the frontend and that the configured API base URL points to the correct FastAPI server.

---

# 📌 Current Scope

VendorHub AI currently focuses on:

* Vendor marketplace functionality
* User accounts
* Vendor management
* Products/services
* Orders
* Reviews and ratings
* Review reporting
* Disputes
* Messaging
* Subscriptions
* Billing
* Risk analysis
* Fraud monitoring
* Email verification

\



---

# 👨‍💻 Development Team

# Members: 
Syeda Alishba Khatoon (Team Lead)
Zainab Bibi 
Syed Sayeel Abbas
Fatima Khalid Siddiqui
Taha Tanvir




