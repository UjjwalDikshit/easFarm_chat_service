# 🚀 EasFarm Chat Service

EasFarm Chat Service is a real-time messaging backend built to power seamless communication inside the EasFarm ecosystem. It is tightly integrated with the **FarmBazaar core platform**, ensuring that only authenticated FarmBazaar users can access chat features.

---

## 📌 Overview

EasFarm Chat Service provides:

* Real-time one-to-one & group chat
* Secure socket-based messaging
* Token-based authentication via FarmBazaar main service
* User synchronization with FarmBazaar accounts
* Scalable architecture ready for production workloads

This service does **NOT create users independently**. All users are provisioned and authenticated through the main FarmBazaar system.

---

## 🧩 Key Features

* ⚡ Real-time messaging using WebSockets (Socket.IO / similar)
* 🔐 Secure JWT-based authentication
* 👥 Group & private conversations
* 📩 Message persistence (DB-backed)
* 🟢 Online/offline presence tracking
* 🔄 Auto sync with FarmBazaar user system
* 🚫 Strict access control via external token validation

---

## 🏗️ System Architecture

```
FarmBazaar Main Service
        │
        │ (JWT Token Issued)
        ▼
EasFarm Chat Service
        │
        ├── Auth Middleware (Token Verification)
        ├── Socket Layer (Realtime Communication)
        ├── Message Controller
        └── Database (Chats & Messages)
```

---

## 🔐 Authentication Flow (IMPORTANT)

This service depends entirely on **FarmBazaar authentication system**.

### How it works:

1. User logs in via FarmBazaar main app
2. FarmBazaar issues a **JWT token**
3. Frontend sends token to Chat Service on socket connection
4. Chat Service verifies token with:

   * Signature validation OR
   * FarmBazaar auth API verification (recommended)
5. If valid → socket connection is allowed
6. If invalid/expired → connection is rejected

### ⚠️ Important Rule

> 🚨 Chat users are NOT created in this service.
> They are created and managed by FarmBazaar.

This service only **consumes authenticated user identity**.

---

## 🔑 Environment Variables

Create a `.env` file:

```env
PORT=5000

MONGO_URI=your_mongodb_uri

JWT_SECRET=your_shared_secret

FARMBAZAAR_AUTH_URL=https://farmbazaar.com/api/auth/verify

SOCKET_CORS_ORIGIN=http://localhost:3000

REDIS_URL= for_scaling
```

---

## 🚀 Getting Started

### 1. Clone Repository

```bash
git clone https://github.com/UjjwalDikshit/easfarm-chat-service.git
cd easfarm-chat-service
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Development Server

```bash
node index.js
```

### 4. Start Production Server

```bash
npm run dev
```

---

## 🔌 Socket Events

### Connection

```js
socket.connect({
  token: "FARMBazaar_JWT_TOKEN"
});
```

---

### Events

#### 📤 send_message

Send message to user/group

#### 📥 receive_message

Receive real-time message

#### 👀 typing

Typing indicator

#### 🟢 presence_update

Online/offline status updates

---

## 🧠 Core Design Principles

* **Security First** → No token, no connection
* **Decoupled Auth** → FarmBazaar handles identity
* **Scalability Ready** → Stateless socket design
* **Minimal Trust Backend** → Every request verified

---

## 🛡️ Security Rules

* Tokens must be validated before socket handshake
* No anonymous connections allowed
* Messages are only processed after authentication
* All chat actions are user-bound to FarmBazaar identity

---

## 📦 Deployment

Recommended stack:

* Node.js (Cluster mode / PM2)
* Nginx (reverse proxy)
* Redis (for socket scaling)
* MongoDB (message storage)

---

## 🔮 Future Improvements

* End-to-end encryption (E2EE)
* Message delivery receipts (delivered/read)
* Media sharing (images/files)
* Push notifications
* Chat backup sync with FarmBazaar cloud

