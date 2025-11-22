# Kubernetes Deployment Summary

## What Was Created

This repository includes a Kubernetes-ready deployment for the shrine discovery microservices platform.

### 1. Kubernetes Manifests (k8s/ directory)

**Core Configuration:**

- `namespace.yaml` - Creates the 'microservices' namespace
- `configmap.yaml` - Non-sensitive configuration (URLs, ports, etc.)
- `secrets.yaml` - Sensitive data (passwords, database credentials)

**Database Deployments:**

- `shrine-db.yaml` - PostgreSQL for Shrine Service with persistent volume
- `rabbitmq.yaml` - RabbitMQ message broker

**Microservice Deployments:**

- `shrine-service.yaml` - Shrine management service (gRPC Port: 5001)
- `location-service.yaml` - Location validation service (gRPC Port: 5007)
- `api-gateway.yaml` - High-availability gateway with:
  - API Gateway Deployment (3 replicas + HPA, NodePort: 30000)
  - Frontend SPA Deployment (2 replicas + HPA, NodePort: 30002)
  - Readiness/liveness probes and autoscaling

**Management & Tooling:**

- `pgadmin.yaml` - PostgreSQL admin interface (NodePort: 30080)

### 2. Deployment Scripts

- `build.ps1` - Builds Docker images for all services
- `deploy.ps1` - Deploys all services in the correct order
- `delete.ps1` - Removes all Kubernetes resources
- `README.md` - Comprehensive deployment guide

## Architecture Overview

```text
┌─────────────────────────────────────────────────────────────┐
│                    Kubernetes Cluster                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │          Namespace: microservices                      │ │
│  │                                                        │ │
│  │  ┌──────────────┐          ┌────────────────────────┐│ │
│  │  │              │          │    Databases           ││ │
│  │  │ API Gateway  │◄─────────┤  - shrine-db (PG)     ││ │
│  │  │  (NodePort   │          │  - rabbitmq           ││ │
│  │  │   30000)     │          └────────────────────────┘│ │
│  │  └──────┬───────┘                                     │ │
│  │         │                                             │ │
│  │    ┌────┴─────────────────┐                          │ │
│  │    │                      │                          │ │
│  │  ┌─▼──────────┐  ┌───────▼──────┐                   │ │
│  │  │   Shrine   │  │   Location   │                   │ │
│  │  │  Service   │  │   Service    │                   │ │
│  │  │  :5001     │  │   :5007      │                   │ │
│  │  └────────────┘  └──────────────┘                   │ │
│  │                                                      │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────┐│ │
│  │  │  RabbitMQ    │  │   pgAdmin    │  │ Frontend   ││ │
│  │  │  :5672       │  │  (NodePort   │  │ (NodePort  ││ │
│  │  │  :15672      │  │   30080)     │  │ 30002)     ││ │
│  │  └──────────────┘  └──────────────┘  └────────────┘│ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Current Status

✅ **All services deployed successfully**

### Services Running

1. **shrine-db** - PostgreSQL database
2. **rabbitmq** - Message broker
3. **shrine-service** - Core shrine management (1 replica)
4. **location-service** - Location and distance calculations (1 replica)
5. **api-gateway** - REST API gateway (3 replicas with HPA)
6. **frontend** - React SPA (2 replicas with HPA)
7. **pgadmin** - Database administration tool (1 replica)

### Access Points

- **Frontend**: http://localhost:30002
- **API Gateway**: http://localhost:30000
- **pgAdmin**: http://localhost:30080 (admin@example.com / admin)
- **RabbitMQ Management**: http://localhost:30672 (guest / guest)

## Quick Start

### Prerequisites

- Docker Desktop with Kubernetes enabled
- kubectl CLI tool installed
- PowerShell

### Deploy to Kubernetes

```powershell
# Navigate to k8s directory
cd k8s

# Build all Docker images
.\build.ps1

# Deploy all services
.\deploy.ps1

# Verify deployment
kubectl get pods -n microservices
kubectl get services -n microservices
```

### Check Status

```powershell
# View all pods
kubectl get pods -n microservices

# View services
kubectl get svc -n microservices

# Check logs for a specific service
kubectl logs -n microservices -l app=shrine-service
kubectl logs -n microservices -l app=api-gateway
```

### Seed Database

```powershell
# Get the shrine-db pod name
kubectl get pods -n microservices | findstr shrine-db

# Copy seed script to pod
kubectl cp ../tools/scripts/seed-all-databases.js microservices/shrine-db-xxxxx:/tmp/

# Install dependencies and run seed
kubectl exec -it -n microservices shrine-db-xxxxx -- bash
npm install pg
node /tmp/seed-all-databases.js
```

### Clean Up

```powershell
# Remove all resources
cd k8s
.\delete.ps1

