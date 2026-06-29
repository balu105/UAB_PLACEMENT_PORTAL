# Stage 1: Build environment
FROM node:24-alpine AS builder
WORKDIR /app

# Install dependencies first (leverage Docker layers caching)
COPY package*.json ./
RUN npm ci

# Copy source and configurations
COPY . .

# Generate Prisma Client targets
RUN npx prisma generate

# Build Next.js production bundles
RUN npm run build

# Stage 2: Runtime environment
FROM node:24-alpine AS runner
WORKDIR /app

# Set production context
ENV NODE_ENV=production
ENV PORT=3000

# Copy necessary assets from build stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

# Start server
CMD ["npm", "run", "start"]
