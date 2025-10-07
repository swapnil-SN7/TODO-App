## CC Todo Backend (Express + DynamoDB)

### Setup

1. Create `.env` based on `.env.example`.
2. Install dependencies:

```
npm install
```

3. Ensure DynamoDB table exists (default `Todos`) with primary key `id` (String).

### Run

- Dev:

```
npm run dev
```

- Prod:

```
npm start
```

Server starts on `PORT` (default 4000).

### Environment vars

See `.env.example` for required values.

### API

- POST `/todos` { title, description? }
- GET `/todos`
- GET `/todos/:id`
- PUT `/todos/:id` { title?, description?, status?('pending'|'completed') }
- DELETE `/todos/:id`

Responses are JSON with appropriate status codes.


