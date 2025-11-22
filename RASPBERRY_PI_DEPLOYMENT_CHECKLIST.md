# Raspberry Pi Deployment Checklist - SDS Final Project

## 🚨 CRITICAL ISSUES TO FIX

### 1. **ARM Architecture Support** ⚠️ MUST FIX

**Problem**: Your Docker images use `node:20-alpine` which is AMD64 by default. Raspberry Pi 3 B+ uses ARMv7 (32-bit ARM) architecture.

**Solution**: Build multi-architecture images or ARM-specific images.

#### Option A: Multi-Architecture Build (Recommended)

Add to each Dockerfile (shrine-service, location-service, api-gateway, frontend):

```dockerfile
# Change FROM lines to:
FROM --platform=$BUILDPLATFORM node:20-alpine AS development
# and
FROM --platform=$TARGETPLATFORM node:20-alpine AS production
```

Then build with:

```bash
docker buildx build --platform linux/arm/v7,linux/arm64,linux/amd64 -t <image-name> .
```

#### Option B: ARM-Specific Images (Simpler for Testing)

Change all Dockerfiles:

```dockerfile
# For Raspberry Pi 3 B+ (32-bit ARM)
FROM node:20-alpine
# Already supports ARM! But verify with:
# docker pull --platform linux/arm/v7 node:20-alpine
```

**Action Required**:

- [ ] Test building images on your laptop with `--platform linux/arm/v7`
- [ ] OR build images directly on Raspberry Pi (slower but guaranteed compatibility)
- [ ] Verify PostgreSQL image supports ARM: `postgres:15-alpine` ✅ (it does)
- [ ] Verify RabbitMQ image supports ARM: `rabbitmq:3-management` ✅ (it does)

---

### 2. **Image Distribution Strategy** ⚠️ MUST FIX

**Problem**: K8s manifests use `imagePullPolicy: Never` which only works for Docker Desktop with local images.

**Current Setup**:

```yaml
imagePullPolicy: Never # This won't work on Raspberry Pi cluster!
```

**Solutions**:

#### Option A: Docker Registry (Recommended for Demo)

Set up a local Docker registry accessible to all Raspberry Pis:

```bash
# On your master node (laptop):
docker run -d -p 5000:5000 --restart=always --name registry registry:2

# Build and push ARM images:
docker build --platform linux/arm/v7 -t localhost:5000/shrine-service:latest .
docker push localhost:5000/shrine-service:latest

# Update K8s manifests:
image: <MASTER_IP>:5000/shrine-service:latest
imagePullPolicy: Always
```

#### Option B: Build on Each Pi (Not Recommended - Too Slow)

```bash
# SSH to each Pi and build locally
# Very time-consuming for demo!
```

#### Option C: Use Docker Hub or GitHub Container Registry

```bash
# Tag and push to Docker Hub
docker tag shrine-service:latest <your-username>/shrine-service:arm
docker push <your-username>/shrine-service:arm
```

**Action Required**:

- [ ] Set up local Docker registry on master node
- [ ] Update all K8s YAML files to use registry URL
- [ ] Test pulling images from Raspberry Pi
- [ ] Update `k8s/build.ps1` to push to registry

---

### 3. **Resource Limits Too High** ⚠️ MUST FIX

**Problem**: Raspberry Pi 3 B+ has only **1GB RAM**. Your resource requests will prevent pods from scheduling.

**Current Settings** (shrine-service.yaml):

```yaml
resources:
  requests:
    memory: '256Mi' # Too high when running 4+ pods per Pi
    cpu: '250m' # Okay
  limits:
    memory: '512Mi' # Way too high
    cpu: '500m' # Okay
```

**Raspberry Pi 3 B+ Specs**:

- CPU: 4-core ARM Cortex-A53 @ 1.4GHz
- RAM: 1GB
- You have 4 Pis = 4GB total RAM

**Recommended Settings**:

```yaml
resources:
  requests:
    memory: '128Mi' # Reduced from 256Mi
    cpu: '100m' # Reduced from 250m
  limits:
    memory: '256Mi' # Reduced from 512Mi
    cpu: '300m' # Reduced from 500m
```

**Action Required**:

- [ ] Reduce memory requests to 128Mi for all services
- [ ] Reduce memory limits to 256Mi for all services
- [ ] Consider reducing replicas (start with 1 replica per service)
- [ ] Update HPA minReplicas to 1, maxReplicas to 3 (not 10)

---

### 4. **Database Persistent Volume** ✅ PROBABLY OK

**Current**: Uses `hostPath` for PostgreSQL data.

**Concern**: If the Pi running the database pod fails, data is lost unless pod reschedules to same node.

**Recommendation**:

