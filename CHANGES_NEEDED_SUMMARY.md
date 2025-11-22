# 🚨 CRITICAL CHANGES REQUIRED FOR RASPBERRY PI DEPLOYMENT

## Executive Summary

Your project **ALREADY MEETS** most course requirements:

- ✅ 3+ microservices with distinct services
- ✅ Container dependency chain (2+ containers per request)
- ✅ Kubernetes manifests with HPA
- ✅ Good architecture and documentation

**HOWEVER**, it needs modifications for Raspberry Pi deployment:

## 🔴 Must Fix (Critical)

### 1. Build ARM-Compatible Images

**Problem**: Your images are built for x86/AMD64. Raspberry Pi uses ARM architecture.

**Solution**: Use the new script I created:

```powershell
# Run this to build ARM images
.\k8s\build-arm.ps1
```

**Files Created**:

- ✅ `k8s/build-arm.ps1` (Windows)
- ✅ `k8s/build-arm.sh` (Linux/Mac)

---

### 2. Set Up Docker Registry

**Problem**: `imagePullPolicy: Never` won't work on Pi cluster.

**Solution**: Run local Docker registry on your laptop (master node):

```bash
docker run -d -p 5000:5000 --restart=always --name registry registry:2
```

**Then update ALL Kubernetes YAML files**:

- Change `imagePullPolicy: Never` → `imagePullPolicy: Always`
- Change `image: shrine-service:latest` → `image: 192.168.1.10:5000/shrine-service:latest`

**Files to Update**:

- [ ] `k8s/api-gateway.yaml`
- [ ] `k8s/shrine-service.yaml`
- [ ] `k8s/location-service.yaml`
- [ ] `k8s/shrine-db.yaml` (PostgreSQL already supports ARM)
- [ ] `k8s/rabbitmq.yaml` (RabbitMQ already supports ARM)

---

### 3. Reduce Resource Limits

**Problem**: Pi has only 1GB RAM. Your current limits are too high.

**Current**:

```yaml
resources:
  requests:
    memory: '256Mi'
    cpu: '250m'
  limits:
    memory: '512Mi'
    cpu: '500m'
```

**Change to**:

```yaml
resources:
  requests:
    memory: '128Mi' # Reduced 50%
    cpu: '100m' # Reduced 60%
  limits:
    memory: '256Mi' # Reduced 50%
    cpu: '300m' # Reduced 40%
```

**Files to Update**:

- [ ] `k8s/api-gateway.yaml`
- [ ] `k8s/shrine-service.yaml`
- [ ] `k8s/location-service.yaml`

---

### 4. Reduce HPA Max Replicas

**Problem**: Pi cluster can't handle 10 replicas per service.

**Change from**:

```yaml
maxReplicas: 10
```

**Change to**:

```yaml
maxReplicas: 3
```

**Files to Update**:

- [ ] `k8s/api-gateway.yaml`
- [ ] `k8s/shrine-service.yaml`
- [ ] `k8s/location-service.yaml`

---

### 5. Set Up Raspberry Pi Cluster

**Problem**: No instructions for creating the cluster.

**Solution**: Follow the guide I created:

- ✅ `k8s/RASPBERRY_PI_SETUP.md` - Complete step-by-step guide

**Key Steps**:

1. Install Ubuntu Server on all 4 Pis
2. Install Docker on each Pi
3. Install Kubernetes (kubeadm, kubelet, kubectl)
4. Initialize master node (your laptop)
5. Join worker nodes (4 Raspberry Pis)
6. Install CNI (Flannel)
7. Configure insecure registry on all nodes

---

## 🟡 Should Fix (Recommended)

### 6. Add Anti-Affinity Rules

**Why**: Spread pods across nodes for better fault tolerance demo.

**Add to shrine-service.yaml and location-service.yaml**:

```yaml
spec:
  template:
    spec:
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
                        - shrine-service
                topologyKey: kubernetes.io/hostname
```

---

### 7. Pin Database to Specific Node

**Why**: Ensure database pod doesn't move between nodes.

**Add to shrine-db.yaml**:

```yaml
spec:
  template:
    spec:
      nodeSelector:
        demo-role: database
```

Then label a node:

```bash
kubectl label node pi-node-1 demo-role=database
```

---

## 📚 Documentation Files Created

