# CryVi SmartWeb3

Welcome to CryVi SmartWeb3! This project helps you build and interact with Web3 applications. It includes a full-stack web application with a user-friendly interface (frontend) and a powerful server-side component (backend).

## What's Inside?

This project is like a big toolbox for Web3 developers. Here's a peek at what it offers:

*   **Frontend:** A modern website built with React, TypeScript, and Vite for a fast and smooth user experience. Styled with Tailwind CSS and Daisy UI.
*   **Backend:** A robust server built with Node.js, Express, and TypeScript. It handles data, business logic, and communication with the blockchain.
*   **Database:** Uses PostgreSQL, a reliable open-source database, to store application data.
*   **Blockchain Tools:** Integrates with services like Alchemy (for talking to the Ethereum blockchain) and Zerion (for tracking DeFi portfolios).
*   **Monorepo Power:** Uses Turborepo to manage the frontend and backend code together efficiently.
*   **Containerization:** Includes Docker support, making it easy to set up and run the project consistently anywhere.

## Project Structure

The project is organized to keep things tidy. The main parts are within the `web-app/` folder:

```
cryvisw3dapp/
├── README.md           # You are here! This guide explains the project.
└── web-app/            # Contains the full-stack web application
    ├── apps/           # Houses the frontend and backend applications
    │   ├── frontend/   # Code for the website you see and interact with
    │   └── backend/    # Code for the server that works behind the scenes
    │       ├── src/      # Main source code for the backend
    │       │   ├── db/
    │       │   │   └── schema.ts # Describes the structure of the backend's database
    │       │   └── ... (other backend files)
    │       └── package.json # Lists dependencies for the backend
    ├── packages/       # Shared code or configurations for the web-app
    ├── docker-compose.yml # Instructions for Docker to run the app
    ├── package.json    # Manages the web-app parts and shared scripts
    └── turbo.json      # Configuration for Turborepo
```

The backend (`web-app/apps/backend/`) is where any database interactions are primarily managed.

## Technologies We Use

*   **Turborepo:** Helps manage the frontend and backend code efficiently.
*   **React & Vite:** For building a fast and modern frontend.
*   **TypeScript:** Adds an extra layer of reliability to JavaScript code.
*   **Tailwind CSS & Daisy UI:** For styling the website beautifully.
*   **Node.js & Express.js:** For building a strong backend server.
*   **PostgreSQL:** A popular and robust database for storing information.
*   **Alchemy SDK & Zerion API:** Tools for connecting to the blockchain world.
*   **Docker:** A tool to package the application so it runs the same way everywhere.

## Before You Start (Prerequisites)

Make sure you have these tools installed on your computer:

*   **Node.js:** (Version 18 or newer is recommended) - This lets you run JavaScript code.
*   **npm:** (Usually comes with Node.js) - This helps you install project dependencies.
*   **Docker:** (Optional, but recommended for easier setup) - This helps run the application in a consistent environment.
*   **Git:** For downloading (cloning) the project code.

## Getting Started: Your First Steps

Let's get the project up and running on your computer!

### 1. Download the Code

First, you need to get a copy of the project. Open your terminal (command prompt) and run:

```bash
git clone <your-repository-url>
cd cryvisw3dapp
# Replace <your-repository-url> with the actual link to the project.
# cd cryvisw3dapp navigates you into the project's main folder.
```

### 2. Install Project Dependencies

The project has several parts (frontend, backend) that need their own tools. We use Turborepo to manage this. Navigate to the `web-app` folder and install everything:

```bash
cd web-app
npm install
# This command looks at package.json files and downloads all necessary libraries.
```

### 3. Set Up Environment Variables (Important Secrets!)

The backend needs some secret keys and settings to work, like API keys for Alchemy and Zerion, and database connection details.

*   Go to the `web-app/apps/backend/` folder.
*   Create a new file named `.env`.
*   Copy the content from the example below into your new `.env` file.

**Example for `web-app/apps/backend/.env`:**

```
# Server Configuration
PORT=3001 # Port for the backend server.

# --- Database Connection ---
# For running the backend directly on your computer (Option B in Database Setup)
DATABASE_URL="postgresql://myuser:mypassword@localhost:5432/myappdb"

# For running the backend inside Docker (Option A in Database Setup)
DATABASE_URL_DOCKER="postgresql://myuser:mypassword@db:5432/myappdb"

# --- API Keys (Get these from the services themselves) ---
ALCHEMY_API_KEY="YOUR_ALCHEMY_API_KEY"
ZERION_API_KEY="YOUR_ZERION_API_KEY" # Check Zerion's docs for how to format this.

# --- Docker Compose Database Settings ---
# These are used by web-app/docker-compose.yml if not set elsewhere.
POSTGRES_USER="myuser"
POSTGRES_PASSWORD="mypassword"
POSTGRES_DB="myappdb"
```

**Important:**
*   Replace `"YOUR_ALCHEMY_API_KEY"` and `"YOUR_ZERION_API_KEY"` with your actual keys.
*   For `DATABASE_URL`, `myuser`, `mypassword`, and `myappdb` are examples. You might need to change these based on your PostgreSQL setup.
*   The `.env` file is ignored by Git, so your secrets stay safe on your computer.

### 4. Set Up the Database (PostgreSQL)