- Keep current setup for demo (simplest)
- Add node affinity to keep database on specific Pi
- OR use NFS for shared storage (complex, not needed for demo)

**Action Required**:

- [ ] Document which Pi will run the database
- [ ] Add node selector to shrine-db.yaml to pin to specific Pi

---

### 5. **Kubernetes Cluster Setup** 🆕 MUST CREATE

**What's Missing**: Instructions for setting up K8s cluster on Raspberry Pi.

**Required Steps**:

#### A. Master Node Setup (Your Laptop/Ubuntu VM)

```bash
# Install kubeadm, kubelet, kubectl
sudo apt-get update
sudo apt-get install -y apt-transport-https ca-certificates curl

# Add Kubernetes repo
curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.28/deb/Release.key | sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg
echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.28/deb/ /' | sudo tee /etc/apt/sources.list.d/kubernetes.list

sudo apt-get update
sudo apt-get install -y kubelet kubeadm kubectl
sudo apt-mark hold kubelet kubeadm kubectl

# Initialize cluster
sudo kubeadm init --pod-network-cidr=10.244.0.0/16

# Setup kubectl
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config

# Install CNI (Flannel)
kubectl apply -f https://raw.githubusercontent.com/flannel-io/flannel/master/Documentation/kube-flannel.yml
```

#### B. Raspberry Pi Worker Node Setup (On Each Pi)

```bash
# On each Raspberry Pi:
# 1. Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker pi

# 2. Install kubeadm (ARM version)
curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.28/deb/Release.key | sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg
echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.28/deb/ /' | sudo tee /etc/apt/sources.list.d/kubernetes.list

sudo apt-get update
sudo apt-get install -y kubelet kubeadm kubectl
sudo apt-mark hold kubelet kubeadm kubectl

# 3. Disable swap (required for K8s)
sudo dphys-swapfile swapoff
sudo dphys-swapfile uninstall
sudo update-rc.d dphys-swapfile remove

# 4. Join cluster (get token from master)
sudo kubeadm join <MASTER_IP>:6443 --token <TOKEN> --discovery-token-ca-cert-hash sha256:<HASH>
```

**Action Required**:

- [ ] Create detailed K8s setup guide in `k8s/RASPBERRY_PI_SETUP.md`
- [ ] Test cluster setup before demo day
- [ ] Document network topology (router, IPs, etc.)

---

### 6. **Node Affinity & Pod Distribution** 🆕 RECOMMENDED

**Problem**: Need to ensure pods are distributed across different Pis for fault tolerance demo.

**Current**: Only API Gateway has anti-affinity rules.

**Recommended**: Add pod anti-affinity to all services.

Example for shrine-service:

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

**Action Required**:

- [ ] Add anti-affinity rules to location-service
- [ ] Add anti-affinity rules to shrine-service (when replicas > 1)
- [ ] Test that pods spread across nodes

---

### 7. **Fault Tolerance Testing** ✅ ALREADY GOOD

**Requirement**: "If any single node (Raspberry Pi) and its containers go offline, your system will generate replacements and your application will automatically continue to work."

**Your Setup**:

- ✅ Multiple replicas (api-gateway: 3, location-service: 3)
- ✅ HPA configured
- ✅ ClusterIP services for load balancing
- ✅ Rolling updates configured

**Testing Plan**:

1. Verify all services running: `kubectl get pods -n microservices -o wide`
2. Note which Pi runs which pods
3. Unplug one Pi
4. Watch K8s reschedule pods: `kubectl get pods -n microservices -w`
5. Test API still works while pods are rescheduling
6. Wait for pods to come back up (~30-60 seconds)
7. Verify all API calls succeed

**Action Required**:

- [ ] Practice fault tolerance demo before presentation
- [ ] Document expected recovery time
- [ ] Prepare monitoring dashboard (optional but impressive)

---

### 8. **Request Flow Documentation** ✅ ALREADY GOOD

**Requirement**: "A client request must be serviced by at least 2 containers before a response is sent back."

**Your Flow** (PERFECT ✅):

```
Client → API Gateway (Container 1)
       ↓
       → Shrine Service (Container 2) → PostgreSQL
       ↓
       → Location Service (Container 3) → Mock Location Database
       ↓
       → Back to API Gateway
       ↓
       → Response to Client
```

**Proof Points**:

1. **GET /shrines** → API Gateway → Shrine Service (2 containers) ✅
2. **POST /shrines** → API Gateway → Shrine Service → Location Service (3 containers) ✅
3. **POST /location/nearby** → API Gateway → Location Service → Shrine Service (3 containers) ✅

**Action Required**:

- [ ] Add sequence diagram showing container flow to README
- [ ] Prepare demo script showing logs from multiple containers
- [ ] Use `kubectl logs -f <pod-name> -n microservices` during demo

