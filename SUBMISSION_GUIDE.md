# Microservices E-commerce Platform - Submission Guide

**Student Name:** ABDUS SAMAD RAEEN  
**Project:** Microservices E-commerce Platform

---

## 🚀 How to Run this Project

This project is a microservices-based e-commerce application. To ensure it fits on the submission media, all `node_modules` (dependency folders) and build artifacts have been removed.

### 1. Prerequisites

Before running the project, please ensure the following are installed on your system:

*   **Node.js** (v18 or higher)
*   **pnpm** (Package Manager)
    *   Install via npm: `npm install -g pnpm`
*   **Docker Desktop** (Required for Databases & Kafka)
    *   Ensure Docker is running.

### 2. Installation

1.  **Copy the Project**: Copy the entire project folder from the CD/DVD to your local hard drive (e.g., Desktop or Documents). **Do not run it directly from the disc.**
2.  **Open Terminal**: Open a terminal/command prompt in the project root folder.
3.  **Install Dependencies**: Run the following command to download all necessary libraries (this may take a few minutes):
    ```bash
    pnpm install
    ```

### 3. Environment Setup

*   **Note**: All `.env` files with necessary API keys and database URLs have been **included** for your convenience. You do not need to configure them manually.
*   **Databases**: The project uses Docker for local databases. Ensure Docker is running.

### 4. Running the Application

To start all services (Frontend, Backend, Databases) simultaneously, run:

```bash
pnpm dev:all
```

This command will:
1.  Spin up Docker containers (MongoDB, PostgreSQL, Redis, Kafka).
2.  Start the Next.js Storefront.
3.  Start the Next.js Admin Panel.
4.  Start all Microservices (Product, Order, Payment, Auth, Email).

### 5. Accessing the App

Once the terminal shows "Ready", you can access the applications at:

*   **Storefront (Customer App):** [http://localhost:3500](http://localhost:3500)
*   **Admin Dashboard:** [http://localhost:3501](http://localhost:3501)

---

## ⚠️ Troubleshooting

*   **Ports in Use**: If you see errors about ports 3500, 3501, or 8000+ being in use, please ensure no other processes are using these ports.
*   **Docker Errors**: If databases fail to start, try restarting Docker Desktop.
*   **"Turbo" not found**: If `pnpm dev:all` fails, try installing turbo globally: `npm install -g turbo`.
