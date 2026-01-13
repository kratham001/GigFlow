# 🚀 GigFlow - Freelance Marketplace Platform

GigFlow is a full-stack MERN application that connects freelancers with clients. Clients can post gigs, view proposals, and hire talent, while freelancers can browse opportunities, place bids, and receive real-time notifications when hired.

**Live Demo:** [Link to your Vercel App](https://gig-flow-project.vercel.app)  
*(Replace with your actual URL)*

---

## ✨ Features

### 🔐 Authentication & Security
- **Secure Login/Register:** JWT-based authentication using HTTP-Only cookies.
- **Role-Based Access:** Gig owners cannot bid on their own gigs.
- **CORS & Proxy Security:** Configured for secure cross-domain communication (Vercel ↔ Render).

### 💼 Gig Management
- **Post Gigs:** Clients can easily create new gigs with a title, description, and budget.
- **Search & Filter:** Real-time search functionality to find relevant gigs.
- **Dashboard:** Unified view for browsing gigs and managing posted jobs.

### 🤝 Bidding System
- **Quick Bid:** Freelancers can submit proposals directly from the dashboard via a modal.
- **Proposal Management:** Clients can view all bids received for their gigs.
- **Hiring:** Clients can "Hire" a freelancer, which automatically closes the gig and rejects other bids.

### ⚡ Real-Time Interactions
- **Socket.io Integration:** Instant notifications for freelancers when they are **Hired** or **Rejected**.
- **Live Updates:** Dashboard refreshes automatically upon posting gigs or bidding.

---

## 🛠️ Tech Stack

### **Frontend**
- **React.js (Vite):** Fast and modern UI library.
- **Redux Toolkit:** State management for user authentication.
- **Tailwind CSS:** Utility-first framework for responsive styling.
- **Socket.io-client:** Real-time bi-directional communication.
- **React Hot Toast:** Beautiful notification popups.
- **Axios:** HTTP client with interceptors for cookie handling.

### **Backend**
- **Node.js & Express:** Robust REST API architecture.
- **MongoDB & Mongoose:** NoSQL database for flexible data modeling.
- **Socket.io:** WebSocket server for real-time events.
- **JWT & Cookie-Parser:** Secure stateless authentication.

---

## 🚀 Getting Started Locally

Follow these steps to run GigFlow on your local machine.

### 1. Clone the Repository
```bash
git clone [https://github.com/kratham001/GigFlow.git](https://github.com/kratham001/GigFlow.git)
cd GigFlow
