# 💰 Digital Wallet System API

A secure, role-based digital wallet backend system built using **Express.js**, **TypeScript**, and **MongoDB (Mongoose)**.

---

## 🚀 Project Overview

This project simulates a digital wallet system (similar to **Bkash**, **Rocket**, or **Nagad**) with proper role-based access controls and financial operations such as:
- Deposits
- Withdrawals
- Send Money
- Cash In/Out (Agent)
- Admin Controls

---

## 🧱 Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Language**: TypeScript
- **Authentication**: JWT
- **Password Hashing**: bcrypt
- **Validation**: Zod
- **Authorization**: Role-based middleware

---

## 👥 User Roles

| Role         | Description                                      |
|--------------|--------------------------------------------------|
| `USER`       | Can manage own wallet, deposit, withdraw, send money |
| `AGENT`      | Can perform cash-in, cash-out for users          |
| `ADMIN`      | Full access to users, agents, transactions, wallets |

---

## 📁 Folder Structure

```
src/
├── app/
│   ├── config/ # Environment & DB configs
│   ├── errorHelpers/ # Custom error handlers
│   ├── helpers/ # helpers functions
│   ├── interfaces/ # TS interfaces (User, Wallet, etc.)
│   ├── middlewares/ # Auth, validation, error middleware
│   ├── modules/
│   │   ├── auth/ # Login, Refresh, Logout
│   │   ├── user/ # Registration, user mgmt
│   │   ├── wallet/ # Wallet operations
│   │   └── transaction/ # History, money transfers
│   ├── routes/ # Combines all routers
│   ├── utils/ # utilities functions, reusable tools
│   └── constants.ts
├── app.ts # Express app config
├── server.ts # App server runner
```

---

## ✅ Features

### 🔐 Authentication
- Login with JWT token
- Refresh token support
- Role-based route protection

### 👤 Users
- Register with auto wallet creation (৳50)
- Deposit, Withdraw, Send Money
- View transaction history
- Deactivate wallet

### 🧑‍💼 Agents
- Perform cash-in and cash-out operations

### 🛠 Admins
- View all users/agents
- Approve/suspend agents
- Block/unblock wallets
- View all transactions and wallets

---

## 📦 API Endpoints

### 🧾 Auth

| Method | Route              | Access     | Description         |
|--------|-------------------|------------|---------------------|
| POST   | `/auth/login`     | Public     | Login with credentials    |
| POST   | `/auth/refresh-token` | Public | Get new access token |
| POST   | `/auth/logout`    | Public     | Logout              |

---

### 👤 Users

| Method | Route                       | Access               | Description              |
|--------|-----------------------------|----------------------|--------------------------|
| POST   | `/user/register`            | Public               | Register user/agent      |
| GET    | `/user/all-users`           | Admin, SuperAdmin    | View all users           |
| GET    | `/user/agents`              | Admin, SuperAdmin    | View all agents          |
| GET    | `/user/:id`                 | Admin, SuperAdmin    | View user by ID          |
| DELETE | `/user/:id`                 | Admin, SuperAdmin    | Delete user              |
| PATCH  | `/user/:id`                 | All roles            | Update user info         |
| PATCH  | `/user/agents/approval-status/:userId` | Admin, SuperAdmin | Approve/suspend agent |

---

### 💼 Wallet

| Method | Route                  | Access               | Description              |
|--------|------------------------|----------------------|--------------------------|
| POST   | `/wallets/deposit`     | All roles            | Add money to wallet      |
| POST   | `/wallets/withdraw`    | All roles            | Withdraw money           |
| POST   | `/wallets/send-money`  | All roles            | Send money to user       |
| PATCH  | `/wallets/deactivate`  | All roles            | Deactivate own wallet    |
| POST   | `/wallets/cash-in`     | Agent only           | Agent cash-in to user    |
| POST   | `/wallets/cash-out`    | Agent only           | Agent cash-out from user |
| GET    | `/wallets`             | Admin, SuperAdmin    | View all wallets         |
| PATCH  | `/wallets/block/:id`   | Admin, SuperAdmin    | Block user wallet        |
| PATCH  | `/wallets/unblock/:id` | Admin, SuperAdmin    | Unblock user wallet      |

---

### 🔁 Transactions

| Method | Route                        | Access               | Description                     |
|--------|------------------------------|----------------------|---------------------------------|
| GET    | `/transactions/my-history`   | All roles            | View own transaction history    |
| GET    | `/transactions/all`          | Admin, SuperAdmin    | View all transactions           |

---

## 🔐 Role-Based Access Control

- `checkAuth(...)` middleware protects each route.
- Roles enforced through route guards and service logic.

---

## 🧠 System Logic

- Wallet auto-created on registration (`৳50` default balance).
- Agents can't perform actions on blocked or inActive wallets.
- Transactions are atomic — money is only deducted if all steps pass.
- Admins have full access to user and wallet management.
- Users can only access their own data (strict checks in services).

---

## 🛠 Setup & Installation

### Prerequisites
- Node.js ≥ 18
- MongoDB (local or cloud)
- npm / yarn

### Clone & Install

```bash
git clone https://github.com/Nazmul5691/digital-wallet-system-backend
cd digital-wallet-system-backend
npm install
```

### Configure Environment

Create a `.env` file based on `.env.example`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/digital-wallet
JWT_SECRET=your-secret
JWT_REFRESH_SECRET=your-refresh-secret
```

### Run the App

```bash
npm run dev      # Development mode
npm run build    # Compile TS
npm run start    # Run compiled JS
```

---

## 🔍 Sample Requests

### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "example@gmail.com",
  "password": "your-password"
}
```

### Send Money

```http
POST /wallets/send-money
Authorization: Bearer <token>

{
  "receiverId": "XXXXXXXXXXXXXXXXXXXXXXXX",
  "amount": 200,
}
```

---

## 🧪 Testing Tips

- Test token access for all roles
- Try sending money from blocked wallets
- Simulate agent cash-in/out
- Try admin routes without proper role
- Validate pagination & search

---


## 🛡 Security Notes

- JWT stored securely with refresh rotation
- Strong password hashing via bcrypt
- Payload validation with Zod schemas
- Role + ownership checks inside services

---

## 📝 License

MIT License

---

## 👤 Author

Developed by Md Nazmul Islam