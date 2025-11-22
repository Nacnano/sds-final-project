# Service Deployment Guide

## Your Configuration

- **Master IP**: 192.168.0.103 (your computer)
- **Worker IPs**: 192.168.0.100, 192.168.0.102, 192.168.0.104, 192.168.0.105
- **Registry**: 192.168.0.103:5000
- **User**: warissara

## Deployment Workflow

### 1. Setup Infrastructure (Terraform)

```bash
cd terraform
terraform init
terraform plan
terraform apply
```

This will:

- Install K3s master on your computer (192.168.0.103)
- Configure 4 Raspberry Pis as worker nodes
- Setup Docker registry on port 5000

### 2. Build ARM Images

#### Option A: WSL/Linux

```bash
cd k8s
./build-arm.sh
```

#### Option B: PowerShell

```powershell
cd k8s
.\build-arm.ps1
```

This will:

- Build Docker images for ARM architecture (Raspberry Pi)
- Push images to local registry (192.168.0.103:5000)

### 3. Deploy Services

#### Option A: WSL/Linux (Recommended)

```bash
cd k8s
./deploy-pi.sh
```

#### Option B: PowerShell

```powershell
cd k8s
.\deploy-pi.ps1
```

This will deploy:

1. Namespace (microservices)
2. Secrets and ConfigMaps
3. Databases (PostgreSQL, RabbitMQ)
4. Location Service
5. Shrine Service
6. API Gateway + Frontend

## Access Your Application

- **Frontend**: http://192.168.0.103:30002
- **API Gateway**: http://192.168.0.103:30000
- **Test API**:
  ```bash
  curl http://192.168.0.103:30000/shrines
  ```

## Monitoring

### Check Pod Status

```bash
kubectl get pods -n microservices
```

### Watch Deployment Progress

```bash
kubectl get pods -n microservices -w
```

### View Logs

```bash
# API Gateway
kubectl logs -n microservices -l app=api-gateway -f

# Shrine Service
kubectl logs -n microservices -l app=shrine-service -f

# Location Service
kubectl logs -n microservices -l app=location-service -f
```

### Check Services

```bash
kubectl get svc -n microservices
```

### Check Nodes

```bash
kubectl get nodes -o wide
```

## Troubleshooting

### Images not pulling

```bash
# Check registry
curl http://192.168.0.103:5000/v2/_catalog

# Rebuild and push images
cd k8s
./build-arm.sh
```

### Pods not starting

```bash
# Describe pod
kubectl describe pod -n microservices <pod-name>

# Check events
kubectl get events -n microservices --sort-by='.lastTimestamp'
```

### Database connection issues

```bash
# Check database pods
kubectl get pods -n microservices -l app=shrine-db
kubectl logs -n microservices -l app=shrine-db

# Check secrets
kubectl get secrets -n microservices
```

## Clean Up

### Delete all services

```bash
cd k8s
kubectl delete namespace microservices
```

### Destroy infrastructure

```bash
cd terraform
terraform destroy
```

## Quick Commands

```bash
# Full deployment from scratch
cd terraform && terraform apply -auto-approve
cd ../k8s && ./build-arm.sh && ./deploy-pi.sh

# Redeploy services only
cd k8s && ./deploy-pi.sh

# Rebuild and redeploy
cd k8s && ./build-arm.sh && ./deploy-pi.sh

# Check everything
kubectl get all -n microservices
```
