# Files That Need Modification for Raspberry Pi Deployment

## Summary

This document lists all files that need to be modified or created to deploy the application on Raspberry Pi Kubernetes cluster for the SDS final project.

## ✅ Already Created (No Action Needed)

These files already exist and are ready to use:

1. **k8s/build-arm.ps1** - Build ARM images (Windows)
2. **k8s/build-arm.sh** - Build ARM images (Linux/Mac)
3. **k8s/RASPBERRY_PI_SETUP.md** - Initial Pi setup guide
4. **RASPBERRY_PI_DEPLOYMENT_CHECKLIST.md** - Deployment checklist
5. **CHANGES_NEEDED_SUMMARY.md** - Summary of needed changes

## ✅ Newly Created (Ready to Use)

1. **RASPBERRY_PI_COMPLETE_GUIDE.md** - Comprehensive single-file guide (NEW)
2. **k8s/deploy-pi.sh** - Automated deployment script for Linux/Mac (NEW)
3. **k8s/deploy-pi.ps1** - Automated deployment script for Windows (NEW)

## ⚠️ Files That Need Manual Configuration

### 1. Update Registry IP in Build Scripts

**File**: `k8s/build-arm.ps1` and `k8s/build-arm.sh`

**Current**:

```bash
REGISTRY="192.168.1.10:5000"
```

**Action Required**:

- Change `192.168.1.10` to your actual master node IP address
- Find your IP with: `ip addr` (Linux) or `ipconfig` (Windows)

---

### 2. Update Registry IP in Deployment Scripts

**File**: `k8s/deploy-pi.sh` and `k8s/deploy-pi.ps1`

**Current**:

```bash
REGISTRY="${REGISTRY:-192.168.1.10:5000}"
```

**Action Required**:

- Change default `192.168.1.10` to your master node IP
- Or set environment variable: `export REGISTRY=your-ip:5000`

---

## 🔧 Optional Modifications for Resource-Constrained Pi

### 3. Reduce Resource Limits (Recommended)

Raspberry Pi 3 B+ has only 1GB RAM. Current limits may be too high.

**Files to Modify**:

- `k8s/api-gateway.yaml`
- `k8s/shrine-service.yaml`
- `k8s/location-service.yaml`

**Current Configuration**:

```yaml
resources:
  requests:
    memory: '256Mi'
    cpu: '250m'
  limits:
    memory: '512Mi'
    cpu: '500m'
```

**Recommended Changes**:

```yaml
resources:
  requests:
    memory: '128Mi' # Reduced 50%
    cpu: '100m' # Reduced 60%
  limits:
    memory: '256Mi' # Reduced 50%
    cpu: '300m' # Reduced 40%
```

**How to Apply**:
Use the multi_replace_string_in_file tool or manually edit each file.

---

### 4. Reduce Initial Replicas (Recommended)

**File**: `k8s/api-gateway.yaml`

**Current**:

```yaml
spec:
  replicas: 3
```

**Recommended**:

```yaml
spec:
  replicas: 2 # Reduce to 2 for Pi cluster
```

**File**: `k8s/location-service.yaml`

**Current**:

```yaml
spec:
  replicas: 3
```

**Recommended**:

```yaml
spec:
  replicas: 2 # Reduce to 2 for Pi cluster
```

---

### 5. Adjust HPA Max Replicas (Recommended)

**File**: `k8s/api-gateway.yaml` (HorizontalPodAutoscaler section)

**Current**:

```yaml
spec:
  minReplicas: 3
  maxReplicas: 10
```

**Recommended**:

```yaml
spec:
  minReplicas: 2
  maxReplicas: 4 # Pi cluster can't handle 10 replicas
```

---

## 📝 Configuration Files (No Changes Needed)

These files work as-is:

1. **k8s/namespace.yaml** - Creates microservices namespace
2. **k8s/configmap.yaml** - Application configuration
3. **k8s/secrets.yaml** - Database credentials
4. **k8s/shrine-db.yaml** - PostgreSQL database (ARM-compatible)
5. **k8s/rabbitmq.yaml** - RabbitMQ message broker (ARM-compatible)

---

## 🚀 Deployment Workflow

### Step 1: Configure IPs

```bash
# Edit build scripts
nano k8s/build-arm.sh
# Change REGISTRY="192.168.1.10:5000" to your master IP

# Edit deployment scripts
nano k8s/deploy-pi.sh
# Change default IP or set environment variable
```

### Step 2: Start Docker Registry

