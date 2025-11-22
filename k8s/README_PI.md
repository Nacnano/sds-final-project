# Kubernetes Manifests for Raspberry Pi Deployment

This directory contains updated Kubernetes manifests optimized for Raspberry Pi deployment.

## Changes from Original Deployment

### 1. Image Configuration

- **Changed**: `imagePullPolicy: Never` → `imagePullPolicy: Always`
- **Changed**: `image: <service>:latest` → `image: 192.168.1.10:5000/<service>:latest`
- **Reason**: Pull images from local Docker registry accessible to all Pis

### 2. Resource Limits (Reduced for Raspberry Pi 3 B+)

**Before** (per pod):

```yaml
resources:
  requests:
    memory: '256Mi'
    cpu: '250m'
  limits:
    memory: '512Mi'
    cpu: '500m'
```

**After** (per pod):

```yaml
resources:
  requests:
    memory: '128Mi' # Reduced from 256Mi
    cpu: '100m' # Reduced from 250m
  limits:
    memory: '256Mi' # Reduced from 512Mi
    cpu: '300m' # Reduced from 500m
```

**Reasoning**:

- Raspberry Pi 3 B+ has only 1GB RAM
- 4 Pis = 4GB total cluster RAM
- With ~3-5 pods per service × 3 services = ~15-20 pods total
- Need to leave headroom for system pods (kube-proxy, flannel, etc.)
- Each pod needs maximum 256Mi = ~4-5 GB if all pods at limit (tight but workable)

### 3. HPA Adjustments

**Before**:

```yaml
minReplicas: 1
maxReplicas: 10
```

**After**:

```yaml
minReplicas: 1
maxReplicas: 3
```

**Reason**: Pi cluster can't handle 10 replicas per service (would need 30+ pods)

### 4. Anti-Affinity Rules

Added to all services to spread pods across nodes for better fault tolerance:

```yaml
affinity:
  podAntiAffinity:
    preferredDuringSchedulingIgnoredDuringExecution:
      - weight: 100
        podAffinityTerm:
          labelSelector:
            matchExpressions:
              - key: app
                operator: In
                values:
                  - <service-name>
          topologyKey: kubernetes.io/hostname
```

### 5. Database Node Affinity

Shrine-db pinned to specific node to ensure data persistence:

```yaml
nodeSelector:
  demo-role: database
```

## File Structure

```
k8s/
├── namespace.yaml                    # Unchanged
├── configmap.yaml                    # Update registry URLs if needed
├── secrets.yaml                      # Unchanged (don't commit real secrets!)
├── shrine-db.yaml                    # Added nodeSelector
├── rabbitmq.yaml                     # Reduced resources
├── shrine-service.yaml               # Updated for Pi
├── location-service.yaml             # Updated for Pi
├── api-gateway.yaml                  # Updated for Pi
├── pgadmin.yaml                      # Optional (can skip for demo)
├── build-arm.ps1                     # NEW: Build ARM images (Windows)
├── build-arm.sh                      # NEW: Build ARM images (Linux/Mac)
├── deploy-pi.ps1                     # NEW: Deploy to Pi cluster
├── RASPBERRY_PI_SETUP.md             # NEW: Cluster setup guide
└── DEMO_SCRIPT.md                    # NEW: Demo instructions
```

## Deployment Instructions

### Step 1: Update Configuration

Edit these files and replace `192.168.1.10` with your actual master node IP:

- `build-arm.ps1` or `build-arm.sh`
- All YAML files in this directory (if you use hardcoded registry)
- Or use `configmap.yaml` to centralize configuration

### Step 2: Build ARM Images

**On Windows:**

```powershell
.\k8s\build-arm.ps1
```

**On Linux/Mac:**

```bash
chmod +x k8s/build-arm.sh
./k8s/build-arm.sh
```

This will:

1. Build multi-architecture images for ARM (linux/arm/v7)
2. Push images to your local Docker registry (192.168.1.10:5000)
3. Verify images are available

### Step 3: Deploy to Kubernetes

```powershell
# Deploy in order
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml

# Deploy databases
kubectl apply -f k8s/shrine-db.yaml
kubectl apply -f k8s/rabbitmq.yaml

# Wait for databases
Start-Sleep -Seconds 30

# Deploy microservices
kubectl apply -f k8s/shrine-service.yaml
kubectl apply -f k8s/location-service.yaml

# Wait for services
Start-Sleep -Seconds 20

# Deploy API Gateway
kubectl apply -f k8s/api-gateway.yaml

# Check status
kubectl get all -n microservices
```

### Step 4: Verify Deployment

