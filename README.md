# CryVi SmartWeb3

CryVi SmartWeb3 is a multifaceted project. Its core includes a root-level framework (`src/`) for primary database schema management (using Drizzle ORM, configured via the root `drizzle.config.ts`) and potentially other shared utilities or core backend logic.

Alongside this, the project features a comprehensive full-stack web application within the `web-app/` directory. This web application is managed as a Turborepo monorepo and provides a suite of tools for Web3 development and interaction, built with React (Vite + TypeScript) for the frontend, Node.js (Express + TypeScript) for its backend, PostgreSQL, and integrations with blockchain services like Alchemy and Zerion.

## Project Structure

This project has a root-level structure managing a primary database schema and potentially other core functionalities, alongside a `web-app/` directory which contains a full-stack monorepo application.

```
cryvisw3dapp/
├── .env                # Optional: Root-level environment variables for scripts or local root DB connection
├── README.md           # This file: Project overview, setup, and usage instructions
├── drizzle.config.ts   # Drizzle ORM configuration for the root `src/db/schema.ts`
├── postcss.config.js   # PostCSS configuration (likely for any UI built/served from root `src/`)
├── src/                # Root source code, primarily for database schema management and potentially a core backend
│   ├── db/
│   │   ├── migrate.ts  # Script to run database migrations for the schema defined in `src/db/schema.ts`
│   │   └── schema.ts   # Primary Drizzle ORM database schema definitions for the overall project
│   └── index.ts        # Potential main entry point for a root-level backend application or script execution
├── tailwind.config.js  # Tailwind CSS configuration (likely for any UI built/served from root `src/`)
├── tsconfig.json       # TypeScript configuration for the root project
└── web-app/            # Contains the full-stack web application (Turborepo monorepo)
    ├── apps/           # Individual applications (e.g., frontend, backend) within the web-app
    ├── packages/       # Shared packages (e.g., ESLint configs, TypeScript configs) for the web-app
    ├── docker-compose.yml # Docker Compose configuration for all web-app services
    ├── package.json    # Root package.json for the Turborepo (manages web-app workspaces and scripts)
    └── turbo.json      # Turborepo pipeline configuration
```

It's important to distinguish between the root-level `src/db/schema.ts` (managed by the root `drizzle.config.ts`) and any database setup specific to the `web-app/apps/backend/` application. The setup and script instructions provided in this README primarily focus on the `web-app/` monorepo and its constituent applications. Managing the root-level database schema might involve separate scripts or commands (e.g., defined in the root `package.json` if present, or run via `npx drizzle-kit` from the project root).

### Web Application Details (`web-app/`)

The `web-app/` directory is a Turborepo-managed monorepo containing a full-stack web application. Its internal structure, detailed below, includes its own frontend, backend, and potentially shared packages:

```
cryvisw3dapp/
├── web-app/
│   ├── apps/
│   │   ├── frontend/     # React (Vite + TypeScript) application
│   │   │   ├── public/
│   │   │   ├── src/
│   │   │   ├── Dockerfile
│   │   │   ├── vite.config.ts
│   │   │   └── package.json
│   │   └── backend/      # Node.js (Express + TypeScript) application
│   │       ├── src/
│   │       │   ├── db/
│   │       │   │   ├── schema.ts
│   │       │   │   └── migrate.ts
│   │       │   ├── services/
│   │       │   │   ├── alchemyService.ts
│   │       │   │   └── zerionService.ts
│   │       │   └── index.ts
│   │       ├── drizzle/    # Drizzle ORM migration files
│   │       ├── Dockerfile
│   │       ├── drizzle.config.ts
│   │       └── package.json
│   ├── packages/         # (Optional) Shared packages for monorepo
│   ├── docker-compose.yml
│   ├── turbo.json
│   └── package.json      # Root package.json for Turborepo
└── README.md             # This file
```

## Technologies Used

**Monorepo:**
*   **Turborepo:** High-performance build system for JavaScript and TypeScript monorepos.

