# 📚 Complete Documentation Index - Raspberry Pi Deployment

This is your master index for deploying the สาย.mu shrine discovery platform on Raspberry Pi Kubernetes cluster for the SDS final project.

---

## 🎯 Start Here

**New to the project?** Start with these in order:

1. **[RASPBERRY_PI_COMPLETE_GUIDE.md](./RASPBERRY_PI_COMPLETE_GUIDE.md)** ⭐ **MAIN GUIDE**
   - Complete setup from hardware to deployment
   - Covers ALL course requirements
   - Step-by-step instructions
   - Troubleshooting section
   - **READ THIS FIRST**

2. **[FILES_TO_FIX_SUMMARY.md](./FILES_TO_FIX_SUMMARY.md)**
   - What needs to be changed
   - Which files to update
   - Quick modification scripts
   - Deployment workflow

3. **[DEMO_DAY_QUICK_REFERENCE.md](./DEMO_DAY_QUICK_REFERENCE.md)**
   - Day-of-demo checklist
   - Commands to run
   - What to say
   - Emergency fixes

---

## 📖 Documentation Structure

### Core Documentation

| Document                           | Purpose                       | When to Read                  |
| ---------------------------------- | ----------------------------- | ----------------------------- |
| **RASPBERRY_PI_COMPLETE_GUIDE.md** | Comprehensive setup guide     | Before starting setup         |
| **FILES_TO_FIX_SUMMARY.md**        | List of files needing changes | Before building images        |
| **DEMO_DAY_QUICK_REFERENCE.md**    | Demo day cheat sheet          | Day before and during demo    |
| **README.md**                      | Project overview              | Understanding the application |
| **DEVELOPMENT.md**                 | Local development guide       | For local testing             |

### Existing Documentation (Reference)

| Document                                 | Purpose                           |
| ---------------------------------------- | --------------------------------- |
| **RASPBERRY_PI_DEPLOYMENT_CHECKLIST.md** | Original deployment checklist     |
| **CHANGES_NEEDED_SUMMARY.md**            | Changes needed for Pi deployment  |
| **DEPLOYMENT_SUMMARY.md**                | Kubernetes deployment overview    |
| **k8s/README.md**                        | K8s deployment for Docker Desktop |
| **k8s/RASPBERRY_PI_SETUP.md**            | Initial Pi setup instructions     |
| **k8s/README_PI.md**                     | Pi-specific setup notes           |

---

## 🚀 Quick Start (TL;DR)

```bash
# 1. Setup hardware
# - Connect 4 Pis and laptop to router
# - Install Ubuntu Server on Pi SD cards
# - Boot all Pis

# 2. Setup master node (laptop)
docker run -d -p 5000:5000 --restart=always --name registry registry:2
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install kubectl /usr/local/bin/kubectl

# 3. Setup K3s cluster
# On master:
curl -sfL https://get.k3s.io | sh -s - --docker --write-kubeconfig-mode 644

# On each Pi:
curl -sfL https://get.k3s.io | K3S_URL=https://192.168.1.10:6443 K3S_TOKEN=<token> sh -s - agent --docker

# 4. Clone repo and build images
git clone https://github.com/Nacnano/sds-final-project.git
cd sds-final-project/k8s
# Edit build-arm.sh: set REGISTRY to your master IP
./build-arm.sh

# 5. Deploy application
# Edit deploy-pi.sh: set REGISTRY to your master IP
./deploy-pi.sh

# 6. Verify
kubectl get pods -n microservices
curl http://192.168.1.10:30000/shrines

# Done! 🎉
```

---

## 📁 Project Structure

