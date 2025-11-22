# Kubernetes Deployment Guide

This directory contains Kubernetes manifests for deploying the microservices application on a local Docker Desktop Kubernetes cluster.

## Architecture

The application consists of:

### Databases

- **shrine-db**: PostgreSQL database for shrine service (Port: 5432)
- **user-db**: PostgreSQL database for user service (Port: 5432)
- **wishing-db**: PostgreSQL database for wishing service (Port: 5432)
- **rating-db**: PostgreSQL database for rating service (Port: 5432)
- **rabbitmq**: Message broker (AMQP: 5672, Management: 15672)

### Microservices

- **shrine-service**: Shrine management service (gRPC Port: 5001)
- **technique-service**: Technique management service (gRPC Port: 5002)
- **shrine-discovery-service**: Shrine discovery service (gRPC Port: 5003)
- **wishing-service**: Wishing management service (gRPC Port: 5004)
- **user-service**: User authentication service (gRPC Port: 5005)
- **location-service**: Location validation service (gRPC Port: 5006)
- **rating-service**: Rating and review service (gRPC Port: 5007)
- **api-gateway**: HTTP REST API Gateway (Port: 3000, NodePort: 30000)

### Management Tools

- **pgadmin**: PostgreSQL admin interface (Port: 80, NodePort: 30080)

## Prerequisites

1. **Docker Desktop** with Kubernetes enabled
2. **kubectl** CLI tool installed
3. All Docker images built locally

## Step 1: Build Docker Images

Before deploying to Kubernetes, build all Docker images:

```powershell
# Build all images using docker-compose
docker-compose build

# Tag images for Kubernetes (if needed)
docker tag microservice-api-gateway:latest api-gateway:latest
docker tag microservice-shrine-service:latest shrine-service:latest
docker tag microservice-user-service:latest user-service:latest
docker tag microservice-technique-service:latest technique-service:latest
docker tag microservice-shrine-discovery-service:latest shrine-discovery-service:latest
docker tag microservice-wishing-service:latest wishing-service:latest
```

## Step 2: Update Secrets

Edit `k8s/secrets.yaml` and update the following values:

- `JWT_SECRET`: Your JWT secret key
- `GOOGLE_CLIENT_ID`: Your Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Your Google OAuth client secret
- `GOOGLE_CALLBACK_URL`: Your Google OAuth callback URL
- Database passwords (if needed)

## Step 3: Deploy to Kubernetes

### Option A: Use the deployment script (Recommended)

```powershell
.\k8s\deploy.ps1
```

### Option B: Manual deployment

```powershell
# 1. Create namespace
kubectl apply -f k8s/namespace.yaml

# 2. Create ConfigMap and Secrets
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml

# 3. Deploy databases
kubectl apply -f k8s/shrine-db.yaml
kubectl apply -f k8s/user-db.yaml
kubectl apply -f k8s/wishing-db.yaml
kubectl apply -f k8s/rating-db.yaml

# 4. Deploy RabbitMQ
kubectl apply -f k8s/rabbitmq.yaml

# Wait for databases to be ready (30-60 seconds)
Start-Sleep -Seconds 30

# 5. Deploy microservices
kubectl apply -f k8s/shrine-service.yaml
kubectl apply -f k8s/user-service.yaml
kubectl apply -f k8s/technique-service.yaml
kubectl apply -f k8s/location-service.yaml
kubectl apply -f k8s/rating-service.yaml
kubectl apply -f k8s/shrine-discovery-service.yaml
kubectl apply -f k8s/wishing-service.yaml

# Wait for services to be ready
Start-Sleep -Seconds 20

# 6. Deploy API Gateway
kubectl apply -f k8s/api-gateway.yaml

# 7. Deploy pgAdmin (optional)
kubectl apply -f k8s/pgadmin.yaml
```

## Step 4: Verify Deployment

```powershell
# Check all resources
kubectl get all -n microservices

# Check pods status
kubectl get pods -n microservices

# Check services
kubectl get svc -n microservices

# Check persistent volume claims
kubectl get pvc -n microservices
```

## Step 5: Seed Databases

After deploying the services, you can seed the databases with test data:

### Option A: Use the pnpm script (Recommended)

```powershell
pnpm k8s:seed
```

### Option B: Use the script directly

```powershell
.\k8s\seed.ps1
```

This will:
- Connect to a running service pod
- Copy the seed script into the pod
- Execute the seed script to populate all databases with:
  - 10 shrines
  - 5 users (password: `password123`)
  - 6 wishes
  - 10 ratings

**Test User Credentials:**
- Email: `john.doe@example.com`
- Password: `password123`

## Accessing Services

- **API Gateway**: http://localhost:30000
- **pgAdmin**: http://localhost:30080
  - Email: admin@example.com
  - Password: admin

## Useful Commands

### View logs

```powershell
# View logs for a specific pod
kubectl logs -n microservices <pod-name>

# Follow logs
kubectl logs -n microservices -f <pod-name>

# View logs for all pods of a service
kubectl logs -n microservices -l app=api-gateway
```

### Debugging

```powershell
# Describe a pod
kubectl describe pod -n microservices <pod-name>

# Execute command in a pod
kubectl exec -n microservices -it <pod-name> -- /bin/sh

# Port forward to a service
kubectl port-forward -n microservices svc/api-gateway 3000:3000
```

### Scaling

```powershell
# Scale a deployment
kubectl scale deployment -n microservices api-gateway --replicas=3
```

### Restart services

```powershell
# Restart a deployment
kubectl rollout restart deployment -n microservices api-gateway
```

## Cleanup

### Option A: Use the cleanup script

```powershell
.\k8s\delete.ps1
```

### Option B: Manual cleanup

```powershell
# Delete all resources
kubectl delete -f k8s/

# Or delete the entire namespace
kubectl delete namespace microservices
```

## Troubleshooting

### Pods not starting

```powershell
# Check pod events
kubectl describe pod -n microservices <pod-name>

# Check logs
kubectl logs -n microservices <pod-name>
```

### Image pull errors

The manifests use `imagePullPolicy: Never` for local Docker images. Make sure:

1. Docker images are built locally
2. Images have the correct names and tags
3. Kubernetes is using the same Docker daemon

### Database connection issues

```powershell
# Check if databases are running
kubectl get pods -n microservices | grep db

# Test database connectivity
kubectl exec -n microservices -it <service-pod> -- /bin/sh
# Then try to connect to the database
```

### Service discovery issues

Make sure all services are deployed and running:

```powershell
kubectl get svc -n microservices
```

## Configuration

### Environment Variables

Environment variables are managed through:

- **ConfigMap** (`k8s/configmap.yaml`): Non-sensitive configuration
- **Secrets** (`k8s/secrets.yaml`): Sensitive data (passwords, keys)

### Persistent Storage

Each database uses a PersistentVolumeClaim (PVC) for data storage:

- `shrine-db-pvc`: 1Gi
- `user-db-pvc`: 1Gi
- `wishing-db-pvc`: 1Gi
- `rating-db-pvc`: 1Gi

Data persists even if pods are deleted, but will be lost if PVCs are deleted.

## Resource Limits

Each service has resource requests and limits defined:

- **Requests**: 256Mi memory, 250m CPU
- **Limits**: 512Mi memory, 500m CPU

Adjust these values in the deployment files based on your needs.

## Notes

- This configuration is optimized for local development with Docker Desktop
- For production, consider:
  - Using external databases
  - Implementing proper ingress controllers
  - Adding health checks and readiness probes
  - Implementing horizontal pod autoscaling
  - Using secrets management solutions (e.g., Vault)
  - Setting up monitoring and logging
