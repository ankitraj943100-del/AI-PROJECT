FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files
COPY backend/package*.json ./backend/
RUN cd backend && npm ci

# Copy source code and build backend
COPY backend/ ./backend/
RUN cd backend && npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY backend/package*.json ./backend/
RUN cd backend && npm ci --only=production
COPY --from=builder /app/backend/dist ./backend/dist

EXPOSE 5000
CMD ["node", "backend/dist/server.js"]