---

### 9. **Performance Considerations** ⚠️ BE AWARE

**Raspberry Pi Limitations**:

- Slow disk I/O (SD card)
- Limited RAM (1GB)
- Moderate CPU (4 cores @ 1.4GHz)

**Recommendations**:

- Reduce PostgreSQL `shared_buffers` for Pi deployment
- Disable frontend source maps in production build
- Use smaller base images where possible
- Consider disabling HPA during demo (manual scaling is more predictable)

**Action Required**:

- [ ] Test full application load time on Pi cluster
- [ ] Optimize Docker images for size
- [ ] Pre-seed database before demo

---

### 10. **Demo Day Checklist** 🎯

**Before Demo**:

- [ ] All 4 Raspberry Pis functioning
- [ ] Kubernetes cluster running and healthy
- [ ] All images built for ARM and pushed to registry
- [ ] Database pre-seeded with shrine data
- [ ] Network connectivity tested (wired preferred!)
- [ ] Backup plan if WiFi fails
- [ ] Power strips and cables ready
- [ ] Laptop with kubectl configured

**During Demo**:

1. [ ] Show cluster status: `kubectl get nodes`
2. [ ] Show all pods: `kubectl get pods -n microservices -o wide`
3. [ ] Demo application working (browser)
4. [ ] Show request flow through logs
5. [ ] Pull power from one Pi (instructor chooses)
6. [ ] Show pods rescheduling: `kubectl get pods -n microservices -w`
7. [ ] Test application still works during recovery
8. [ ] Show all pods healthy again

**After Demo**:

- [ ] Sign in and return equipment
- [ ] Flash Raspberry Pis with Raspbian OS
- [ ] Factory reset router

---

## 📋 Summary of Required Changes

### Critical (Must Do):

1. ✅ Build ARM-compatible Docker images
2. ✅ Set up local Docker registry
3. ✅ Update K8s manifests with registry URLs
4. ✅ Reduce resource limits (128Mi/256Mi)
5. ✅ Create Raspberry Pi cluster setup guide
6. ✅ Test full deployment on Pi cluster before demo

### Recommended (Should Do):

1. Add node affinity rules
2. Reduce HPA max replicas to 3
3. Add comprehensive demo script
4. Create monitoring dashboard
5. Optimize image sizes

### Nice to Have:

1. Add Grafana/Prometheus for monitoring
2. Add health check endpoints with detailed status
3. Create automated testing script
4. Add circuit breakers for external services

---

## 🔧 Files That Need Updates

### Must Update:

- [ ] `apps/api-gateway/Dockerfile` - Add ARM support
- [ ] `apps/shrine-service/Dockerfile` - Add ARM support
- [ ] `apps/location-service/Dockerfile` - Add ARM support
- [ ] `frontend/Dockerfile` - Add ARM support
- [ ] `k8s/api-gateway.yaml` - Update image URL, reduce resources
- [ ] `k8s/shrine-service.yaml` - Update image URL, reduce resources, add anti-affinity
- [ ] `k8s/location-service.yaml` - Update image URL, reduce resources, add anti-affinity
- [ ] `k8s/shrine-db.yaml` - Add node selector
- [ ] `k8s/build.ps1` - Add registry push logic
- [ ] `k8s/deploy.ps1` - Add registry setup step

### Should Create:

- [ ] `k8s/RASPBERRY_PI_SETUP.md` - Detailed cluster setup guide
- [ ] `k8s/DEMO_SCRIPT.md` - Step-by-step demo instructions
- [ ] `k8s/registry-setup.sh` - Script to setup Docker registry

---

## ✅ What's Already Good

1. ✅ Microservices architecture (3 services)
2. ✅ Container dependency chain (2+ containers per request)
3. ✅ Kubernetes manifests (well-structured)
4. ✅ HPA for auto-scaling
5. ✅ Rolling updates configured
6. ✅ Health checks (readiness/liveness probes)
7. ✅ Comprehensive documentation
8. ✅ Good separation of concerns

---

## 🚀 Next Steps

1. **This Week**: Build and test ARM images locally
2. **Next Week**: Set up Pi cluster and test deployment
3. **Week 3**: Full integration testing and fault tolerance testing
4. **Week 4**: Practice demo, optimize performance
5. **Demo Day**: Execute flawlessly! 💪

---

## 📞 Questions to Clarify

1. Can you use Docker Hub or must images be local?
2. Is internet access available during demo?
3. Can you use your laptop as master node?
4. Will you have time to setup before demo slot?
5. What's the backup plan if hardware fails?

---

**Good Luck! 🍀 Your architecture is solid - just needs Pi-specific adjustments!**
