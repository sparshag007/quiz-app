# Quiz App
Realtime quiz game

## Prerequisites

- Node.js (version 16.x or higher)
- Docker (for containerization)
- Kubernetes (for deployment on Minikube or cloud)
- PostgreSQL (for the database)
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
Add DATABASE_URL in .env file

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

### 6. Dockerizing and deploying to K8

Building the docker image
```bash
docker build -t quiz-app .
docker build --no-cache -t quiz-app .
```

```bash
kubectl apply -f kube.yml
kubectl port-forward svc/node-service 3000:3000 # if external port not provisioned use port-forwarding to run locally
```

Access the app at http://localhost:3000/

