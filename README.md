# Prescripto – Full-Stack Doctor Appointment & Payment Platform

**Prescripto** is a comprehensive MERN-based platform that helps patients book appointments with doctors and enables secure online payments via Razorpay, alongside admin capabilities for managing appointments effectively.

---

##  Features

### Patient (Frontend)
- Register/login and browse available doctors
- Schedule appointments with secure payments via Razorpay
- View and manage appointment history

### Doctor/Provider (Admin Panel)
- Login with secure credentials
- View, confirm, and manage booked appointments
- Access appointment details and patient history

### Backend
- Order creation and payment verification using Razorpay integration
- Data persistence using MongoDB
- Structured architecture with Express.js routes and controllers

---

##  Tech Stack

- **Frontend**: React.js, Vite
- **Admin Panel**: React.js, similar setup
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (via Mongoose)
- **Payments**: Razorpay (order creation & verification)
- **File Uploads / Media (if used)**: Cloudinary
- **Environment Management**: dotenv

---

##  Getting Started

### Prerequisites
- Node.js & npm
- MongoDB (local or Atlas)
- Razorpay account (for API credentials)

### Project Setup

1. Clone the repo:
   ```bash
   git clone https://github.com/Shridhan15/Prescripto.git
   cd Prescripto