```
sds-final-project/
├── 📄 RASPBERRY_PI_COMPLETE_GUIDE.md    ⭐ START HERE
├── 📄 FILES_TO_FIX_SUMMARY.md           Configuration guide
├── 📄 DEMO_DAY_QUICK_REFERENCE.md       Demo checklist
├── 📄 README.md                         Project overview
├── 📄 DEVELOPMENT.md                    Local dev guide
│
├── k8s/                                 Kubernetes manifests
│   ├── 🔨 build-arm.sh                 Build ARM images (Linux)
│   ├── 🔨 build-arm.ps1                Build ARM images (Windows)
│   ├── 🚀 deploy-pi.sh                 Deploy to Pi cluster (Linux)
│   ├── 🚀 deploy-pi.ps1                Deploy to Pi cluster (Windows)
│   ├── namespace.yaml                   Namespace definition
│   ├── configmap.yaml                   Configuration
│   ├── secrets.yaml                     Credentials
│   ├── shrine-db.yaml                   PostgreSQL
│   ├── rabbitmq.yaml                    RabbitMQ
│   ├── shrine-service.yaml              Shrine microservice
│   ├── location-service.yaml            Location microservice
│   ├── api-gateway.yaml                 API Gateway + Frontend
│   └── 📄 README.md                     K8s deployment guide
│
├── apps/                                Microservices
│   ├── api-gateway/                     REST API gateway
│   │   ├── Dockerfile                   ARM-compatible
│   │   └── src/
│   ├── shrine-service/                  Shrine management
│   │   ├── Dockerfile                   ARM-compatible
│   │   └── src/
│   └── location-service/                GPS validation
│       ├── Dockerfile                   ARM-compatible
│       └── src/
│
├── frontend/                            React application
│   ├── Dockerfile                       ARM-compatible
│   └── src/
│
├── proto/                               gRPC definitions
│   ├── shrine.proto
│   └── location.proto
│
└── tools/
    └── scripts/
        └── seed-all-databases.js        Database seeding
```

---

## 🎓 Course Requirements Mapping

| Requirement              | Where Documented                     | How Implemented                 |
| ------------------------ | ------------------------------------ | ------------------------------- |
| **4+ Raspberry Pis**     | Complete Guide § "Hardware Setup"    | 4 Pis as K8s workers            |
| **Laptop as Master**     | Complete Guide § "Master Node Setup" | Laptop runs K3s control plane   |
| **3+ Containers**        | Complete Guide § "Architecture"      | 4 microservices + DB + MQ       |
| **Distinct Services**    | README.md § "Microservices"          | API, Shrine, Location, Frontend |
| **2+ Container Chain**   | Complete Guide § "Request Flow"      | Client→Gateway→Shrine→Location  |
| **Fault Tolerance**      | Complete Guide § "Testing"           | K8s auto-recovery               |
| **Logical Architecture** | README.md § "Architecture"           | Proper microservices design     |
| **Auto Deployment**      | deploy-pi.sh                         | kubectl apply automation        |
| **GitHub Repo**          | README.md                            | Setup instructions included     |

---

## 🔧 Key Files to Modify

### Must Change (Before Building)

1. **k8s/build-arm.sh** or **k8s/build-arm.ps1**
   - Update `REGISTRY="192.168.1.10:5000"` to your master IP

2. **k8s/deploy-pi.sh** or **k8s/deploy-pi.ps1**
   - Update `REGISTRY="192.168.1.10:5000"` to your master IP

### Optional (For Better Performance)

3. **k8s/api-gateway.yaml**
   - Reduce replicas from 3 to 2
   - Reduce memory/CPU limits

4. **k8s/location-service.yaml**
   - Reduce replicas from 3 to 2
   - Reduce memory/CPU limits

5. **k8s/shrine-service.yaml**
   - Reduce memory/CPU limits

_See [FILES_TO_FIX_SUMMARY.md](./FILES_TO_FIX_SUMMARY.md) for details._

---

## 🛠️ Scripts Overview

### Build Scripts (Create ARM Images)

```bash
# Linux/Mac
cd k8s
chmod +x build-arm.sh
./build-arm.sh

# Windows PowerShell
cd k8s
.\build-arm.ps1
```

**What they do**:

- Build Docker images for ARM architecture
- Push to local registry
- Support: shrine-service, location-service, api-gateway, frontend

### Deployment Scripts (Deploy to K8s)

```bash
# Linux/Mac
cd k8s
chmod +x deploy-pi.sh
./deploy-pi.sh

# Windows PowerShell
cd k8s
.\deploy-pi.ps1
```

**What they do**:

- Create namespace, secrets, configmaps
- Deploy databases (PostgreSQL, RabbitMQ)
- Deploy microservices with registry images
- Replace imagePullPolicy on-the-fly

---

## 🧪 Testing Strategy

### Pre-Demo Testing (1 week before)

1. **Hardware Test**

   ```bash
   # Verify all Pis boot and network works
   ping 192.168.1.11
   ping 192.168.1.12
   ping 192.168.1.13
   ping 192.168.1.14
   ```

2. **Cluster Test**

   ```bash
   # Verify K3s cluster forms
   kubectl get nodes
   # Should show 5 nodes
   ```

3. **Build Test**

   ```bash
   # Verify ARM images build successfully
   ./k8s/build-arm.sh
   curl http://192.168.1.10:5000/v2/_catalog
   ```

4. **Deployment Test**

   ```bash
   # Verify application deploys
   ./k8s/deploy-pi.sh
   kubectl get pods -n microservices
   ```

