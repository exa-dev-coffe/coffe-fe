# Coffee Frontend (coffe-fe)

Coffee Frontend is the user-facing web application built using **React**, **TypeScript**, and **Vite**. It provides an interactive and responsive interface for users to browse menus, manage wallets, and track transactions.

## 🚀 Technologies

*   **Framework**: React 18
*   **Language**: TypeScript
*   **Build Tool**: Vite
*   **Styling**: Tailwind CSS
*   **State Management**: React Context / Zustand / Redux (based on usage)
*   **Routing**: React Router
*   **HTTP Client**: Axios

## 📦 Features

*   **Authentication Flow**: Secure login, registration, and JWT token management.
*   **Menu Catalog**: Browse available coffee and food items.
*   **Cart & Checkout**: Interactive shopping cart and checkout process.
*   **Wallet Integration**: View balance and pay using internal wallet.
*   **Real-time Notifications**: Server-Sent Events (SSE) integration for order status updates.

## 🛠️ Prerequisites

*   Node.js (v18 or higher)
*   npm or yarn or bun

## ⚙️ Environment Variables

Create a `.env` file in the root directory based on `.env.example`:

```bash
cp .env.example .env
```
Ensure you point the API URL to your API Gateway or local services.

## 🚀 How to Run

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Start Development Server:**
    ```bash
    npm run dev
    ```

3.  **Build for Production:**
    ```bash
    npm run build
    ```

## 🐳 Docker Support

```bash
docker build -t eka-dev/coffe-fe .
```
