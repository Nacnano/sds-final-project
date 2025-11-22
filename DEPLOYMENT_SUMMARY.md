# Kubernetes Deployment Summary

## What Was Created

This repo now ships a full Kubernetes-ready stack for the shrine microservices platform, including the high-availability gateway and frontend bundle you've been testing locally.

### 1. Kubernetes Manifests (k8s/ directory)

**Core Configuration:**

- `namespace.yaml` - Creates the 'microservices' namespace
- `configmap.yaml` - Non-sensitive configuration (URLs, ports, etc.)
- `secrets.yaml` - Sensitive data (passwords, JWT secrets, OAuth credentials)

**Database Deployments:**

- `shrine-db.yaml` - PostgreSQL for Shrine Service with PVC
- `user-db.yaml` - PostgreSQL for User Service with PVC
- `wishing-db.yaml` - PostgreSQL for Wishing Service with PVC
- `rating-db.yaml` - PostgreSQL for Rating Service with PVC
- `rabbitmq.yaml` - RabbitMQ message broker

**Microservice Deployments:**

- `shrine-service.yaml` - Shrine management service (gRPC Port: 5001)
- `technique-service.yaml` - Technique management service (gRPC Port: 5002)
- `shrine-discovery-service.yaml` - Shrine discovery service (gRPC Port: 5003)
- `wishing-service.yaml` - Wishing management service (gRPC Port: 5004)
- `user-service.yaml` - User authentication service (gRPC Port: 5005)
- `location-service.yaml` - Location validation service (gRPC Port: 5006)
- `rating-service.yaml` - Rating and review service (gRPC Port: 5007)
- `api-gateway.yaml` - **High-availability** gateway bundle:
  - API Gateway Deployment (3 replicas + PDB + HPA, NodePort: 30000)
  - Frontend SPA Deployment (2 replicas + PDB + HPA, NodePort: 30002)
  - Anti-affinity, readiness/liveness probes, and autoscaling targets baked in

**Management & Tooling:**

- `pgadmin.yaml` - PostgreSQL admin interface (NodePort: 30080)

### 2. Deployment Scripts

- `build.ps1` - Builds Docker images and tags them for Kubernetes (now includes the frontend image and tags it as `frontend:latest`)
- `deploy.ps1` - Deploys all services in the correct order
- `delete.ps1` - Removes all Kubernetes resources
- `README.md` - Comprehensive guide for deployment and troubleshooting

### 3. Bug Fixes

- Fixed `nest-cli.json` - Missing closing brace after user-service configuration
- Trimmed unused frontend code so TypeScript builds cleanly inside the Docker image
- Consolidated the HA demo into the primary `api-gateway.yaml` manifest

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
│  │  │  (NodePort   │          │  - user-db (PG)       ││ │
│  │  │   30000)     │          │  - wishing-db (PG)    ││ │
│  │  │              │          │  - rating-db (PG)     ││ │
│  │  └──────┬───────┘          └────────────────────────┘│ │
│  │         │                                             │ │
│  │    ┌────┴─────────────────────────────┐              │ │
│  │    │                                  │              │ │
│  │  ┌─▼──────────┐  ┌──────────────┐ ┌─▼───────────┐  │ │
│  │  │   Shrine   │  │  Technique   │ │    User     │  │ │
│  │  │  Service   │  │   Service    │ │   Service   │  │ │
│  │  │  :5001     │  │   :5002      │ │   :5005     │  │ │
│  │  └────────────┘  └──────────────┘ └─────────────┘  │ │
│  │                                                      │ │
│  │  ┌──────────────┐  ┌──────────────┐                │ │
│  │  │ Shrine Disc. │  │   Wishing    │                │ │
│  │  │   Service    │  │   Service    │                │ │
│  │  │   :5003      │  │   :5004      │                │ │
│  │  └──────────────┘  └──────────────┘                │ │
│  │                                                      │ │
│  │  ┌──────────────┐  ┌──────────────┐                │ │
│  │  │  Location    │  │   Rating     │                │ │
│  │  │   Service    │  │   Service    │                │ │
│  │  │   :5006      │  │   :5007      │                │ │
│  │  └──────────────┘  └──────────────┘                │ │
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

### ✅ Completed

1. High-availability manifests merged into `k8s/api-gateway.yaml` (gateway + frontend + PDBs + HPAs)
2. Frontend Dockerfile added and wired into `k8s/build.ps1`
3. ConfigMap updated so OAuth flows return to the new NodePort frontend URL
4. Automated scripts (`build.ps1`, `deploy.ps1`, `delete.ps1`) now cover the entire stack
5. Docker build passes cleanly for every service, including the SPA

### ⚠️ Action Required

- **Secrets:** Update `k8s/secrets.yaml` with real JWT + Google OAuth credentials before sharing the cluster.
- **Metrics Server:** Install `metrics-server` in your Kubernetes cluster so the HPAs can react to CPU usage (without it, targets show `<unknown>`).

## Deployment Steps

