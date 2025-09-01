# HighLevel Wallet – Full Stack

Implements the challenge spec with Node/TypeScript/Mongo backend and React/Tailwind frontend.

## Run

### Backend
```bash
cd server
cp .env.example .env
pnpm i # or npm i / yarn
pnpm dev
```

> Mongo must run as a replica set locally for transactions:
```bash
mongod --replSet rs0 --dbpath /data/db
mongosh --eval 'rs.initiate()'
```

### Frontend
```bash
cd web
pnpm i
pnpm dev
```
Open http://localhost:5173