5. **Functionality Test**
   ```bash
   # Verify application works
   curl http://192.168.1.10:30000/shrines
   # Open http://192.168.1.10:30002 in browser
   ```

### Demo Day Testing (Day of)

1. **Quick Health Check** (5 min before)

   ```bash
   kubectl get nodes
   kubectl get pods -n microservices
   curl http://192.168.1.10:30000/shrines
   ```

2. **Demo Rehearsal** (Day before)
   - Run through entire demo script
   - Practice unplugging Pi and showing recovery
   - Time yourself (should be 10-12 minutes)

---

## 📞 Help & Support

### During Setup

- **Detailed Instructions**: [RASPBERRY_PI_COMPLETE_GUIDE.md](./RASPBERRY_PI_COMPLETE_GUIDE.md)
- **Troubleshooting**: See guide § "Troubleshooting"
- **Configuration**: [FILES_TO_FIX_SUMMARY.md](./FILES_TO_FIX_SUMMARY.md)

### During Demo

- **Quick Reference**: [DEMO_DAY_QUICK_REFERENCE.md](./DEMO_DAY_QUICK_REFERENCE.md)
- **Emergency Commands**: See reference § "Emergency Troubleshooting"

### General

- **GitHub Issues**: https://github.com/Nacnano/sds-final-project/issues
- **Course Instructor**: kunwadee@cp.eng.chula.ac.th

---

## ✅ Pre-Demo Checklist

Print this and check off before demo:

### 1 Week Before Demo

- [ ] Read RASPBERRY_PI_COMPLETE_GUIDE.md completely
- [ ] Hardware setup complete (router, Pis, laptop)
- [ ] K3s cluster formed (5 nodes visible)
- [ ] Docker registry running on master
- [ ] ARM images built and pushed
- [ ] Application deployed successfully
- [ ] All pods running without crashes
- [ ] Frontend accessible in browser
- [ ] API returning shrine data
- [ ] Database seeded with sample data

### 1 Day Before Demo

- [ ] Test full demo script
- [ ] Practice explaining request flow
- [ ] Practice fault tolerance demo
- [ ] Time your demo (target: 10-12 min)
- [ ] Prepare terminals/windows
- [ ] Charge laptop fully
- [ ] Test unplugging/replugging a Pi

### Day of Demo (Before Your Slot)

- [ ] All hardware powered on
- [ ] All nodes showing "Ready"
- [ ] All pods showing "Running"
- [ ] Frontend loads in browser
- [ ] API returns data
- [ ] DEMO_DAY_QUICK_REFERENCE.md printed/open
- [ ] 3 terminal windows prepared
- [ ] Deep breath taken 😊

---

## 🎯 Success Indicators

You're ready for demo when:

✅ `kubectl get nodes` shows 5 nodes (all Ready)  
✅ `kubectl get pods -n microservices` shows all Running  
✅ `curl http://192.168.1.10:30000/shrines` returns JSON  
✅ Browser loads http://192.168.1.10:30002 successfully  
✅ You can explain the request flow clearly  
✅ You've tested unplugging a Pi and seen recovery

---

## 📊 Documentation Quality Check

### Complete Guide ✅

- [x] Hardware setup instructions
- [x] Software installation steps
- [x] Kubernetes cluster setup
- [x] ARM image building
- [x] Application deployment
- [x] Testing procedures
- [x] Troubleshooting guide
- [x] Demo day procedures

### Code Ready ✅

- [x] ARM-compatible Dockerfiles
- [x] Kubernetes manifests
- [x] Build automation scripts
- [x] Deployment automation scripts
- [x] Database seeding scripts

### Requirements Met ✅

- [x] 4+ Raspberry Pis as nodes
- [x] Laptop as master/controller
- [x] 3+ distinct microservices
- [x] Container dependency chain (2+)
- [x] Fault tolerance demonstration
- [x] Logical service architecture
- [x] Automatic deployment from GitHub
- [x] Complete setup documentation

---

## 🚀 You're Ready!

Everything you need is documented. Follow the guides in order:

1. **RASPBERRY_PI_COMPLETE_GUIDE.md** - Setup everything
2. **FILES_TO_FIX_SUMMARY.md** - Configure for your network
3. **DEMO_DAY_QUICK_REFERENCE.md** - Ace the demo

**Good luck with your final project! 🎉**

---

_Last Updated: November 22, 2025_  
_Course: 2110415 Software-Defined Systems_  
_Instructor: Kunwadee Sripanidkulchai, Ph.D._