Once Kubernetes is running:

### Option 1: Automated Deployment (Recommended)

```powershell
# Navigate to project directory
cd c:\Users\Vivobook\github\microservice

# Deploy everything
.\k8s\deploy.ps1
```

### Option 2: Manual Deployment

```powershell
# 1. Create namespace
kubectl apply -f k8s/namespace.yaml

# 2. Create configuration
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml

# 3. Deploy databases
kubectl apply -f k8s/shrine-db.yaml
kubectl apply -f k8s/user-db.yaml
kubectl apply -f k8s/wishing-db.yaml
kubectl apply -f k8s/rating-db.yaml
kubectl apply -f k8s/rabbitmq.yaml

# Wait 30 seconds for databases to start
Start-Sleep -Seconds 30

# 4. Deploy microservices
kubectl apply -f k8s/shrine-service.yaml
kubectl apply -f k8s/user-service.yaml
kubectl apply -f k8s/technique-service.yaml
kubectl apply -f k8s/location-service.yaml
kubectl apply -f k8s/rating-service.yaml
kubectl apply -f k8s/shrine-discovery-service.yaml
kubectl apply -f k8s/wishing-service.yaml

# Wait 20 seconds for services
Start-Sleep -Seconds 20

# 5. Deploy API Gateway + Frontend bundle and pgAdmin
kubectl apply -f k8s/api-gateway.yaml
kubectl apply -f k8s/pgadmin.yaml
```

## Verification

Check deployment status:

```powershell
# View all resources
kubectl get all -n microservices

# View pods
kubectl get pods -n microservices

# View services
kubectl get svc -n microservices

# View persistent volume claims
kubectl get pvc -n microservices
```

## Accessing Services

Once deployed:

- **API Gateway**: [http://localhost:30000](http://localhost:30000)
- **Frontend SPA**: [http://localhost:30002](http://localhost:30002)
- **pgAdmin**: [http://localhost:30080](http://localhost:30080)
  - Email: `admin@example.com`
  - Password: `admin`

## Useful Commands

### Logs

```powershell
# View logs for a specific pod
kubectl logs -n microservices <pod-name>

# Follow logs
kubectl logs -n microservices -f <pod-name>

# Logs for all pods of a service
kubectl logs -n microservices -l app=api-gateway
```

### Debugging

```powershell
# Describe a pod (shows events and errors)
kubectl describe pod -n microservices <pod-name>

# Execute command in a pod
kubectl exec -n microservices -it <pod-name> -- /bin/sh

# Port forward
kubectl port-forward -n microservices svc/api-gateway 3000:3000
```

### Management

```powershell
# Restart a deployment
kubectl rollout restart deployment -n microservices api-gateway
kubectl rollout restart deployment -n microservices frontend

# Scale a deployment
kubectl scale deployment -n microservices api-gateway --replicas=3
kubectl scale deployment -n microservices frontend --replicas=2
```

## Cleanup

To remove all deployed resources:

```powershell
.\k8s\delete.ps1
```

Or delete the entire namespace:

```powershell
kubectl delete namespace microservices
```

## Configuration Details

### Resource Allocation

Each service has:

- **Requests**: 256Mi memory, 250m CPU
- **Limits**: 512Mi memory, 500m CPU

### Persistent Storage

Each database has 1Gi persistent volume:

- shrine-db-pvc
- user-db-pvc
- wishing-db-pvc
- rating-db-pvc

### Image Pull Policy

Using `imagePullPolicy: Never` for local Docker images. This means:

- Images must be built locally first
- No pulling from remote registries
- Perfect for local development

## Next Steps

1. ✅ Enable Kubernetes in Docker Desktop (see KUBERNETES_SETUP.md)
2. ✅ Update secrets in `k8s/secrets.yaml`
3. ✅ Run deployment script: `.\k8s\deploy.ps1`
4. ✅ Verify deployment: `kubectl get all -n microservices`
5. ✅ Access API Gateway at [http://localhost:30000](http://localhost:30000)
6. ✅ Monitor logs: `kubectl logs -n microservices -l app=api-gateway`

## Troubleshooting

See `k8s/README.md` for detailed troubleshooting guide.

Common issues:

- **ImagePullBackOff**: Docker images not built - run `docker-compose build`
- **CrashLoopBackOff**: Check logs with `kubectl logs`
- **Pending Pods**: Check events with `kubectl describe pod`

## Production Considerations

Before deploying to production:

1. Change all default passwords
2. Use proper secrets management (e.g., Sealed Secrets, Vault)
3. Configure proper resource limits
4. Set up ingress controller
5. Enable health checks and readiness probes
6. Implement horizontal pod autoscaling
7. Set up monitoring (Prometheus, Grafana)
8. Configure proper backup strategies for databases
9. Use external managed databases for production
10. Implement proper logging and log aggregation

---

**Documentation Created**: November 4, 2025
**Author**: GitHub Copilot
**Project**: Microservices Architecture - Kubernetes Deployment