**Frontend:**
*   **React:** JavaScript library for building user interfaces (with Vite).
*   **TypeScript:** Superset of JavaScript for type safety.
*   **Tailwind CSS:** Utility-first CSS framework.
*   **Daisy UI:** UI component library for Tailwind CSS.
*   **React Router:** Declarative routing for React applications.
*   **Vite:** Fast frontend build tool.

**Backend:**
*   **Node.js:** JavaScript runtime environment.
*   **Express.js:** Web application framework for Node.js.
*   **TypeScript:** For type safety.
*   **Drizzle ORM:** TypeScript ORM for SQL databases.
*   **PostgreSQL:** Powerful, open-source object-relational database system.

**Blockchain Integration:**
*   **Alchemy SDK:** Library for interacting with the Ethereum blockchain.
*   **Zerion API:** API for tracking DeFi portfolios and interacting with various blockchain data.

**Containerization:**
*   **Docker & Docker Compose:** For creating, deploying, and running applications in containers.

## Prerequisites

*   Node.js (v18 or later recommended)
*   npm (or your preferred package manager like Yarn or pnpm, though scripts here use npm)
*   Docker (if you plan to use Docker for development/deployment)
*   Git

## Getting Started

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd cryvisw3dapp
# Or your chosen project directory name
```

### 2. Install Dependencies

This project uses Turborepo. All commands below assume you are in the `cryvisw3dapp` (project root) directory. The Turborepo setup is within the `web-app` subdirectory.

```bash
cd web-app && npm install
```

### 3. Environment Variables

Several services require API keys and specific configurations. These are managed via `.env` files.

**Backend Configuration (`web-app/apps/backend/.env`):**

Create a `.env` file in the `web-app/apps/backend/` directory. You can copy the template below or create the file from scratch.

```
# Server Configuration
PORT=3001 # Port for the backend server.

# Database Connection (for local development outside Docker)
# Ensure PostgreSQL is running and accessible at this URL.
DATABASE_URL="postgresql://myuser:mypassword@localhost:5432/myappdb" # Connection string for PostgreSQL (when running backend locally, outside Docker).

# API Keys (obtain these from the respective services)
ALCHEMY_API_KEY="YOUR_ALCHEMY_API_KEY" # Your API key from Alchemy for Ethereum blockchain interaction.
ZERION_API_KEY="YOUR_ZERION_API_KEY" # Your API key from Zerion for DeFi portfolio tracking. (Note: Check Zerion docs for exact format, may need Base64 encoding if used for Basic Auth).

