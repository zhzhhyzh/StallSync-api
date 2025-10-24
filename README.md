# StallSync: Canteen Management System - Backend API

**StallSync** is the robust backend API for the Canteen Management System. It is built using the **Node.js/Express.js/SQL (PostgreSQL)** stack, handling data persistence, business logic, and secure API routing for the frontend application.

---

## 1. System Overview (StallSync)

StallSync manages all core operations for a canteen, from inventory tracking to order fulfillment. It serves as the single source of truth for the entire system.

### Core Entities

| Entity | Purpose | Key Responsibilities Handled by Backend |
| :--- | :--- | :--- |
| **User** | Manages authentication (login/logout) and authorization (roles). | Handles user creation, password hashing, and token generation (JWT). |
| **Category** | Defines groups for menu items (e.g., 'Beverages', 'Noodles'). | Provides endpoints for listing and managing categories. |
| **Product** | Represents a sellable menu item (e.g., 'Coffee', 'Chicken Rice'). | Manages product details, pricing, and availability status. |
| **Supplier** | Tracks vendors supplying raw materials or pre-made goods. | Stores contact information and links to procurement history. |
| **Transaction** | Records all financial activity, specifically successful orders/sales. | Generates sales reports and manages payment processing logic. |
| **Order** | **(Crucial)** Represents a specific customer's request. It contains items, total cost, and status (e.g., 'Pending', 'Preparing', 'Ready'). | Manages the order lifecycle, from creation to completion. **Links to multiple Products.** |
| **InventoryItem** | Tracks raw materials or ingredients (e.g., 'Milk', 'Rice', 'Sugar'). | Manages stock levels and alerts for low inventory. Used to calculate the cost of goods sold. |

---

## 2. Backend Setup: Visual Studio Code (VS Code)

This guide provides the steps required to set up and run the StallSync Node.js/Express.js backend locally using VS Code.

### 2.1. Prerequisites

1.  **Node.js:** Version **18 or newer** is recommended.
2.  **PostgreSQL Server:** A running instance of a **PostgreSQL** server is required.
3.  **Visual Studio Code (VS Code):** The preferred code editor.

### 2.2. Installation & Dependency Setup

1.  **Clone the Repository** (If applicable):
    ```bash
    git clone https://github.com/zhzhhyzh/StallSync-api.git
    ```
2.  **Open the Project in VS Code.**
3.  **Install Dependencies:** Open the integrated **Terminal** (`Ctrl+Shift+'`) and run:
    ```bash
    npm install
    # OR
    yarn install
    ```

### 2.3. Database Configuration and Initialization (Crucial Step)

The backend uses a specific configuration defined in the `.env` file. You must ensure your environment and database match these settings before proceeding.

1.  **Create the Database:** Using your PostgreSQL client (like pgAdmin or the psql terminal), create the required database:
    ```sql
    CREATE DATABASE stallSync;
    ```
    * **Note:** The system expects the database name to be **`stallSync`** and to connect on port **`5432`** using the user **`postgres`**.

2.  **Environment Variables:** Verify your local `.env` file contains the required settings:
    ```
    DB_HOST=localhost
    DB_USER=postgres
    DB_PASSWORD=123456
    DB_NAME=stallSync
    DB_PORT=3306
    NODE_ENV=local
    PORT=5040
    ACCESS_TOKEN_SECRET=
    REFRESH_TOKEN_SECRET=
    BREVO_API_KEY=
    API_KEY=
    STRIPE_SECRET_KEY=
    ```

3.  **Run Migrations:** Execute the script to create the necessary tables defined by the entities:

    ```bash
    # Example using popular ORM commands (adjust as needed)
    npm run migrate:up
    ```

4.  **Run Seeders (Optional):** Execute the script to populate the database with initial data (e.g., admin user, initial categories):

    ```bash
    # Example using popular ORM commands (adjust as needed)
    npm run seed:run
    ```

### 2.4. Running the API Server

1.  **Open the Terminal** (if closed).
2.  Execute the start command:

    ```bash
    npm run dev
    # OR
    yarn dev
    ```

The console will confirm that the API is running: `Server is running on port 5040 in local mode...`

The backend API will now be accessible at **`http://localhost:5040`**.

---

## 3. Postman/API Testing

Use a tool like **Postman** or **VS Code's Thunder Client** to interact with the API.

* **Base URL:** `http://localhost:5040/api` (Adjust the version path as defined in your code)
* **Example Endpoint Test (Check Status):**
    * **Method:** `GET`
    * **URL:** `http://localhost:5040/api/product/list`