# Or manually
kubectl delete namespace microservices
```

## High Availability Features

### API Gateway

- **3 replicas** for redundancy
- **Horizontal Pod Autoscaler (HPA)**: Scales 3-10 replicas based on CPU (70%)
- **Pod Disruption Budget (PDB)**: Minimum 2 replicas available during updates
- **Anti-affinity rules**: Pods spread across nodes
- **Health checks**: Readiness and liveness probes

### Frontend

- **2 replicas** for redundancy
- **HPA**: Scales 2-5 replicas based on CPU (70%)
- **PDB**: Minimum 1 replica available
- **nginx server** for efficient static file serving

## Troubleshooting

### Pods Not Starting

```powershell
# Check pod status
kubectl get pods -n microservices

# Describe pod for details
kubectl describe pod <pod-name> -n microservices

# Check logs
kubectl logs <pod-name> -n microservices
```

### Database Connection Issues

```powershell
# Check if shrine-db is running
kubectl get pods -n microservices | findstr shrine-db

# Check database logs
kubectl logs -n microservices <shrine-db-pod-name>

# Test connection
kubectl exec -it -n microservices <shrine-db-pod-name> -- psql -U postgres -d shrine_service
```

### Service Not Accessible

```powershell
# Check service endpoints
kubectl get svc -n microservices

# Check if NodePort is exposed
kubectl describe svc api-gateway-service -n microservices

# Test from inside cluster
kubectl run test --rm -it --image=busybox -n microservices -- sh
wget -O- http://api-gateway-service:3000/health
```

### Image Pull Errors

```powershell
# Rebuild images
cd k8s
.\build.ps1

# Verify images exist locally
docker images | findstr "shrine\|api-gateway\|frontend"

# Delete pod to force image pull
kubectl delete pod <pod-name> -n microservices
```

## Scaling Services

### Manual Scaling

```powershell
# Scale shrine-service to 3 replicas
kubectl scale deployment shrine-service -n microservices --replicas=3

# Scale api-gateway
kubectl scale deployment api-gateway -n microservices --replicas=5
```

### Auto-scaling (HPA)

The API Gateway and Frontend already have HPA configured:

```powershell
# Check HPA status
kubectl get hpa -n microservices

# Describe HPA for details
kubectl describe hpa api-gateway-hpa -n microservices
```

## Resource Usage

### View Resource Consumption

```powershell
# Pod resource usage
kubectl top pods -n microservices

# Node resource usage
kubectl top nodes
```

### Resource Limits

Each service has defined resource limits:

- **API Gateway**: 500m CPU, 512Mi memory
- **Frontend**: 200m CPU, 256Mi memory
- **Shrine Service**: 300m CPU, 512Mi memory
- **Location Service**: 200m CPU, 256Mi memory

## Updates and Rollbacks

### Update Service Image

```powershell
# Rebuild image
cd k8s
.\build.ps1

# Restart deployment to use new image
kubectl rollout restart deployment/shrine-service -n microservices

# Monitor rollout
kubectl rollout status deployment/shrine-service -n microservices
```

### Rollback Deployment

```powershell
# View rollout history
kubectl rollout history deployment/shrine-service -n microservices

# Rollback to previous version
kubectl rollout undo deployment/shrine-service -n microservices

# Rollback to specific revision
kubectl rollout undo deployment/shrine-service -n microservices --to-revision=2
```

## Configuration Management

### Update ConfigMap

```powershell
# Edit configmap
kubectl edit configmap app-config -n microservices

# Or apply updated file
kubectl apply -f configmap.yaml

# Restart pods to use new config
kubectl rollout restart deployment/api-gateway -n microservices
```

### Update Secrets

```powershell
# Edit secrets
kubectl edit secret app-secrets -n microservices

# Or recreate
kubectl delete secret app-secrets -n microservices
kubectl apply -f secrets.yaml
```

## Monitoring

### View Logs

```powershell
# Follow logs from a deployment
kubectl logs -f -n microservices -l app=api-gateway

# View logs from all containers in a pod
kubectl logs -n microservices <pod-name> --all-containers=true

# View previous container logs (if crashed)
kubectl logs -n microservices <pod-name> --previous
```

### Events

```powershell
# View cluster events
kubectl get events -n microservices --sort-by='.lastTimestamp'

# Watch events in real-time
kubectl get events -n microservices --watch
```

## Best Practices

1. **Always use the deployment scripts** (`build.ps1`, `deploy.ps1`) for consistency
2. **Monitor resource usage** to adjust HPA thresholds
3. **Keep secrets secure** - never commit `secrets.yaml` with real credentials
4. **Test changes locally** before deploying to production
5. **Use labels** for easy resource management
6. **Document changes** in ConfigMaps and deployment manifests

## Additional Resources

- Kubernetes Documentation: https://kubernetes.io/docs/
- kubectl Cheat Sheet: https://kubernetes.io/docs/reference/kubectl/cheatsheet/
- Docker Best Practices: https://docs.docker.com/develop/dev-best-practices/
- NestJS Microservices: https://docs.nestjs.com/microservices/basics

## Support

For issues or questions:

- Check the k8s/README.md for detailed deployment steps
- Review DEVELOPMENT.md for local development
- See TESTING_GUIDE.md for testing procedures
