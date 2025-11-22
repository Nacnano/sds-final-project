# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./

# Install pnpm
RUN npm install -g pnpm

# Copy necessary source files
COPY tsconfig.json ./
COPY tsconfig.build.json ./
COPY nest-cli.json ./
COPY apps/rating-service ./apps/rating-service
COPY libs ./libs
COPY proto ./proto

# Install dependencies
RUN pnpm install

# Build the application
RUN pnpm run build rating-service

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./

# Install production dependencies only
RUN pnpm install --prod

# Copy built application from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/proto ./proto

# Expose port
EXPOSE 5006

# Start the application
CMD ["node", "dist/apps/rating-service/main.js"]