The backend needs a PostgreSQL database to store information.

**Option A: Using Docker (Recommended for Beginners)**

This is the easiest way to get PostgreSQL running without installing it directly on your computer. Make sure Docker is running.

1.  **Start the PostgreSQL Database with Docker Compose:**
    Open your terminal in the `cryvisw3dapp/web-app/` directory (where the `docker-compose.yml` file is).
    ```bash
    docker-compose up -d db
    ```
    *   `docker-compose up`: Starts services defined in `docker-compose.yml`.
    *   `-d`: Runs the database in the background (detached mode).
    *   `db`: Tells Docker Compose to only start the service named 'db' (our PostgreSQL database).

    Your database is now running in Docker! The backend, when also run in Docker, will connect to it using `DATABASE_URL_DOCKER` from your `.env` file.

**Option B: Local PostgreSQL Instance**

If you prefer, you can install PostgreSQL directly on your computer.

1.  **Install and Run PostgreSQL:** Download and install PostgreSQL. Make sure the service is running.
2.  **Create a Database:** Create a new database (e.g., `myappdb`) and a user (e.g., `myuser`) with a password (e.g., `mypassword`).
3.  **Configure `DATABASE_URL`:** In your `web-app/apps/backend/.env` file, make sure the `DATABASE_URL` variable correctly points to your local PostgreSQL instance (e.g., `postgresql://myuser:mypassword@localhost:5432/myappdb`).

**Database Structure (Schema):**
The structure of the database tables is defined in `web-app/apps/backend/src/db/schema.ts`. If you are using an ORM or migration tool with your PostgreSQL setup (other than Drizzle, which has been removed), you would manage database changes (migrations) according to that tool's instructions. This README now provides general guidance for PostgreSQL setup.

## How to Run the Application

You can run the frontend and backend separately for development or run everything together using Docker.

**All commands below should be run from the `cryvisw3dapp/web-app/` directory.**

### Running in Development Mode (Without Docker)

This is useful for actively developing and seeing changes quickly.

*   **Start the Backend Server:**
    ```bash
    npm run dev --workspace=@web-app/backend
    ```
    This usually starts the backend on `http://localhost:3001`. It will watch for file changes and restart automatically.

*   **Start the Frontend Development Server:**
    In a **new terminal window** (also in the `cryvisw3dapp/web-app/` directory):
    ```bash
    npm run dev --workspace=@web-app/frontend
    ```
    This usually starts the frontend on `http://localhost:5173` (Vite's default) or similar. Your browser might open automatically.

### Running with Docker (Recommended for a Complete Setup)

Docker makes it easy to run the entire application (frontend, backend, and database) together.

1.  **Ensure Prerequisites:**
    *   Docker is installed and running.
    *   Your `web-app/apps/backend/.env` file is correctly configured, especially `DATABASE_URL_DOCKER` and your API keys.

2.  **Build and Start All Services:**
    In your terminal, from the `cryvisw3dapp/web-app/` directory:
    ```bash
    docker-compose up --build
    ```
    *   `--build`: Tells Docker to build the images for the frontend and backend before starting. You only need to do this the first time or if you change their Dockerfiles.
    *   This command will show logs from all services in your terminal.

    To run in the background (detached mode):
    ```bash
    docker-compose up -d --build
    ```

3.  **Accessing the Application:**
    Once Docker is finished:
    *   **Frontend (Website):** Open your browser to `http://localhost:8080`
    *   **Backend API:** Is available at `http://localhost:3001` (the frontend uses this internally).

4.  **Viewing Logs (if running in background):**
    ```bash
    docker-compose logs -f # Shows logs from all services
    docker-compose logs -f backend # Shows logs only for the backend
    ```

5.  **Stopping the Application:**
    *   If running in the foreground (logs visible), press `Ctrl + C` in the terminal.
    *   If running in the background (detached mode):
        ```bash
        docker-compose down
        ```
    *   To stop and remove data volumes (like database data, **use with caution!**):
        ```bash
        docker-compose down -v
        ```

## Available Scripts

Here are some useful commands you can run from the `cryvisw3dapp/web-app/` directory using `npm run <script_name>`. Use the `--workspace` flag to target a specific app (frontend or backend).

**General (run from `web-app/`):**

*   `npm run dev`: Tries to start both frontend and backend in development mode.
*   `npm run build`: Creates production-ready versions of both frontend and backend.

**Backend (`--workspace=@web-app/backend`):**

*   `npm run dev --workspace=@web-app/backend`: Starts backend in development mode (watches files).
*   `npm run build --workspace=@web-app/backend`: Compiles backend code for production.
*   `npm run start --workspace=@web-app/backend`: Runs the compiled backend (for production).

**Frontend (`--workspace=@web-app/frontend`):**

*   `npm run dev --workspace=@web-app/frontend`: Starts frontend in development mode (fast updates).
*   `npm run build --workspace=@web-app/frontend`: Builds frontend for production.
*   `npm run preview --workspace=@web-app/frontend`: Lets you view the production build locally.

## Contributing

We'd love your help to make this project better! (A `CONTRIBUTING.md` file with more details will be added later).

## License

[Specify the license for your project, e.g., MIT License]

---
*Remember to replace placeholders like `<your-repository-url>` and update the license information.*
