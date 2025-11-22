# syntax=docker/dockerfile:1

FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package.json ./
RUN npm install

# Copy source and build assets
COPY . .
ARG VITE_API_URL=http://localhost:30000
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

FROM nginx:1.27-alpine

# Copy your custom Nginx configuration file to the correct location
# It will override the default Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built React assets
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