```bash
# Check all pods are running
kubectl get pods -n microservices -o wide

# Check node distribution
kubectl get pods -n microservices -o wide | grep -E "NAME|api-gateway|shrine|location"

# Test API
curl http://192.168.1.10:30000/health

# Test frontend
# Open browser: http://192.168.1.10:30002
```

## Resource Calculations

### Per-Service Resource Usage (with 1 replica)

| Service          | Memory Request | Memory Limit | CPU Request | CPU Limit |
| ---------------- | -------------- | ------------ | ----------- | --------- |
| API Gateway      | 128Mi          | 256Mi        | 100m        | 300m      |
| Shrine Service   | 128Mi          | 256Mi        | 100m        | 300m      |
| Location Service | 128Mi          | 256Mi        | 100m        | 300m      |
| Shrine DB        | 256Mi          | 512Mi        | 250m        | 500m      |
| RabbitMQ         | 256Mi          | 512Mi        | 250m        | 500m      |

### Total with Minimum Replicas (API Gateway: 3, Location: 3, Shrine: 1)

- **Total Memory Requests**: ~1.2 GB
- **Total Memory Limits**: ~2.5 GB (if all hit limits simultaneously)
- **Total CPU Requests**: ~1.1 cores
- **Total CPU Limits**: ~3 cores

### Raspberry Pi Cluster Resources (4 Pis)

- **Total RAM**: 4 GB
- **Total CPU**: 16 cores (4 × 4-core ARM)
- **Usable RAM**: ~3.2 GB (after system overhead)
- **Usable CPU**: ~14 cores (after system pods)

**Result**: Should fit comfortably with room for scaling! ✓

## Troubleshooting

### Pods stuck in "Pending"

```bash
# Check events
kubectl describe pod <pod-name> -n microservices

# Common causes:
# 1. Insufficient resources → reduce requests
# 2. Image pull error → verify registry accessibility
# 3. Node selector mismatch → check node labels
```

### Pods stuck in "ImagePullBackOff"

```bash
# Verify registry is accessible from Pi
ssh ubuntu@192.168.1.11
docker pull 192.168.1.10:5000/shrine-service:latest

# Check /etc/docker/daemon.json has insecure-registries

# Push image again from master
docker push 192.168.1.10:5000/shrine-service:latest
```

### High CPU/Memory usage

```bash
# Check resource usage
kubectl top nodes
kubectl top pods -n microservices

# Reduce replicas if needed
kubectl scale deployment api-gateway --replicas=2 -n microservices

# Or reduce HPA max
kubectl patch hpa api-gateway-hpa -n microservices -p '{"spec":{"maxReplicas":2}}'
```

### Database pod won't start

```bash
# Check if PersistentVolume is bound
kubectl get pv,pvc -n microservices

# Check node has enough disk space
ssh ubuntu@192.168.1.11
df -h

# Delete and recreate if needed
kubectl delete -f k8s/shrine-db.yaml
kubectl apply -f k8s/shrine-db.yaml
```

## Performance Optimization Tips

1. **Pre-pull images on all Pis before demo**:

   ```bash
   # On each Pi
   docker pull 192.168.1.10:5000/shrine-service:latest
   docker pull 192.168.1.10:5000/location-service:latest
   docker pull 192.168.1.10:5000/api-gateway:latest
   docker pull 192.168.1.10:5000/frontend:latest
   ```

2. **Pre-seed database before demo**:

   ```bash
   kubectl exec -it <shrine-db-pod> -n microservices -- psql -U postgres -d shrine_service
   # Run seed SQL
   ```

3. **Warm up services**:

   ```bash
   # Make a few requests to ensure all services are responding
   for i in {1..5}; do curl http://192.168.1.10:30000/shrines; done
   ```

4. **Disable HPA during demo** (optional, for predictability):
   ```bash
   kubectl delete hpa --all -n microservices
   # Manually set replicas
   kubectl scale deployment api-gateway --replicas=3 -n microservices
   kubectl scale deployment location-service --replicas=2 -n microservices
   ```

## Access Points

After successful deployment:

- **Frontend**: http://192.168.1.10:30002 (or your master IP)
- **API Gateway**: http://192.168.1.10:30000
- **pgAdmin**: http://192.168.1.10:30080 (optional)
- **RabbitMQ Management**: http://192.168.1.10:30672 (optional)

## Next Steps

1. Follow `RASPBERRY_PI_SETUP.md` to set up your cluster
2. Use `build-arm.ps1` to build images
3. Deploy with commands above
4. Practice with `DEMO_SCRIPT.md`
5. Test fault tolerance multiple times before demo day!

Good luck! 🚀
