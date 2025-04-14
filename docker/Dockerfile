# 1. Install dependencies only when needed
FROM node:18-alpine AS deps
WORKDIR /app

# Install Prisma Client (important for runtime)
COPY package.json package-lock.json ./
RUN npm ci

# 2. Build the app with Prisma & Next.js
FROM node:18-alpine AS builder
WORKDIR /app

COPY . .
COPY --from=deps /app/node_modules ./node_modules

# Generate Prisma client
RUN npx prisma generate

# Build the app
RUN npm run build

# 3. Final image
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy the built app + node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

# Include the Prisma client
RUN npx prisma generate

# Expose port and run
EXPOSE 3000
CMD ["npm", "start"]
