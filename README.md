# TaskMate: A Smart Project Management and Collaboration Platform


## Implementation

### Frontend Application
React-based responsive web application for project management and team collaboration.

🌐 **Live Demo:** https://taskmate-frontend-omega.vercel.app

### Backend Server
Node.js backend with Express.js, MongoDB, and real-time notifications.

🌐 **API Server:** https://taskmate-backend-4vzj.onrender.com

---

## Overview

**TaskMate** is a comprehensive web-based project management and collaboration platform built using the **MERN stack**. It addresses the real-world problem of fragmented team workflows where teams rely on disconnected tools — spreadsheets for tracking, emails for communication, and cloud drives for file sharing — leading to data inconsistency and missed deadlines.

The platform serves three distinct user roles — Owner, Admin, and Member each with specialized permissions to manage workspaces, projects, and tasks through a structured hierarchy.

Key innovation: **Real-time collaboration** using Socket.IO WebSockets combined with an automated deadline monitoring system using node-cron that proactively alerts users about upcoming and overdue tasks every morning.

---

## Project Components

### 1. **Workspace Management Module**
* Create and manage collaborative team workspaces
* Invite members via secure JWT-based email invitation links
* Assign roles: Owner, Admin, and Member
* Remove members and manage workspace settings
* Workspace-level analytics and productivity dashboard

### 2. **Project Management Module**
* Create projects with title, description, status, start date, due date, and tags
* Project status pipeline: Planning → In Progress → On Hold → Completed → Cancelled
* Progress percentage tracking (0–100%)
* Archive and restore projects (soft delete)
* Project-level member assignments with independent role control

### 3. **Task and Subtask Management Module**
* Create tasks with priority (Low / Medium / High), status, due date, and assignees
* Kanban-style board: To Do → In Progress → Review → Done
* Embedded subtasks to break large tasks into smaller checklist items
* Watchers — users who monitor task changes without being assignees
* Automatic activity log for every status change and assignment

### 4. **Real-Time Notification Module**
* Socket.IO-based instant notifications delivered to private user rooms
* Notification types: task assigned, task updated, comment added, deadline alert
* Persistent notification inbox with Unread and Read categories
* Mark all notifications as read in one click

### 5. **File and Attachment Management Module**
* Upload task attachments using Multer  
* Store files securely in Cloudinary  
* Support file types including images, PDFs, and documents  
* Inline preview support for PDFs  
* Maintain attachment metadata (name, type, size, uploader)  

---

## System Architecture

TaskMate implements a **three-tier architecture**:

```
┌─────────────────────────────────────────────────────────┐
│           PRESENTATION LAYER (Frontend)                 │
│  React 19 + TypeScript + Vite + Tailwind CSS v4        │
│  React Router v7 + TanStack Query v5 + Socket.IO       │
└────────────────────┬────────────────────────────────────┘
                     │ HTTPS/REST + WSS WebSocket
┌────────────────────▼────────────────────────────────────┐
│          APPLICATION LAYER (Backend)                    │
│  Node.js 22 + Express.js 4 + Socket.IO + JWT Auth      │
│  Arcjet Security + Cloudinary + Nodemailer              │
└────────────────────┬────────────────────────────────────┘
                     │ Mongoose ODM over TLS
┌────────────────────▼────────────────────────────────────┐
│              DATA LAYER (Database)                      │
│  MongoDB Atlas M0 — ap-south-1 (Mumbai)                 │
│  9 Collections: Users, Workspaces, Projects, Tasks,     │
│  Comments, Notifications, ActivityLogs,                 │
│  TimeLogs, WorkspaceInvites                             │
└─────────────────────────────────────────────────────────┘
```

**External Services:**
* **Cloudinary** - File and profile picture cloud storage
* **Nodemailer + Gmail SMTP** -  Email verification, invitations, and password reset
* **Socket.IO** - Real-time bidirectional WebSocket communication
* **Arcjet** - Bot detection, disposable email validation, and rate limiting
  
---

## Technologies Used

### Frontend
* **React 19.1** - Component-based UI library
* **TypeScript 5.9** - Type-safe development
* **Vite 7.1** - Build tool and development server
* **React Router v7** - File-based client-side routing with nested layouts
* **Tailwind CSS v4** - Utility-first responsive styling
* **shadcn/ui** - Accessible pre-built UI components (Radix UI)
* **Axios** - HTTP client for REST API communication
* **Socket.IO Client 4.8** - Real-time WebSocket event subscription
* **Zod 4.1** - Client-side input schema validation
* **Recharts 2.15** - Analytics dashboard charts

### Backend
* **Node.js 22** - JavaScript runtime
* **Express.js 4.21** - Web application framework
* **MongoDB Atlas + Mongoose 8.19** - NoSQL cloud database with ODM
* **Zod 3.25** - Server-side request body validation
* **Socket.IO 4.8** - WebSocket server for real-time events
* **JWT** - Session token issuance and verification
* **bcrypt** - Password hashing
* **Nodemailer 8.0** - Gmail SMTP email delivery
* **node-cron** - Scheduled daily deadline monitoring