```bash
# On master node
docker run -d -p 5000:5000 --restart=always --name registry registry:2
```

### Step 3: Build ARM Images

```bash
# On master node
cd k8s
./build-arm.sh   # Linux/Mac
# OR
.\build-arm.ps1  # Windows PowerShell
```

### Step 4: Deploy to Cluster

```bash
# On master node
cd k8s
./deploy-pi.sh   # Linux/Mac
# OR
.\deploy-pi.ps1  # Windows PowerShell
```

### Step 5: Verify Deployment

```bash
kubectl get nodes
kubectl get pods -n microservices
kubectl get svc -n microservices
```

### Step 6: Test Application

```bash
# Get master node IP
kubectl get nodes -o wide

# Test API
curl http://<MASTER-IP>:30000/shrines

# Open frontend
# Browser: http://<MASTER-IP>:30002
```

---

## 🔍 Quick Modifications Script

If you want to apply recommended changes automatically:

**Create**: `k8s/optimize-for-pi.sh`

```bash
#!/bin/bash

echo "Optimizing Kubernetes manifests for Raspberry Pi..."

# Reduce API Gateway replicas
sed -i 's/replicas: 3/replicas: 2/g' api-gateway.yaml

# Reduce Location Service replicas
sed -i 's/replicas: 3/replicas: 2/g' location-service.yaml

# Reduce resource requests (simple version - may need manual adjustment)
for file in api-gateway.yaml shrine-service.yaml location-service.yaml; do
    sed -i "s/memory: '256Mi'/memory: '128Mi'/g" $file
    sed -i "s/memory: '512Mi'/memory: '256Mi'/g" $file
    sed -i "s/cpu: '250m'/cpu: '100m'/g" $file
    sed -i "s/cpu: '500m'/cpu: '300m'/g" $file
done

echo "Done! Review changes with 'git diff' before committing."
```

Make executable and run:

```bash
chmod +x k8s/optimize-for-pi.sh
cd k8s
./optimize-for-pi.sh
```

---

## 📊 Files Status Summary

| File                           | Status             | Action Required           |
| ------------------------------ | ------------------ | ------------------------- |
| RASPBERRY_PI_COMPLETE_GUIDE.md | ✅ Created         | Read and follow           |
| k8s/deploy-pi.sh               | ✅ Created         | Update IP, then use       |
| k8s/deploy-pi.ps1              | ✅ Created         | Update IP, then use       |
| k8s/build-arm.sh               | ✅ Exists          | Update IP                 |
| k8s/build-arm.ps1              | ✅ Exists          | Update IP                 |
| k8s/api-gateway.yaml           | ⚠️ May need tuning | Reduce resources/replicas |
| k8s/shrine-service.yaml        | ⚠️ May need tuning | Reduce resources          |
| k8s/location-service.yaml      | ⚠️ May need tuning | Reduce resources/replicas |
| k8s/shrine-db.yaml             | ✅ Ready           | No changes                |
| k8s/rabbitmq.yaml              | ✅ Ready           | No changes                |
| k8s/configmap.yaml             | ✅ Ready           | No changes                |
| k8s/secrets.yaml               | ✅ Ready           | No changes                |
| k8s/namespace.yaml             | ✅ Ready           | No changes                |

---

## 🎯 Minimum Required Changes for Demo

For a working demo, you ONLY need to:

1. **Update master node IP** in:
   - `k8s/build-arm.sh` (or .ps1)
   - `k8s/deploy-pi.sh` (or .ps1)

2. **Start Docker registry**:

   ```bash
   docker run -d -p 5000:5000 --restart=always --name registry registry:2
   ```

3. **Build and deploy**:
   ```bash
   ./k8s/build-arm.sh
   ./k8s/deploy-pi.sh
   ```

**That's it!** The resource optimization is optional but recommended for stability.

---

## 📞 Help

If you encounter issues, check:

1. **RASPBERRY_PI_COMPLETE_GUIDE.md** - Full setup guide
2. **Troubleshooting section** - Common issues and solutions
3. **GitHub Issues** - Report problems

---

## ✅ Pre-Demo Checklist

- [ ] Updated IPs in build scripts
- [ ] Updated IPs in deployment scripts
- [ ] Docker registry running on master
- [ ] All 4 Pis joined K3s cluster
- [ ] ARM images built and pushed
- [ ] Application deployed with `deploy-pi.sh`
- [ ] All pods running
- [ ] Frontend accessible
- [ ] API returning data
- [ ] Tested fault tolerance by unplugging a Pi

**You're ready for demo! 🎉**
