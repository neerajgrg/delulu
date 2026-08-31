# ── Stage 1: Build Web Client ─────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build:vite

# ── Stage 2: Production Lightweight Web Host ──────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5174
ENV HOST=0.0.0.0

# Copy built assets and server runner
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/package.json ./package.json

EXPOSE 5174

CMD ["node", "server.js"]
