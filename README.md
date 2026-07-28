# 🚀 Microservices E-commerce Platform

> **Developed by ABDUS SAMAD RAEEN**

![License](https://img.shields.io/badge/license-Private-red.svg)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![TurboRepo](https://img.shields.io/badge/TurboRepo-Enabled-ef4444)

A high-performance, scalable e-commerce solution architected with **Microservices**. Designed for flexibility, speed, and massive scale, separating core business logic into distinct, independently deployable services.

---

## 🏗️ Architecture

This project utilizes a collection of loose-coupled services communicating via **REST APIs** and **Kafka Event Streams**. Use the diagram below to understand the data flow.

```mermaid
graph TD
    User((User))
    Admin((Admin))
    
    subgraph Frontend
        Client["Storefront (Next.js 15)"] -->|Port 3500| Gateway
        Dash["Admin Panel (Next.js 15)"] -->|Port 3501| Gateway
    end
    
    subgraph Services
        Gateway[API Gateway]
        Auth[🔐 Auth Service]
        Prod[📦 Product Service]
        Order[🛒 Order Service]
        Pay[💳 Payment Service]
        Mail[MSG Email Service]
    end
    
    subgraph Data
        PG[(PostgreSQL)]
        Mongo[(MongoDB)]
        Redis[(Redis Cache)]
    end

    User --> Client
    Admin --> Dash
    
    Client --> Auth
    Client --> Prod
    Client --> Order
    Client --> Pay
    
    Prod --> PG
    Order --> Mongo
    Auth --> Clerk
```

## ✨ Key Features

-   **Microservices Architecture**: Independent services for Products, Orders, Auth, and Payments.
-   **Modern Frontend**: Built with **Next.js 15 App Router**, TailwindCSS, and Shadcn UI.
-   **Event-Driven**: Uses **Kafka** for asynchronous communication (e.g., Order Created -> Send Email).
-   **High Performance**:
    -   **Global Singleton DB Connections** for hot-reload stability.
    -   **Optimized Images** with Cloudinary & Lazy Loading.
    -   **Server-Side Rendering (SSR)** for SEO.
-   **Secure Payments**: Integrated with **Stripe** and **Razorpay**.
-   **Developer Experience**: Powered by **Turborepo** for fast builds and caching.

---

## 🛠️ Tech Stack

| Category | Technologies |
| :--- | :--- |
| **Frontend** | Next.js 15, React, TailwindCSS, Lucide Icons, Framer Motion |
| **Backend** | Node.js, Express, Hono, Prisma, Mongoose |
| **Databases** | PostgreSQL (Products), MongoDB (Orders), Redis (Caching) |
| **DevOps** | Docker, Turborepo, Kafka, pnpm |
| **Auth** | Clerk Authentication |

---

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

-   **Node.js**: v18 or higher
-   **pnpm**: `npm install -g pnpm`
-   **Docker**: Required for Kafka and Databases

### Installation

1.  **Clone the Repository**
    ```bash
    git clone <repository-url>
    cd microservices-ecommerce
    ```

2.  **Install Dependencies**
    ```bash
    pnpm install
    ```

3.  **Environment Setup**
    -   Ensure your `.env` files are configured in each `apps/*` and `packages/*` directory.
    -   You need running instances of MongoDB and PostgreSQL.

### Running the Project

Start the entire development ecosystem with a single command:

```bash
pnpm dev:all
```

| Application | URL | Description |
| :--- | :--- | :--- |
| **Storefront** | [http://localhost:3500](http://localhost:3500) | Main customer shopping experience |
| **Admin Panel** | [http://localhost:3501](http://localhost:3501) | Dashboard for store management |

---

## 📂 Project Structure

```text
.
├── apps/
│   ├── client/          # Customer Frontend (Next.js)
│   ├── admin/           # Admin Dashboard (Next.js)
│   ├── product-service/ # Product Logic (Express/Postgres)
│   ├── order-service/   # Order Logic (Express/Mongo)
│   ├── auth-service/    # Authentication (Express/Clerk)
│   └── payment-service/ # Payment Processing (Express/Stripe)
├── packages/
│   ├── ui/              # Shared React Components
│   ├── types/           # Shared TypeScript Definitions
│   ├── kafka/           # Kafka Producer/Consumer Wrappers
│   ├── product-db/      # Prisma Client Singleton
│   └── order-db/        # Mongoose Client Singleton
```

---

## 🔄 Rebranding / Changing Author

If you wish to fork this project and replace the author name **"ABDUS SAMAD RAEEN"** with your own, please update the string in the following files:

1.  **Project Metadata**:
    -   `package.json` (Root)
    -   `apps/client/package.json`
    -   `apps/admin/package.json`

2.  **UI Components**:
    -   `apps/client/src/components/Footer.tsx` (Client Footer)
    -   `apps/admin/src/components/AppSidebar.tsx` (Admin Sidebar Footer)

3.  **Documentation**:
    -   `README.md` (This file, header section)

---

> **Note**: This project is intended for educational and commercial purposes under the guidance of the original author.
