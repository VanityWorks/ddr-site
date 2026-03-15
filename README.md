# DDR — DevDoneRight

A modern storefront for DDR development resources, powered by the Tebex API.

## Features

- **Home** — Hero, products, recent purchases
- **Products** — Browse by category
- **Product pages** — Details and checkout
- **About** — Company info

## Setup

1. Copy `.env.example` to `.env` and add your Tebex credentials from [creator.tebex.io/developers/api-keys](https://creator.tebex.io/developers/api-keys):
   - `VITE_TEBEX_PUBLIC_TOKEN` — your public store token
   - `TEBEX_PRIVATE_KEY` — your **private** API key (required for checkout; never expose in frontend)

2. Install and run **both** the frontend and API server:
   ```bash
   npm install
   npm run dev:full
   ```
   This runs the Vite dev server and the checkout API. **Add to Cart will fail if the API server is not running.**

3. Frontend: http://localhost:5173 — API: http://localhost:3001
