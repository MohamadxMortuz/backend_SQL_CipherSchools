# CipherSQLStudio Backend

Node.js + Express.js backend with PostgreSQL (sandbox execution) and MongoDB (assignments & progress).

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Update `.env` with your database credentials

4. Start development server:
```bash
npm run dev
```

## Project Structure

```
backend/
├── src/
│   ├── config/          # Database configurations
│   │   ├── postgres.js  # PostgreSQL connection
│   │   └── mongodb.js   # MongoDB connection
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Custom middleware
│   ├── models/          # Data models
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   └── server.js        # Application entry point
├── package.json
└── .env.example
```

## Database Setup

### PostgreSQL
Used for sandbox SQL execution. Ensure PostgreSQL is running and create a database.

### MongoDB
Used for storing assignments and user progress. Ensure MongoDB is running.

## API Endpoints

- `GET /health` - Health check endpoint





