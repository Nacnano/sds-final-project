# Stage 1: Development and Build
FROM node:20-alpine AS development

# Install pnpm. NestJS CLI should be a devDependency in package.json
RUN npm install -g pnpm@9

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY nest-cli.json ./
COPY tsconfig*.json ./

# Install ALL dependencies, including devDependencies for the build step.
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/shrine-service ./apps/shrine-service/
COPY libs/ ./libs/
COPY proto/ ./proto/

# Build the application
RUN pnpm run build shrine-service

# -----------------------------------------------------------------------------

# Stage 2: Production
FROM node:20-alpine AS production

# Install pnpm for production dependencies only
RUN npm install -g pnpm@9

WORKDIR /app

# Copy only the necessary production package files
COPY package.json pnpm-lock.yaml ./

# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy the built application from the 'development' stage
COPY --from=development /app/dist/apps/shrine-service ./dist/
COPY --from=development /app/proto ./proto/

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Change ownership of the app directory
RUN chown -R nestjs:nodejs /app
USER nestjs

EXPOSE 5001

CMD ["node", "dist/main.js"]