# Stage 1: Development and Build
FROM node:20-alpine AS development

# Install pnpm
RUN npm install -g pnpm@9

WORKDIR /app

# Copy base config files
COPY package.json pnpm-lock.yaml ./ 
COPY nest-cli.json ./ 
COPY tsconfig*.json ./ 

# Install all dependencies (including devDeps for build)
RUN pnpm install --frozen-lockfile

# Copy service source code
COPY apps/user-service ./apps/user-service/
COPY libs/ ./libs/
COPY proto/ ./proto/

# Build only the user-service
RUN pnpm run build user-service

# ------------------------------------------------------------------------------

# Stage 2: Production
FROM node:20-alpine AS production

# Install pnpm for production dependencies
RUN npm install -g pnpm@9

WORKDIR /app

# Copy only production package files
COPY package.json pnpm-lock.yaml ./ 

# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy built code from previous stage
COPY --from=development /app/dist/apps/user-service ./dist/
COPY --from=development /app/proto ./proto/

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Set permissions
RUN chown -R nestjs:nodejs /app
USER nestjs

# Expose service port (change if needed)
EXPOSE 5003

CMD ["node", "dist/main.js"]
