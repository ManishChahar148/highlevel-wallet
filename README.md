# HighLevel Wallet – Full Stack

A digital wallet system with precise money handling, built with Node.js/TypeScript/MongoDB backend and React/Tailwind frontend. The system uses integer micro-units (×10000) for 4 decimal places precision, avoiding floating-point errors.

## Quick Start

### Backend
```bash
cd server
cp .env.example .env
npm i
npm run dev
```

> **Important**: MongoDB must run as a replica set for transaction support:
```bash
mongod --replSet rs0 --dbpath /data/db
mongosh --eval 'rs.initiate()'
```

### Frontend
```bash
cd web
npm i
npm run dev
```
Open http://localhost:5173

## Architecture Overview

### Technology Stack
- **Backend**: Node.js, TypeScript, Express.js, Mongoose
- **Database**: MongoDB with replica set (for atomic transactions)
- **Frontend**: React, TypeScript, Tailwind CSS
- **Validation**: Zod schemas
- **Money Handling**: BigInt with 4 decimal precision

### Key Features
- Atomic transactions using MongoDB sessions
- Precise decimal handling avoiding floating-point errors
- Negative balance support
- Real-time balance updates
- Paginated transaction history
- Input validation and error handling

## API Documentation

### Base URL
```
http://localhost:4000
```

### Endpoints

#### 1. Create Wallet
**POST** `/setup`

Creates a new wallet with an optional initial balance.

**Request Body:**
```json
{
  "name": "My Wallet",        // Required
  "balance": 100.50           // Optional, default: 0
}
```

**Response (200):**
```json
{
  "id": "abc123def456",
  "balance": 100.50,
  "transactionId": "xyz789ghi012",
  "name": "My Wallet",
  "date": "2024-01-01T00:00:00.000Z"
}
```

#### 2. Get All Wallets
**GET** `/wallets`

Retrieves all wallets in the system.

**Response (200):**
```json
[
  {
    "id": "abc123def456",
    "balance": 100.50,
    "name": "My Wallet",
    "date": "2024-01-01T00:00:00.000Z"
  }
]
```

#### 3. Get Wallet by ID
**GET** `/wallet/:id`

Retrieves a specific wallet.

**Parameters:**
- `id` - Wallet ID

**Response (200):**
```json
{
  "id": "abc123def456",
  "balance": 100.50,
  "name": "My Wallet",
  "date": "2024-01-01T00:00:00.000Z"
}
```

**Error Response (404):**
```json
{
  "message": "Wallet not found"
}
```

#### 4. Create Transaction
**POST** `/transact/:walletId`

Creates a credit or debit transaction.

**Parameters:**
- `walletId` - Target wallet ID

**Request Body:**
```json
{
  "amount": 50.25,              // Positive for credit, negative for debit
  "description": "Payment"      // Optional
}
```

**Response (200):**
```json
{
  "balance": 150.75,            // New balance after transaction
  "transactionId": "xyz789ghi012"
}
```

#### 5. Get Transactions
**GET** `/transactions`

Retrieves paginated transaction history.

**Query Parameters:**
- `walletId` (required) - Wallet ID
- `skip` (optional) - Number of records to skip (default: 0)
- `limit` (optional) - Max records to return (default: 25, max: 100)

**Response (200):**
```json
{
  "transactions": [
    {
      "id": "xyz789ghi012",
      "walletId": "abc123def456",
      "amount": 50.25,
      "balance": 150.75,
      "description": "Payment",
      "date": "2024-01-01T00:00:00.000Z",
      "type": "CREDIT"
    }
  ],
  "hasMore": false
}
```

## Implementation Details

### Money Handling System

The system uses a micro-unit approach to handle money with perfect precision:

- **Scale Factor**: 10,000 (4 decimal places)
- **Storage**: BigInt values stored as strings in MongoDB
- **Conversion**: `123.45` → `1234500` (micro-units)

#### Key Functions (server/src/utils/money.ts)

```typescript
// Convert decimal to micro-units
parseAmountToUnits("123.45") // Returns: 1234500n

// Convert micro-units to decimal
unitsToDecimal(1234500n) // Returns: 123.45

// Format with 4 decimal places
format4(1234500n) // Returns: "123.4500"
```

### Database Models

#### Wallet Schema
```typescript
{
  _id: string;           // Custom 12-char ID
  name: string;          // Wallet name
  balanceUnits: string;  // Balance in micro-units (BigInt)
  createdAt: Date;       // Creation timestamp
}
```

#### Transaction Schema
```typescript
{
  _id: string;           // Custom 12-char ID
  walletId: string;      // Reference to wallet
  amountUnits: string;   // Amount in micro-units
  balanceUnits: string;  // Balance after transaction
  description: string;   // Transaction description
  date: Date;            // Transaction timestamp
  type: 'CREDIT' | 'DEBIT';
}
```

### Atomic Operations

All financial operations use MongoDB transactions to ensure consistency:

```typescript
// Example: Creating a transaction atomically
const session = await mongoose.startSession();
await session.withTransaction(async () => {
  // Update wallet balance
  await Wallet.findByIdAndUpdate(...);
  // Create transaction record
  await Transaction.create(...);
});
```

### Error Handling

The API uses consistent error responses:

- `400 Bad Request` - Invalid input or validation errors
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server or database errors

### Validation

Input validation using Zod schemas:

```typescript
// Example: Transaction validation
const schema = z.object({
  amount: z.union([z.number(), z.string()]),
  description: z.string().optional()
});
```

## Environment Configuration

### Backend (.env)
```bash
PORT=4000                           # Server port
MONGODB_URI=mongodb://localhost:27017/wallet  # MongoDB connection
```

### Frontend
Configure API endpoint in `/web/src/api.ts` or via `window.API_BASE`.

## Project Structure

```
highlevel-wallet/
├── server/                   # Backend application
│   ├── src/
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # API endpoints
│   │   ├── utils/           # Utility functions
│   │   └── index.ts         # Server entry point
│   └── package.json
├── web/                      # Frontend application
│   ├── src/
│   │   ├── api.ts           # API client
│   │   ├── components/      # React components
│   │   └── App.tsx          # Main application
│   └── package.json
└── README.md
```

## Development Notes

### Prerequisites
- Node.js 16+
- MongoDB 4.4+ (with replica set support)
- pnpm, npm, or yarn

### Testing
The system includes comprehensive error handling and validation. Test cases should cover:
- Decimal precision edge cases
- Negative balances
- Concurrent transactions
- Large numbers
- Invalid inputs

### Security Considerations
- No authentication implemented (as per requirements)
- CORS enabled for development
- Input validation on all endpoints
- Atomic database operations

