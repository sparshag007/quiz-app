# Jumbo Test

## Prerequisites

- Node.js (version 16.x or higher)
- Docker (for containerization)
- Kubernetes (for deployment on Minikube or cloud)
- PostgreSQL (for the database)
- Redis (for caching)
- Sequelize (for ORM)

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/sparshag007/quiz-app.git
cd quiz-app
```

### 2. Install the required dependencies

```bash
npm install
```

### 3. Database Configuration

Make sure you have PostgreSQL running locally or through Docker. Update the config/config.json file with the correct database configuration.

### 4. Run the Application Locally

Make sure you have PostgreSQL running locally or through Docker. Update the config/config.json file with the correct database configuration.

You can run the server in development or production mode:

Development (with Nodemon)

```bash
npm run dev
```
Production

```bash
npm run build
npm start
```

### 5. Database Migrations

To set up the database schema, run the following migration commands:

Migrate

```bash
npm run migrate
```

Undo Migration

```bash
npm run undo-migration
```


