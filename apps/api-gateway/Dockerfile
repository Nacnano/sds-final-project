# Stage 1: Development and Build
FROM node:20-alpine AS development

# Install pnpm and then all dependencies
RUN npm install -g pnpm@9.0.6

WORKDIR /app

# Copy all package files
COPY package.json pnpm-lock.yaml ./
COPY nest-cli.json ./
COPY tsconfig*.json ./

# Install ALL dependencies, including devDependencies, which are needed for the build.
RUN pnpm install --frozen-lockfile

# Copy source code and build the application
COPY apps/api-gateway ./apps/api-gateway/
COPY libs/ ./libs/
COPY proto/ ./proto/

# Build the application using the installed NestJS CLI
RUN pnpm run build api-gateway

# -----------------------------------------------------------------------------

# Stage 2: Production
FROM node:20-alpine AS production

# Install pnpm for production dependencies only
RUN npm install -g pnpm@9.0.6

WORKDIR /app

# Copy only the necessary production package files
COPY package.json pnpm-lock.yaml ./

# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy the built application from the 'development' stage
COPY --from=development /app/dist/apps/api-gateway ./dist/
COPY --from=development /app/proto ./proto/

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Change ownership of the app directory
RUN chown -R nestjs:nodejs /app
USER nestjs

EXPOSE 3000

CMD ["node", "dist/main.js"]