# Docker Compose Database Credentials (used by web-app/docker-compose.yml)
# These are defaults if not set in your shell environment when running docker-compose.
POSTGRES_USER="myuser" # Username for the PostgreSQL database (used by Docker Compose).
POSTGRES_PASSWORD="mypassword" # Password for the PostgreSQL database (used by Docker Compose).
POSTGRES_DB="myappdb" # Name of the PostgreSQL database (used by Docker Compose).
DATABASE_URL_DOCKER="postgresql://myuser:mypassword@db:5432/myappdb" # Connection string for PostgreSQL (used by the backend service when running inside Docker).
```

*   Replace placeholder values with your actual API keys and database credentials.
*   The `.env` file should be located at `web-app/apps/backend/.env`.
*   For the Zerion API key: if it's intended for Basic Authentication, it might need to be a base64 encoded string of `username:password`, or simply the API key if it's a Bearer token. Always refer to the official Zerion API documentation and check the implementation in `web-app/apps/backend/src/services/zerionService.ts`.

### 4. Database Setup (Drizzle ORM & PostgreSQL)

Before starting the `web-app/` application's services, its dedicated database needs to be set up and the relevant migrations run. These migrations pertain to the schema used by the `web-app/apps/backend/` (which may be defined within that app or potentially utilize/extend the root `src/db/schema.ts`). Drizzle ORM, as configured within the `web-app/apps/backend/` application, uses its schema definitions to generate and apply SQL migration files, ensuring its database structure is up to date.

**Choose one of the following options for database setup:**

**Option A: Using Docker (Recommended)**

This is the recommended approach for a consistent development environment. Ensure you are in the `cryvisw3dapp` (project root) directory for all commands.

1.  **Start the PostgreSQL service using Docker Compose:**
    This command starts only the database container in detached mode.
    ```bash
    cd web-app && docker-compose up -d db
    ```
2.  **Generate and Apply Migrations:**
    *   `db:generate`: This command, when run for the `web-app/apps/backend` workspace (i.e., `cd web-app && npm run db:generate --workspace=@web-app/backend`), looks at its Drizzle schema configuration and creates SQL migration files (typically in `web-app/apps/backend/drizzle/`). You should run this whenever you change the schema relevant to the `web-app/apps/backend`.
    *   `db:migrate`: This command (i.e., `cd web-app && npm run db:migrate --workspace=@web-app/backend`) applies any pending migration files to the database configured in `web-app/apps/backend/.env` (using `DATABASE_URL_DOCKER` for Docker or `DATABASE_URL` for local execution against the `web-app`'s database).

    Run the following commands from the `cryvisw3dapp` directory:
    ```bash
    # Generate migration files (if you've changed the schema)
    cd web-app && npm run db:generate --workspace=@web-app/backend

    # Apply migrations to the database
    cd web-app && npm run db:migrate --workspace=@web-app/backend
    ```
    Alternatively, if the backend service container is already running (e.g., via `cd web-app && docker-compose up -d`), you can execute these commands within the container:
    ```bash
    # From the project root (cryvisw3dapp)
    # cd web-app && docker-compose exec backend npm run db:generate
    # cd web-app && docker-compose exec backend npm run db:migrate
    ```

**Option B: Local PostgreSQL Instance**

If you prefer to use a PostgreSQL instance running directly on your machine (not in Docker):

1.  **Ensure PostgreSQL is Installed and Running:** Install PostgreSQL locally and make sure the service is active.
2.  **Configure Connection:**
    *   In `web-app/apps/backend/.env`, make sure the `DATABASE_URL` variable points to your local PostgreSQL instance (e.g., `postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/YOUR_DB_NAME`).
3.  **Create Database (if needed):** Manually create the database specified in `DATABASE_URL` if it doesn't already exist.
4.  **Generate and Apply Migrations:**
    Run the following commands from the `cryvisw3dapp` directory:
    ```bash
    # Generate migration files (if you've changed the schema)
    cd web-app && npm run db:generate --workspace=@web-app/backend

    # Apply migrations to the database
    cd web-app && npm run db:migrate --workspace=@web-app/backend
    ```

**Drizzle Studio (Optional Database GUI):**

Drizzle Studio provides a web interface to view and manage your database schema and data.
To use it, run the following command from the `cryvisw3dapp` (project root) directory. It will use the `DATABASE_URL` from `web-app/apps/backend/.env`.
```bash
cd web-app && npm run db:studio --workspace=@web-app/backend
```

## Available Scripts

This project uses Turborepo to manage the `web-app` monorepo. Scripts can be run at the root of the monorepo (`web-app/package.json`) or within specific applications (workspaces) like `frontend` or `backend`.

**All commands listed below should be executed from the `cryvisw3dapp` (project root) directory.**

**Monorepo Root Level (scripts in `web-app/package.json`):**

These commands typically orchestrate actions across multiple applications within the `web-app`.

*   `cd web-app && npm run dev`: Starts both the frontend and backend applications in development mode (using their respective `dev` scripts).
*   `cd web-app && npm run build`: Builds both the frontend and backend applications for production.

**Application-Specific Scripts (Workspaces):**

To run scripts for a specific application (e.g., backend or frontend), you use the `--workspace` flag with `npm run`.

**Backend (`web-app/apps/backend`):**
Run these using `cd web-app && npm run <script_name> --workspace=@web-app/backend` from the `cryvisw3dapp` directory.

*   `dev`: Starts the backend server with `nodemon` for automatic reloading on file changes.
*   `build`: Compiles the backend TypeScript code to JavaScript.
*   `start`: Starts the compiled backend server (typically for production).
*   `db:generate`: Generates Drizzle ORM migration files for the `web-app/apps/backend` based on its specific schema configuration.
*   `db:migrate`: Applies pending Drizzle ORM migrations to the database used by `web-app/apps/backend`.
*   `db:studio`: Starts Drizzle Studio, a GUI for viewing and managing your database.

**Frontend (`web-app/apps/frontend`):**
Run these using `cd web-app && npm run <script_name> --workspace=@web-app/frontend` from the `cryvisw3dapp` directory.

*   `dev`: Starts the Vite development server for the React frontend, enabling features like Hot Module Replacement (HMR).
*   `build`: Builds the React application for production, optimizing assets and code.
*   `preview`: Serves the production build of the frontend locally for previewing before deployment.

## Running with Docker

The `web-app/docker-compose.yml` file defines and orchestrates the multi-container application, including the frontend, backend, and database services.

**All Docker Compose commands should be run from the `cryvisw3dapp` (project root) directory, prefixed with `cd web-app && ` to ensure they execute in the context where `docker-compose.yml` is located.**

1.  **Prerequisites: Environment Variables**
    *   Before building or running Docker containers, ensure you have correctly configured the `.env` file at `web-app/apps/backend/.env`.
    *   **Crucially, the `DATABASE_URL_DOCKER` variable must be set correctly**, as this is what the backend service will use to connect to the PostgreSQL service within the Docker network.
    *   Other API keys (`ALCHEMY_API_KEY`, `ZERION_API_KEY`) should also be in place if you expect those services to work within the Dockerized application.

2.  **Build and Start Services:**
    *   **To build (or rebuild) images and start all services in the foreground (logs visible):**
        ```bash
        cd web-app && docker-compose up --build
        ```
    *   **To build (or rebuild) and start all services in detached mode (runs in background):**
        ```bash
        cd web-app && docker-compose up -d --build
        ```
    *   If you only want to start services without rebuilding (e.g., if images are already built and up-to-date):
        ```bash
        cd web-app && docker-compose up -d
        ```

3.  **Accessing Services:**
    Once the containers are running:
    *   **Frontend:** Accessible at `http://localhost:8080` (This is typically served by an Nginx container, as defined in `web-app/docker-compose.yml`).
    *   **Backend API:** Accessible at `http://localhost:3001` (The backend service itself).
    *   **PostgreSQL Database:** The database service (`db`) within Docker is typically mapped to `localhost:5432` on your host machine, allowing you to connect with external database tools if needed.