I created several helpful guides for you:

1. ✅ **`RASPBERRY_PI_DEPLOYMENT_CHECKLIST.md`** - Complete overview of all changes
2. ✅ **`k8s/RASPBERRY_PI_SETUP.md`** - Step-by-step cluster setup
3. ✅ **`k8s/DEMO_SCRIPT.md`** - Detailed demo day instructions
4. ✅ **`k8s/README_PI.md`** - Pi-specific deployment guide
5. ✅ **`k8s/build-arm.ps1`** - Script to build ARM images (Windows)
6. ✅ **`k8s/build-arm.sh`** - Script to build ARM images (Linux)

---

## 📋 Quick Action Checklist

### This Week:

- [ ] Read `RASPBERRY_PI_DEPLOYMENT_CHECKLIST.md`
- [ ] Update all K8s YAML files (image URLs, resources, HPA)
- [ ] Set up Docker registry on your laptop
- [ ] Test building ARM images with `build-arm.ps1`

### Next Week:

- [ ] Get Raspberry Pis from instructor
- [ ] Follow `k8s/RASPBERRY_PI_SETUP.md` to create cluster
- [ ] Deploy application to Pi cluster
- [ ] Test basic functionality

### Week 3:

- [ ] Practice fault tolerance demo
- [ ] Test multiple times with different node failures
- [ ] Optimize performance if needed
- [ ] Review `k8s/DEMO_SCRIPT.md`

### Week 4:

- [ ] Final practice run
- [ ] Prepare backup plans
- [ ] Review troubleshooting section
- [ ] Get good sleep before demo! 😊

### Demo Day (Dec 2):

- [ ] Arrive early to set up
- [ ] Follow `k8s/DEMO_SCRIPT.md`
- [ ] Show confidence!
- [ ] Clean up equipment after demo

---

## 🎯 What Makes Your Project Demo-Ready

**Already Good** ✅:

1. Solid microservices architecture
2. Multiple containers servicing each request
3. Kubernetes manifests with proper configuration
4. Good separation of concerns
5. Comprehensive documentation

**Needs Updates for Pi** ⚠️:

1. ARM-compatible images
2. Registry configuration
3. Reduced resource limits
4. Cluster setup guide
5. Demo preparation

**After fixes, you'll have** 🎉:

- Complete Raspberry Pi deployment
- Fault-tolerant application
- Automatic pod rescheduling
- Professional demo presentation

---

## 💡 Key Insights

### Why Your Architecture is Perfect for This Project:

1. **Multi-container requests** ✅
   - GET /shrines: API Gateway → Shrine Service (2 containers)
   - POST /shrines: API Gateway → Shrine Service → Location Service (3 containers)
   - POST /location/nearby: API Gateway → Location Service → Shrine Service (3 containers)

2. **Fault tolerance** ✅
   - Multiple replicas (API Gateway: 3, Location Service: 3)
   - Kubernetes will auto-reschedule when node fails
   - Rolling updates prevent downtime

3. **Scalability** ✅
   - HPA configured for auto-scaling
   - Stateless services (easy to scale)
   - Shared database (not duplicated per pod)

---

## 🚀 Next Steps

1. **Read all documentation I created** (especially RASPBERRY_PI_DEPLOYMENT_CHECKLIST.md)
2. **Update Kubernetes YAML files** with reduced resources and registry URLs
3. **Test ARM builds locally** before getting Raspberry Pis
4. **Set up cluster** following the guide
5. **Practice demo** multiple times

---

## ❓ Questions to Resolve

Before starting, clarify with your instructor:

1. Can you use Docker Hub instead of local registry? (Easier but needs internet)
2. Will you have internet access during demo? (For pulling images if needed)
3. Can you arrive early to set up? (Cluster might need 15-30 min setup)
4. What's the backup plan if hardware fails? (Should have plan B)

---

## 📞 Need Help?

All the information you need is in these files:

- Overview: `RASPBERRY_PI_DEPLOYMENT_CHECKLIST.md`
- Cluster Setup: `k8s/RASPBERRY_PI_SETUP.md`
- Demo Guide: `k8s/DEMO_SCRIPT.md`
- Deployment: `k8s/README_PI.md`

**You've got a great project! Just needs Pi-specific tweaks. You can do this! 💪**
