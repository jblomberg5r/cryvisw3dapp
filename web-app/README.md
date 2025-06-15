# Web3 Application - CryVi SmartWeb3

This project is a full-stack web application built with a modern technology stack, including React (Vite + TypeScript) for the frontend, Node.js (Express + TypeScript) for the backend, PostgreSQL as the database, and integration with blockchain services like Alchemy and Zerion.

## Project Structure

The project is organized as a monorepo using Turborepo:

\`\`\`
web-app/
├── apps/
│   ├── frontend/     # React (Vite + TypeScript) application
│   │   ├── public/
│   │   ├── src/
│   │   ├── Dockerfile
│   │   ├── vite.config.ts
│   │   └── package.json
│   └── backend/      # Node.js (Express + TypeScript) application
│       ├── src/
│       │   ├── services/
│       │   │   ├── alchemyService.ts
│       │   │   └── zerionService.ts
│       │   └── index.ts
│       ├── Dockerfile
│       └── package.json
├── packages/         # (Optional) Shared packages for monorepo
├── docker-compose.yml
├── turbo.json
└── package.json      # Root package.json for Turborepo
\`\`\`

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

\`\`\`bash
git clone <your-repository-url>
cd web-app
\`\`\`

### 2. Install Dependencies

This project uses Turborepo, which handles installing dependencies for all workspaces.

\`\`\`bash
npm install
\`\`\`

### 3. Environment Variables

Several services require API keys and specific configurations. These are managed via \`.env\` files.

**Backend Configuration (\`apps/backend/.env\`):**

Create an \`.env\` file in the \`apps/backend\` directory by copying the example or creating it from scratch:

\`\`\`
# Server Configuration
PORT=3001

# Database Connection (for local development outside Docker)
# Ensure PostgreSQL is running and accessible at this URL
DATABASE_URL="postgresql://myuser:mypassword@localhost:5432/myappdb"

# API Keys (obtain these from the respective services)
ALCHEMY_API_KEY="YOUR_ALCHEMY_API_KEY"
ZERION_API_KEY="YOUR_ZERION_API_KEY" # Ensure this is base64 encoded if required by Zerion's Basic Auth

# Docker Compose Database Credentials (used by docker-compose.yml)
# These are defaults if not set in your shell environment when running docker-compose
POSTGRES_USER=myuser
POSTGRES_PASSWORD=mypassword
POSTGRES_DB=myappdb
DATABASE_URL_DOCKER="postgresql://myuser:mypassword@db:5432/myappdb" # Used by backend service in Docker
\`\`\`

*   Replace placeholder values with your actual API keys and database credentials.
*   For Zerion API key, if it's used for Basic Authentication, it might need to be in the format \`username:password\` base64 encoded, or just the key itself if it's a Bearer token. Check \`apps/backend/src/services/zerionService.ts\` and Zerion's documentation.

### 4. Database Setup (PostgreSQL)

Ensure your PostgreSQL instance is running and accessible.

*   **Using Docker:** The PostgreSQL service is defined in \`docker-compose.yml\` and can be started with \`docker-compose up -d db\`. The backend service in Docker is pre-configured to connect to this database.
*   **Local Instance:** If you are running a local PostgreSQL instance (not in Docker), ensure the \`DATABASE_URL\` in \`apps/backend/.env\` is correctly pointing to your local database.

Database schema and table management should be handled using standard SQL tools or a separate migration tool of your choice if needed. Refer to the main \`README.md\` in the repository root for more general guidance on database structure if available.

## Available Scripts

Turborepo allows running scripts from the root \`package.json\` or within specific workspaces.

**Root Level (via Turborepo):**

*   \`npm run dev\`: Starts both frontend and backend applications in development mode.
*   \`npm run build\`: Builds both frontend and backend applications for production.

**Backend (\`apps/backend\`):**
(Can be run with \`npm run <script> --workspace=@web-app/backend\` from root)

*   \`npm run dev\`: Starts the backend server with \`nodemon\` for auto-reloading.
*   \`npm run build\`: Compiles TypeScript to JavaScript.
*   \`npm run start\`: Starts the compiled backend server (for production).

**Frontend (\`apps/frontend\`):**
(Can be run with \`npm run <script> --workspace=@web-app/frontend\` from root)

*   \`npm run dev\`: Starts the Vite development server for the React app.
*   \`npm run build\`: Builds the React app for production.
*   \`npm run preview\`: Serves the production build locally for preview.

## Running with Docker

The \`docker-compose.yml\` file orchestrates the frontend, backend, and database services.

1.  **Ensure \`.env\` files are configured**, especially \`apps/backend/.env\` with \`DATABASE_URL_DOCKER\` and other necessary keys.
2.  **Build and Start Services:**
    \`\`\`bash
    docker-compose up --build
    \`\`\`
    (Add \`-d\` to run in detached mode)
3.  **Accessing Services:**
    *   Frontend: \`http://localhost:8080\` (served by Nginx)
    *   Backend API: \`http://localhost:3001\`
    *   PostgreSQL: Accessible on host port \`5432\` (if needed for external tools)
4.  **Stopping Services:**
    \`\`\`bash
    docker-compose down
    \`\`\`
    (Add \`-v\` to remove volumes, including database data)

## Contributing

[Details about contributing to the project, coding standards, pull request process, etc.]

## License

[Specify the license for your project, e.g., MIT]

---
*Remember to replace placeholders like "[Project Name Placeholder]", "<your-repository-url>", and license information.*