4.  **Running Database Migrations (with services running):**
    If your services are already running (e.g., via `docker-compose up -d`), and you need to apply or generate database migrations, use `docker-compose exec` to run commands inside the `backend` service container:
    ```bash
    # To apply pending migrations:
    cd web-app && docker-compose exec backend npm run db:migrate

    # To generate new migration files (after schema changes):
    cd web-app && docker-compose exec backend npm run db:generate
    ```
    (Remember to have run `npm install` within the `web-app` directory so that `node_modules` including Drizzle CLI are available to be copied into the Docker image).

5.  **Viewing Logs (if running in detached mode):**
    ```bash
    cd web-app && docker-compose logs -f # View logs for all services
    cd web-app && docker-compose logs -f backend # View logs for a specific service
    ```

6.  **Stopping Services:**
    *   **To stop all running services:**
        ```bash
        cd web-app && docker-compose down
        ```
    *   **To stop services and remove associated volumes (including database data, use with caution!):**
        ```bash
        cd web-app && docker-compose down -v
        ```

## Contributing

Contributions are welcome! We appreciate any help you can offer to improve the project.

Please refer to the `CONTRIBUTING.md` file for guidelines on how to:
*   Report bugs and suggest features
*   Set up your development environment for contributing
*   Submit pull requests
*   Follow coding standards

(TODO: Create a `CONTRIBUTING.md` file with detailed contribution guidelines.)

## License

[Specify the license for your project, e.g., MIT]

---
*Remember to replace placeholders like "<your-repository-url>", and license information.*