### Cloud & DevOps
* **Vercel** - Frontend deployment
* **Render** - Backend hosting
* **MongoDB Atlas** - Database cloud hosting
* **Cloudinary** - File and image storage CDN
* **Git & GitHub** - Version control

---

## Key Features

### ⚡ **Real-Time Features**
* **Instant Notifications** - Socket.IO delivers alerts to private user rooms
* **Live Task Updates** -  All connected users see changes without page refresh
* **Notification Inbox** - Persistent Unread / Read categories with mark-all-read

### 📁 **File Management**
* **Direct Cloudinary streaming** - Files never touch the server filesystem
* **14 supported formats** - Images, PDFs, Office documents, text, and CSV etc..
* **10 MB per file** - With MIME type validation and extension fallback

### 📊 **Analytics and Time Tracking**
* **Task Time Tracking & Aggregation** — Start/stop timer for each task and total time automatically aggregated across all projects at the workspace level  
* **Recharts Dashboards** — Visualize task trends, project status, and priority distribution  
* **Role-Aware Insights** — Owners/Admins view complete workspace analytics, while Members see their individual contributions  
  
### 📅 **Calendar and Scheduling**
* **Interactive calendar view** - Visual representation of tasks and project deadlines  
* **Overdue indicators** - Red dots for tasks and highlighted dates for projects  
* **Date-based navigation** - Click on a date to view related tasks and projects
  
### 🔒 **Security**
* **JWT Authentication** - Secure stateless sessions
* **bcrypt Password Hashing** - Industry-standard encryption
* **Role-Based Access Control (RBAC)** - Three distinct user roles
* **Arcjet Gateway** - Bot detection, disposable email blocking, token-bucket rate limiting
 
---

## Installation & Setup

### Prerequisites
* Node.js 22.x or higher
* npm 10.x or higher
* MongoDB Atlas account (free M0 tier)
* Cloudinary account (free tier)
* Gmail account with App Password enabled
* Arcjet account and site key (free tier)

---

### Project Setup
```bash
# Clone the repository
git clone https://github.com/bharath1624/TaskMate.git
```
  
### Frontend Setup

```bash

cd frontend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
VITE_API_URL=http://localhost:5000/api-v1
VITE_BACKEND_URL=http://localhost:5000
EOF

# Start development server
npm run dev

# Build for production
npm run build
```

### Backend Setup

```bash

cd backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
PORT=5000
FRONTEND_URL=http://localhost:5173
MONGO_URI=youur_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret_key
EMAIL_USER=yourname@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
ARCJET_KEY=ajkey_xxxxxxxxxxxxxxxx
EOF

# Start development server
npm run dev

# Start production server
npm start
```

### Database Setup

```bash
# Use MongoDB Atlas (cloud)
# 1. Create a free M0 cluster at cloud.mongodb.com
# 2. Create a database user with Read and Write access
# 3. Add 0.0.0.0/0 to the Network Access list
# 4. Copy the SRV connection string to MONGODB_URI in .env
```

---

## Deployment

### Frontend (Vercel)

1. Connect GitHub repository to Vercel
2. Select the frontend/ directory
3. Framework Preset: Vite (auto-detected)
4. Build Command: npm run build
5. Output Directory: dist
6. Add environment variables VITE_API_URL and VITE_BACKEND_URL
7. Deploy
   
### Backend (Render)

1. Create new Web Service on Render
2. Connect GitHub repository, select backend/ directory
3. Runtime: Node.js 22
4. Build Command: npm install
5. Start Command: node index.js
6. Add all environment variables
7. Deploy

### Database (MongoDB Atlas)

1. Create cluster on MongoDB Atlas
2. Create database user
3. Whitelist IP addresses (0.0.0.0/0 for development)
4. Copy connection string to MONGO_URI

---


## Future Enhancements

### Planned Features

1. **Mobile Application Support**
   * Native iOS and Android apps using React Native
   * Push notifications for mobile devices
   * Offline mode with sync on reconnect

2. **External Tool Integration**
   * GitHub integration for linking commits to tasks
   * Slack and Google Calendar integration
   * Email digest notification support

3. **AI-Based Task Recommendation**
   * Suggest optimal task assignments based on member workload
   * Predictive deadline alerts using historical data
   * Auto-priority detection from task description

4. **Enhanced Notification System**
   * Customisable alert preferences per user
   * Priority-based notification filtering
   * Email digest for daily activity summary

5. **Enhanced Analytics**
   * Productivity trend analysis across months
   * Team performance benchmarking
   * Customisable report exports in Excel and PDF

---


**⭐ If you find this project useful, please give it a star!**
