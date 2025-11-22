# 🎓 SDS Final Project - Complete Raspberry Pi Kubernetes Deployment Guide

## สาย.mu - Thailand's Shrine Discovery Platform

**Course**: 2110415 Software-Defined Systems Semester 1/2025  
**Instructor**: Kunwadee Sripanidkulchai, Ph.D.

---

## 📋 Table of Contents

1. [Project Overview & Requirements](#project-overview--requirements)
2. [Architecture & Design](#architecture--design)
3. [Hardware Setup](#hardware-setup)
4. [Master Node Setup](#master-node-setup)
5. [Raspberry Pi Node Setup](#raspberry-pi-node-setup)
6. [Building ARM Images](#building-arm-images)
7. [Kubernetes Cluster Setup](#kubernetes-cluster-setup)
8. [Application Deployment](#application-deployment)
9. [Testing & Verification](#testing--verification)
10. [Demo Day Checklist](#demo-day-checklist)
11. [Troubleshooting](#troubleshooting)

---

## 🎯 Project Overview & Requirements

### What We're Building

**สาย.mu (sai.mu)** is a microservices platform for discovering Thailand's sacred shrines and temples with location-based features.

### Course Requirements Compliance

✅ **Requirement 1**: Kubernetes cluster with 4+ Raspberry Pis  
✅ **Requirement 2**: 3+ different containers providing distinct services  
✅ **Requirement 3**: Container dependency chain (2+ containers per request)  
✅ **Requirement 4**: Fault tolerance with automatic recovery  
✅ **Requirement 5**: Logical microservices architecture

### How We Meet Requirements

| Requirement          | Implementation                                                      |
| -------------------- | ------------------------------------------------------------------- |
| **4+ Pi Nodes**      | 4 Raspberry Pi 3 B+ as worker nodes                                 |
| **3+ Services**      | API Gateway, Shrine Service, Location Service, Frontend             |
| **Dependency Chain** | Client → API Gateway → Shrine Service → Location Service → Response |
| **Fault Tolerance**  | Kubernetes ReplicaSets, HPA, automatic pod rescheduling             |
| **Logical Services** | Shrine management, location validation, API gateway, frontend       |

### Application Features

- 🏛️ Browse shrines with detailed information
- 📍 Location-based discovery using GPS coordinates
- 🗺️ Distance calculation between locations
- 🏷️ Category filtering (love, career, wealth, health, spiritual)
- 🌐 Interactive web interface

---

## 🏗️ Architecture & Design

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Browser                           │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTP/REST
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Kubernetes Cluster                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │          Namespace: microservices                        │   │
│  │                                                          │   │
│  │  ┌────────────────┐         ┌────────────────┐         │   │
│  │  │  API Gateway   │         │    Frontend    │         │   │
│  │  │  (3 replicas)  │◄────────┤   (2 replicas) │         │   │
│  │  │  Port: 3000    │         │   Port: 80     │         │   │
│  │  │  NodePort:30000│         │   NodePort:30002│         │   │
│  │  └───────┬────────┘         └────────────────┘         │   │
│  │          │ gRPC                                         │   │
│  │     ┌────┴─────────────────┐                           │   │
│  │     │                      │                           │   │
│  │  ┌──▼──────────┐  ┌───────▼─────────┐                 │   │
│  │  │   Shrine    │  │    Location     │                 │   │
│  │  │   Service   │──►    Service      │                 │   │
│  │  │ (1 replica) │  │   (3 replicas)  │                 │   │
│  │  │ Port: 5001  │  │   Port: 5006    │                 │   │
│  │  └──────┬──────┘  └─────────────────┘                 │   │
│  │         │                                              │   │
│  │  ┌──────▼──────┐         ┌──────────────┐             │   │
│  │  │  Shrine DB  │         │   RabbitMQ   │             │   │
│  │  │ (PostgreSQL)│         │ (Message Bus)│             │   │
│  │  │ Port: 5432  │         │  Port: 5672  │             │   │
│  │  └─────────────┘         └──────────────┘             │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Request Flow (Demonstrates Container Dependency Chain)

**Example**: User searches for "Erawan Shrine"

```
1. Browser → API Gateway (NodePort 30000)
2. API Gateway → Shrine Service (gRPC)
3. Shrine Service → Location Service (gRPC) [validates coordinates]
4. Location Service → Shrine Service [returns lat/lng]
5. Shrine Service → Shrine DB [queries shrine data]
6. Shrine Service → API Gateway [returns shrine with coordinates]
7. API Gateway → Browser [JSON response]
```

**Result**: Every request touches at least 3 containers (API Gateway → Shrine Service → Location Service)

### Microservices Description

| Service              | Purpose                                | Technology               | Replicas |
| -------------------- | -------------------------------------- | ------------------------ | -------- |
| **API Gateway**      | REST API endpoint, request routing     | NestJS, Express          | 3 (HA)   |
| **Shrine Service**   | Shrine CRUD operations, business logic | NestJS, gRPC, PostgreSQL | 1        |
| **Location Service** | GPS coordinate validation & distance   | NestJS, gRPC             | 3        |
| **Frontend**         | React SPA, user interface              | React 19, Vite, Nginx    | 2        |
| **Shrine DB**        | Persistent shrine data storage         | PostgreSQL 15            | 1        |
| **RabbitMQ**         | Async messaging between services       | RabbitMQ 3               | 1        |

### Technology Stack

**Backend**: NestJS 11, TypeScript 5, gRPC, Protocol Buffers  
**Frontend**: React 19, TypeScript, Vite 7, Tailwind CSS 4  
**Databases**: PostgreSQL 15  
**Message Queue**: RabbitMQ 3  
**Orchestration**: Kubernetes (K3s on Pi)  
**Container Runtime**: Docker

---

## 🔧 Hardware Setup

### Equipment Checklist (Per Group)

- ✅ 1x TP-Link TL-WR841N Router
- ✅ 4x Raspberry Pi 3 B+ Kits
  - Raspberry Pi 3 B+ (ARMv7, 1GB RAM)
  - Power adapters
  - 16GB+ SD cards (Class 10)
  - Ethernet cables
- ✅ 1x Laptop/Desktop (Master node)
- ✅ Ethernet adapters as needed

### Network Topology

```
                    Internet
                        |
              [TP-Link Router]
              192.168.1.1
                        |
    +-------------------+-------------------+
    |         |         |         |         |
[Master]  [Pi-1]   [Pi-2]   [Pi-3]   [Pi-4]
 .10       .11       .12       .13       .14
```

### IP Address Allocation

| Device | IP Address   | Hostname  | Role                     |
| ------ | ------------ | --------- | ------------------------ |
| Router | 192.168.1.1  | -         | Gateway                  |
| Laptop | 192.168.1.10 | master    | Control Plane + Registry |
| Pi 1   | 192.168.1.11 | pi-node-1 | Worker                   |
| Pi 2   | 192.168.1.12 | pi-node-2 | Worker                   |
| Pi 3   | 192.168.1.13 | pi-node-3 | Worker                   |
| Pi 4   | 192.168.1.14 | pi-node-4 | Worker                   |

### Router Setup

1. **Connect router to power**
2. **Access router admin panel**:
   - URL: http://192.168.1.1
   - Default credentials: admin/admin
3. **Configure DHCP reservations** (recommended):
   - Reserve 192.168.1.10-14 for your devices
   - DHCP range: 192.168.1.100-200
4. **Enable all LAN ports**
5. **Test connectivity**: ping 192.168.1.1

---

## 💻 Master Node Setup

### Step 1: Prepare Master Node (Your Laptop)

**Option A: Ubuntu VM** (Recommended)

```bash
# Requirements:
# - VirtualBox/VMware
# - Ubuntu 22.04 LTS
# - 2+ CPU cores
# - 4GB+ RAM
# - Bridged network adapter
```

**Option B: Windows with WSL2**

```powershell
# Install WSL2 with Ubuntu
wsl --install -d Ubuntu-22.04
```

### Step 2: Install Docker on Master

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER

# Verify
docker --version
```

### Step 3: Set Up Docker Registry

The registry stores ARM images that Raspberry Pis will pull.

```bash
# Start Docker registry on port 5000
docker run -d \
  -p 5000:5000 \
  --restart=always \
  --name registry \
  registry:2

# Verify registry is running
curl http://localhost:5000/v2/_catalog

# Expected output: {"repositories":[]}
```

**Important**: Make sure your firewall allows port 5000:

```bash
# Ubuntu/Linux
sudo ufw allow 5000/tcp

# Windows Firewall
# Add inbound rule for TCP port 5000
```

### Step 4: Install kubectl on Master

```bash
# Download kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"

# Install
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Verify
kubectl version --client
```

### Step 5: Configure Insecure Registry (Required for HTTP registry)

```bash
# Edit Docker daemon config
sudo nano /etc/docker/daemon.json
```

Add:

```json
{
  "insecure-registries": ["192.168.1.10:5000"]
}
```

```bash
# Restart Docker
sudo systemctl restart docker

# Verify registry still works
docker ps | grep registry
```

---

## 🥧 Raspberry Pi Node Setup

### Step 1: Flash SD Cards

**Use Raspberry Pi Imager** (easiest method):

1. Download: https://www.raspberrypi.com/software/
2. Choose OS: **Ubuntu Server 22.04.3 LTS (64-bit)**
3. Choose Storage: Your SD card
4. Click ⚙️ (Settings):
   - Set hostname: `pi-node-1` (increment for each Pi)
   - Enable SSH
   - Set username: `ubuntu` / password: `raspberry`
   - Configure WiFi (optional, wired is better)
5. Write image
6. Repeat for all 4 SD cards

### Step 2: Initial Boot & SSH

```bash
# Insert SD card and boot Pi
# Wait 2-3 minutes for first boot

# SSH from master node
ssh ubuntu@192.168.1.11

# First login will prompt password change
# New password: <your-password>
```

### Step 3: Configure Each Pi

Run these commands **on each Raspberry Pi**:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Configure insecure registry
sudo nano /etc/docker/daemon.json
```

Add:

```json
{
  "insecure-registries": ["192.168.1.10:5000"]
}
```

```bash
# Restart Docker
sudo systemctl restart docker

# Disable swap (required for Kubernetes)
sudo swapoff -a
sudo sed -i '/ swap / s/^/#/' /etc/fstab

# Enable cgroup memory
sudo nano /boot/firmware/cmdline.txt
# Add to end of line (single line):
# cgroup_enable=cpuset cgroup_enable=memory cgroup_memory=1
```

**Reboot**:

```bash
sudo reboot
```

### Step 4: Install K3s on Raspberry Pis

**On Master Node**: Install K3s server (control plane)

```bash
# Install K3s with Docker runtime
curl -sfL https://get.k3s.io | sh -s - \
  --docker \
  --write-kubeconfig-mode 644 \
  --disable traefik \
  --node-ip 192.168.1.10

# Get node token (you'll need this for worker nodes)
sudo cat /var/lib/rancher/k3s/server/node-token

# Example output: K10abc123def456...::server:789xyz
```

**On Each Pi Node**: Join as K3s agent (worker)

```bash
# Replace <TOKEN> with token from master
# Replace 192.168.1.10 with your master IP
curl -sfL https://get.k3s.io | K3S_URL=https://192.168.1.10:6443 \
  K3S_TOKEN=<TOKEN> \
  sh -s - agent --docker

# Verify node joined
# (run on master)
kubectl get nodes
```

Expected output:

```
NAME         STATUS   ROLES                  AGE   VERSION
master       Ready    control-plane,master   5m    v1.28.x+k3s1
pi-node-1    Ready    <none>                 2m    v1.28.x+k3s1
pi-node-2    Ready    <none>                 2m    v1.28.x+k3s1
pi-node-3    Ready    <none>                 2m    v1.28.x+k3s1
pi-node-4    Ready    <none>                 2m    v1.28.x+k3s1
```

---

## 🏗️ Building ARM Images

### Why ARM Images?

Raspberry Pi 3 B+ uses **ARMv7 (32-bit ARM)** architecture. Standard Docker images are built for **x86_64/AMD64**. We must build ARM-compatible images.

### Step 1: Clone Repository on Master Node

```bash
# On master node
cd ~
git clone https://github.com/Nacnano/sds-final-project.git
cd sds-final-project
```

### Step 2: Install Dependencies

```bash
# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install pnpm
npm install -g pnpm

# Install project dependencies
pnpm install

# Install frontend dependencies
cd frontend
pnpm install
cd ..
```

### Step 3: Configure Registry IP

Edit `k8s/build-arm.ps1` (if on Windows) or `k8s/build-arm.sh` (if on Linux):

```bash
nano k8s/build-arm.sh
```

Change:

```bash
REGISTRY="192.168.1.10:5000"  # Your master node IP
```

### Step 4: Build ARM Images

**On Linux/Mac**:

```bash
cd k8s
chmod +x build-arm.sh
./build-arm.sh
```

**On Windows** (PowerShell):

```powershell
cd k8s
.\build-arm.ps1
```

This will:

1. Set up Docker buildx for multi-platform builds
2. Build images for `linux/arm/v7` platform
3. Push images to registry at `192.168.1.10:5000`

Expected output:

```
Building ARM Images for Raspberry Pi
=====================================
Using registry: 192.168.1.10:5000
Building for platform: linux/arm/v7

Step 1/4: Building Shrine Service...
✓ shrine-service built and pushed successfully

Step 2/4: Building Location Service...
✓ location-service built and pushed successfully

Step 3/4: Building API Gateway...
✓ api-gateway built and pushed successfully

Step 4/4: Building Frontend...
✓ frontend built and pushed successfully

Images available at:
  - 192.168.1.10:5000/shrine-service:latest
  - 192.168.1.10:5000/location-service:latest
  - 192.168.1.10:5000/api-gateway:latest
  - 192.168.1.10:5000/frontend:latest
```

### Step 5: Verify Images in Registry

```bash
# Check registry contents
curl http://192.168.1.10:5000/v2/_catalog

# Expected output:
# {"repositories":["api-gateway","frontend","location-service","shrine-service"]}

# Test pulling from Pi
# (SSH to any Pi)
ssh ubuntu@192.168.1.11
docker pull 192.168.1.10:5000/shrine-service:latest
```

---

## ☸️ Kubernetes Cluster Setup

### Step 1: Update Kubernetes Manifests for ARM/Registry

We need to update image references to use your registry. The project needs modifications to work with Raspberry Pi.

**Create a deployment script** `k8s/deploy-pi.sh`:

```bash
nano k8s/deploy-pi.sh
```

Add:

```bash
#!/bin/bash

# Deploy to Raspberry Pi Kubernetes Cluster
# This script updates image references for local registry

REGISTRY="192.168.1.10:5000"

echo "=========================================="
echo "Deploying to Raspberry Pi Cluster"
echo "=========================================="
echo ""

# Step 1: Create namespace
echo "Creating namespace..."
kubectl apply -f namespace.yaml

# Step 2: Create secrets and configmap
echo "Creating secrets and configmap..."
kubectl apply -f secrets.yaml
kubectl apply -f configmap.yaml

# Step 3: Deploy databases
echo "Deploying databases..."
kubectl apply -f shrine-db.yaml
kubectl apply -f rabbitmq.yaml

# Wait for databases
echo "Waiting for databases to be ready..."
kubectl wait --for=condition=ready pod -l app=shrine-db -n microservices --timeout=300s
kubectl wait --for=condition=ready pod -l app=rabbitmq -n microservices --timeout=300s

# Step 4: Deploy services with registry images
echo "Deploying services..."

# Update image references on-the-fly
cat location-service.yaml | \
  sed "s|image: location-service:latest|image: ${REGISTRY}/location-service:latest|g" | \
  sed "s|imagePullPolicy: Never|imagePullPolicy: Always|g" | \
  kubectl apply -f -

cat shrine-service.yaml | \
  sed "s|image: shrine-service:latest|image: ${REGISTRY}/shrine-service:latest|g" | \
  sed "s|imagePullPolicy: Never|imagePullPolicy: Always|g" | \
  kubectl apply -f -

cat api-gateway.yaml | \
  sed "s|image: api-gateway:latest|image: ${REGISTRY}/api-gateway:latest|g" | \
  sed "s|image: frontend:latest|image: ${REGISTRY}/frontend:latest|g" | \
  sed "s|imagePullPolicy: Never|imagePullPolicy: Always|g" | \
  kubectl apply -f -

echo ""
echo "=========================================="
echo "Deployment initiated!"
echo "=========================================="
echo ""
echo "Check status with:"
echo "  kubectl get pods -n microservices"
echo "  kubectl get svc -n microservices"
echo ""
echo "Access application at:"
echo "  http://192.168.1.10:30000 (API Gateway)"
echo "  http://192.168.1.10:30002 (Frontend)"
```

Make executable:

```bash
chmod +x k8s/deploy-pi.sh
```

### Step 2: Deploy Application

```bash
cd ~/sds-final-project/k8s
./deploy-pi.sh
```

### Step 3: Monitor Deployment

```bash
# Watch pods starting
kubectl get pods -n microservices -w

# Check all resources
kubectl get all -n microservices

# View pod logs
kubectl logs -f -n microservices -l app=shrine-service

# Describe pod for troubleshooting
kubectl describe pod -n microservices <pod-name>
```

Expected output (after ~5 minutes):

```
NAME                                READY   STATUS    RESTARTS   AGE
pod/shrine-db-xxxxx                 1/1     Running   0          5m
pod/rabbitmq-xxxxx                  1/1     Running   0          5m
pod/location-service-xxxxx          1/1     Running   0          3m
pod/shrine-service-xxxxx            1/1     Running   0          3m
pod/api-gateway-xxxxx               1/1     Running   0          2m
pod/api-gateway-yyyyy               1/1     Running   0          2m
pod/api-gateway-zzzzz               1/1     Running   0          2m
pod/frontend-xxxxx                  1/1     Running   0          2m
pod/frontend-yyyyy                  1/1     Running   0          2m
```

---

## 🚀 Application Deployment

### Step 1: Seed Database

Once pods are running, seed the shrine database:

```bash
# Port-forward to shrine-db
kubectl port-forward -n microservices svc/shrine-db 5432:5432 &

# Run seed script (from project root)
cd ~/sds-final-project
node tools/scripts/seed-all-databases.js
```

Or manually seed via SQL:

```bash
# Get shrine-db pod name
kubectl get pods -n microservices -l app=shrine-db

# Exec into pod
kubectl exec -it -n microservices <shrine-db-pod> -- psql -U postgres -d shrine_service

# Insert sample data
INSERT INTO shrines (id, name, description, location, lat, lng, category, image_url, created_at, updated_at)
VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Erawan Shrine', 'Famous shrine in Bangkok', 'Bangkok', 13.7445, 100.5401, 'wealth', 'https://example.com/erawan.jpg', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440002', 'Golden Mount', 'Historic temple with panoramic views', 'Bangkok', 13.7548, 100.5058, 'spiritual', 'https://example.com/golden.jpg', NOW(), NOW());
```

### Step 2: Access Application

**Frontend**: http://192.168.1.10:30002  
**API Gateway**: http://192.168.1.10:30000

Test API:

```bash
# Get all shrines
curl http://192.168.1.10:30000/shrines

# Get specific shrine
curl http://192.168.1.10:30000/shrines/<shrine-id>

# Test location service
curl http://192.168.1.10:30000/location/coordinates?location=Bangkok
```

### Step 3: Verify Multi-Container Request Path

Enable debug logging to trace requests:

```bash
# View API Gateway logs
kubectl logs -f -n microservices -l app=api-gateway | grep "Request"

# View Shrine Service logs (shows gRPC calls to location)
kubectl logs -f -n microservices -l app=shrine-service | grep "location"

# View Location Service logs
kubectl logs -f -n microservices -l app=location-service
```

Make a request and observe logs:

```bash
curl http://192.168.1.10:30000/shrines
```

You should see logs showing:

1. API Gateway receives HTTP request
2. API Gateway calls Shrine Service via gRPC
3. Shrine Service calls Location Service via gRPC
4. Location Service returns coordinates
5. Shrine Service returns data
6. API Gateway returns JSON response

---

## ✅ Testing & Verification

### Test 1: Application Functionality

```bash
# Test 1: Browse all shrines
curl http://192.168.1.10:30000/shrines

# Test 2: Get shrine by ID
curl http://192.168.1.10:30000/shrines/550e8400-e29b-41d4-a716-446655440001

# Test 3: Location coordinates
curl http://192.168.1.10:30000/location/coordinates?location=Bangkok

# Test 4: Distance calculation
curl "http://192.168.1.10:30000/location/distance?origin=Bangkok&destination=Chiang%20Mai"

# Test 5: Frontend access
curl http://192.168.1.10:30002
```

### Test 2: Container Dependency Chain

**Requirement**: Each request must be serviced by 2+ containers.

**Verification Method 1**: Log tracing

```bash
# Terminal 1: API Gateway logs
kubectl logs -f -n microservices -l app=api-gateway

# Terminal 2: Shrine Service logs
kubectl logs -f -n microservices -l app=shrine-service

# Terminal 3: Location Service logs
kubectl logs -f -n microservices -l app=location-service

# Terminal 4: Make request
curl http://192.168.1.10:30000/shrines
```

Observe logs showing request flowing through all 3 services.

**Verification Method 2**: Network policy test

```bash
# Check service dependencies
kubectl get svc -n microservices

# Verify API Gateway can reach Shrine Service
kubectl exec -n microservices -it <api-gateway-pod> -- curl shrine-service:5001

# Verify Shrine Service can reach Location Service
kubectl exec -n microservices -it <shrine-service-pod> -- curl location-service:5006
```

### Test 3: Fault Tolerance

**Requirement**: Application continues working if a single node goes offline.

**Test Scenario 1**: Kill a pod manually

```bash
# Delete an API Gateway pod (we have 3 replicas)
kubectl get pods -n microservices -l app=api-gateway
kubectl delete pod -n microservices <api-gateway-pod-name>

# Immediately test application (should still work)
curl http://192.168.1.10:30000/shrines

# Watch new pod being created automatically
kubectl get pods -n microservices -l app=api-gateway -w
```

**Test Scenario 2**: Simulate node failure (Demo Day simulation)

```bash
# Before: Check which pods are on which nodes
kubectl get pods -n microservices -o wide

# Unplug a Raspberry Pi (e.g., pi-node-2)
# OR drain the node
kubectl drain pi-node-2 --ignore-daemonsets --delete-emptydir-data

# Watch pods being rescheduled to other nodes
kubectl get pods -n microservices -o wide -w

# Test application (should still work after ~30 seconds)
while true; do curl -s http://192.168.1.10:30000/shrines | jq '.[] | .name' && sleep 2; done

# Restore node
kubectl uncordon pi-node-2
```

**Test Scenario 3**: Stress test with load

```bash
# Install apache bench
sudo apt install apache2-utils

# Send 1000 requests with 10 concurrent connections
ab -n 1000 -c 10 http://192.168.1.10:30000/shrines

# Monitor during load
kubectl top pods -n microservices
kubectl get hpa -n microservices -w
```

### Test 4: Horizontal Pod Autoscaling

```bash
# Check HPA status
kubectl get hpa -n microservices

# Generate load
ab -n 5000 -c 50 http://192.168.1.10:30000/shrines

# Watch pods scaling up
kubectl get hpa -n microservices -w
kubectl get pods -n microservices -w
```

---

## 📝 Demo Day Checklist

### Before Demo (Setup Phase)

- [ ] All 4 Raspberry Pis powered on and connected to router
- [ ] Master node (laptop) connected to same network
- [ ] Verify all nodes: `kubectl get nodes` (5 total: 1 master + 4 workers)
- [ ] All pods running: `kubectl get pods -n microservices` (no Pending/CrashLoop)
- [ ] Docker registry running: `docker ps | grep registry`
- [ ] Frontend accessible: http://192.168.1.10:30002
- [ ] API accessible: `curl http://192.168.1.10:30000/shrines`
- [ ] Prepare 3 terminal windows:
  - Terminal 1: `kubectl get pods -n microservices -w`
  - Terminal 2: `curl` test commands
  - Terminal 3: Pod logs

### Demo Script (15 minutes)

#### Part 1: Show Cluster Setup (2 minutes)

```bash
# Show all nodes in cluster
kubectl get nodes -o wide

# Show all running pods
kubectl get pods -n microservices -o wide

# Show services and NodePorts
kubectl get svc -n microservices
```

**Explain**: We have 5 nodes total - 1 master (laptop) and 4 Raspberry Pi workers running our microservices.

#### Part 2: Demonstrate Application (3 minutes)

```bash
# Show frontend in browser
# Open: http://192.168.1.10:30002
```

**Demo**:

1. Browse shrines page
2. Click on a shrine to see details
3. Show map/coordinates feature

```bash
# Show API working
curl http://192.168.1.10:30000/shrines | jq '.'

# Get specific shrine
curl http://192.168.1.10:30000/shrines/<shrine-id> | jq '.'
```

**Explain**: Frontend calls API Gateway which orchestrates calls to backend services.

#### Part 3: Prove Container Dependency Chain (5 minutes)

```bash
# Terminal 1: Watch all pod logs
kubectl logs -f -n microservices -l app=api-gateway | grep "GET /shrines"

# Terminal 2: Watch shrine service
kubectl logs -f -n microservices -l app=shrine-service | grep "location"

# Terminal 3: Make request
curl http://192.168.1.10:30000/shrines
```

**Explain while showing logs**:

1. Request hits API Gateway (container 1)
2. API Gateway calls Shrine Service via gRPC (container 2)
3. Shrine Service calls Location Service to validate coordinates (container 3)
4. Response flows back through chain

**Diagram on whiteboard**:

```
Client → API Gateway → Shrine Service → Location Service
         (Pod 1)        (Pod 2)          (Pod 3)
                                          ↓
                                     PostgreSQL
                                     (Pod 4)
```

**Alternative proof**: Show network calls

```bash
# Exec into API Gateway pod
kubectl exec -it -n microservices <api-gateway-pod> -- sh

# Inside pod: test connectivity to shrine service
curl shrine-service:5001
# (will show gRPC requires POST, proving connectivity)

exit

# Exec into Shrine Service
kubectl exec -it -n microservices <shrine-service-pod> -- sh

# Inside pod: test connectivity to location service
curl location-service:5006
# (will show gRPC requires POST, proving connectivity)

exit
```

#### Part 4: Demonstrate Fault Tolerance (5 minutes)

**Instructor picks a random Raspberry Pi to unplug**

```bash
# Before unplugging - show pod distribution
kubectl get pods -n microservices -o wide

# Note which pods are on the selected Pi (e.g., pi-node-3)
# Example output:
# api-gateway-abc123    pi-node-3
# location-service-xyz  pi-node-3
```

**Instructor unplugs the chosen Pi**

```bash
# Watch pods being evicted and rescheduled
kubectl get pods -n microservices -o wide -w

# You'll see:
# 1. Pods on failed node go to "Unknown" or "Terminating"
# 2. New pods are created automatically
# 3. New pods scheduled to healthy nodes
# 4. New pods start running
```

**Meanwhile, continuously test application**:

```bash
# Keep making requests (show application recovering)
while true; do
  echo "Testing at $(date):"
  curl -s http://192.168.1.10:30000/shrines | jq '.[0].name' || echo "FAILED"
  sleep 3
done

# Output should show:
# - First few requests: May fail (during rescheduling)
# - After ~30 seconds: Success (new pods running)
```

**Explain**:

- Kubernetes detected node failure
- Automatically rescheduled pods to healthy nodes
- Application recovered without manual intervention
- This is the fault tolerance requirement ✓

```bash
# After recovery, show new pod locations
kubectl get pods -n microservices -o wide

# Show the failed node
kubectl get nodes
# (one node will show "NotReady")
```

**Plug the Pi back in**:

```bash
# Watch node come back
kubectl get nodes -w

# Node will transition: NotReady → Ready
```

### Post-Demo Cleanup

```bash
# Delete application
kubectl delete namespace microservices

# Stop K3s on master
sudo systemctl stop k3s

# Stop K3s on each Pi (SSH to each)
ssh ubuntu@192.168.1.11
sudo systemctl stop k3s-agent
exit
# Repeat for all Pi nodes

# Flash Raspberry Pis with default Raspbian
# Use Raspberry Pi Imager to flash Raspberry Pi OS

# Factory reset router
# Press reset button for 10 seconds
```

---

## 🔧 Troubleshooting

### Issue 1: Pods stuck in "ImagePullBackOff"

**Cause**: Cannot pull images from registry

**Solution**:

```bash
# Check registry is running on master
docker ps | grep registry

# Test registry from Pi
ssh ubuntu@192.168.1.11
docker pull 192.168.1.10:5000/shrine-service:latest

# If fails, check insecure registry config
cat /etc/docker/daemon.json
# Should have: {"insecure-registries": ["192.168.1.10:5000"]}

# Restart Docker
sudo systemctl restart docker

# Check firewall
sudo ufw status
sudo ufw allow 5000/tcp
```

### Issue 2: Pods stuck in "Pending"

**Cause**: Not enough resources on nodes

**Solution**:

```bash
# Check node resources
kubectl describe nodes | grep -A 5 "Allocated resources"

# Check pod resource requests
kubectl describe pod -n microservices <pod-name> | grep -A 5 "Requests"

# Reduce resource requests in YAML files
# Edit api-gateway.yaml, shrine-service.yaml, location-service.yaml
# Change:
#   requests:
#     memory: '256Mi' → '128Mi'
#     cpu: '250m' → '100m'
```

### Issue 3: Pods crash with "OOMKilled"

**Cause**: Out of memory (Pis have only 1GB RAM)

**Solution**:

```bash
# Reduce memory limits
# Edit YAML files:
#   limits:
#     memory: '512Mi' → '256Mi'

# Reduce number of replicas
kubectl scale deployment -n microservices api-gateway --replicas=2

# Check memory usage
kubectl top nodes
kubectl top pods -n microservices
```

### Issue 4: Cannot access NodePort services

**Cause**: Firewall or wrong IP

**Solution**:

```bash
# Check service endpoints
kubectl get svc -n microservices

# Check NodePort is allocated
kubectl describe svc -n microservices api-gateway

# Test from master node
curl http://192.168.1.10:30000/shrines

# Test from outside network
# Make sure you're using master node IP, not Pi IP

# Check firewall rules
sudo ufw status
sudo ufw allow 30000:30010/tcp
```

### Issue 5: Nodes show "NotReady"

**Cause**: K3s agent not running or network issues

**Solution**:

```bash
# SSH to node
ssh ubuntu@192.168.1.11

# Check K3s agent status
sudo systemctl status k3s-agent

# Restart if stopped
sudo systemctl restart k3s-agent

# Check logs
sudo journalctl -u k3s-agent -n 50

# Verify network to master
ping 192.168.1.10
curl -k https://192.168.1.10:6443
```

### Issue 6: Database connection errors

**Cause**: Shrine service cannot reach database

**Solution**:

```bash
# Check if shrine-db pod is running
kubectl get pods -n microservices -l app=shrine-db

# Check shrine-db service
kubectl get svc -n microservices shrine-db

# Test DNS resolution from shrine-service pod
kubectl exec -it -n microservices <shrine-service-pod> -- sh
nslookup shrine-db.microservices.svc.cluster.local
ping shrine-db
exit

# Check database logs
kubectl logs -n microservices -l app=shrine-db

# Verify credentials in secrets
kubectl get secret -n microservices microservices-secrets -o jsonpath='{.data.DATABASE_PASSWORD}' | base64 -d
```

### Issue 7: gRPC connection failures

**Cause**: Service-to-service communication broken

**Solution**:

```bash
# Check all services are running
kubectl get svc -n microservices

# Test from API Gateway to Shrine Service
kubectl exec -it -n microservices <api-gateway-pod> -- sh
nc -zv shrine-service 5001
exit

# Check environment variables
kubectl exec -n microservices <api-gateway-pod> -- env | grep SERVICE_URL

# Verify configmap
kubectl get configmap -n microservices microservices-config -o yaml
```

### Issue 8: Build fails with "no space left on device"

**Cause**: SD card full

**Solution**:

```bash
# Check disk usage
df -h

# Clean Docker
docker system prune -a -f
docker volume prune -f

# Clean Kubernetes
kubectl delete pods --field-selector status.phase=Failed -A

# If building on Pi, use master node instead
```

---

## 📚 Additional Resources

### Useful Commands

```bash
# View all resources in namespace
kubectl get all -n microservices

# Watch pod status
kubectl get pods -n microservices -w

# Get pod logs
kubectl logs -n microservices <pod-name>
kubectl logs -n microservices -l app=api-gateway -f

# Describe resource for debugging
kubectl describe pod -n microservices <pod-name>
kubectl describe node pi-node-1

# Execute command in pod
kubectl exec -it -n microservices <pod-name> -- sh

# Port forward for local testing
kubectl port-forward -n microservices svc/api-gateway 3000:3000

# Scale deployment
kubectl scale deployment -n microservices api-gateway --replicas=5

# Update deployment (rolling update)
kubectl set image deployment/api-gateway -n microservices api-gateway=192.168.1.10:5000/api-gateway:v2

# Check resource usage
kubectl top nodes
kubectl top pods -n microservices

# View HPA status
kubectl get hpa -n microservices
kubectl describe hpa -n microservices api-gateway-hpa

# Drain node (move pods to other nodes)
kubectl drain pi-node-1 --ignore-daemonsets --delete-emptydir-data

# Uncordon node (allow scheduling again)
kubectl uncordon pi-node-1

# Delete namespace (removes everything)
kubectl delete namespace microservices
```

### Architecture Diagrams Location

- `tools/diagram/context_diagram.puml` - System context
- `tools/diagram/container_diagram.puml` - Container architecture
- `tools/diagram/component_diagram.puml` - Component details

### Testing Scripts

- `testing/scripts/k6-load-test.js` - Load testing
- `testing/scripts/k6-stress-test.js` - Stress testing

### Documentation Files

- `README.md` - Project overview
- `DEVELOPMENT.md` - Local development guide
- `k8s/README.md` - Kubernetes deployment (Docker Desktop)
- `DEPLOYMENT_SUMMARY.md` - Deployment architecture

---

## ✅ Final Checklist

### Pre-Demo Verification

- [ ] All 5 nodes showing "Ready": `kubectl get nodes`
- [ ] All pods showing "Running": `kubectl get pods -n microservices`
- [ ] No pods in CrashLoopBackOff or Error state
- [ ] Frontend accessible: http://192.168.1.10:30002
- [ ] API returning data: `curl http://192.168.1.10:30000/shrines`
- [ ] Database populated with sample shrines
- [ ] All Raspberry Pis have labels on them (node-1, node-2, etc.)
- [ ] Ethernet cables secure
- [ ] Power adapters connected to surge protector
- [ ] Laptop/master node fully charged

### During Demo Preparation

- [ ] Terminal windows ready:
  - `kubectl get pods -n microservices -w`
  - `kubectl logs -f -n microservices -l app=api-gateway`
  - Spare terminal for commands
- [ ] Browser open to frontend (http://192.168.1.10:30002)
- [ ] Sample curl commands in a text file for copy-paste
- [ ] Pod distribution noted: `kubectl get pods -n microservices -o wide`
- [ ] HPA visible: `kubectl get hpa -n microservices`

### Post-Demo

- [ ] Sign in and return equipment
- [ ] Flash all Raspberry Pis with default Raspbian OS
- [ ] Factory reset router
- [ ] Clean up GitHub repo (make public if desired)
- [ ] Celebrate! 🎉

---

## 🎓 How This Project Meets All Requirements

| Requirement                 | Implementation                                          | Verification Command                |
| --------------------------- | ------------------------------------------------------- | ----------------------------------- |
| **4+ Raspberry Pis**        | 4 Raspberry Pi 3 B+ as worker nodes                     | `kubectl get nodes`                 |
| **Laptop as Master**        | Ubuntu VM/WSL2 as K3s control plane                     | `kubectl get nodes`                 |
| **3+ Containers**           | API Gateway, Shrine Service, Location Service, Frontend | `kubectl get pods -n microservices` |
| **Distinct Services**       | API layer, business logic, coordinate validation, UI    | Architecture diagram                |
| **2+ Container Dependency** | Client→Gateway→Shrine→Location→DB                       | Log tracing during request          |
| **Fault Tolerance**         | K8s ReplicaSets + automatic pod rescheduling            | Unplug Pi, observe recovery         |
| **Logical Architecture**    | Microservices with clear separation of concerns         | Code structure review               |
| **Automatic Deployment**    | `kubectl apply` from GitHub manifests                   | Run deployment script               |
| **Demo Ready**              | All components in GitHub, documented setup              | Follow this guide                   |

---

## 📞 Contact

**GitHub Repository**: https://github.com/Nacnano/sds-final-project

**Issues**: Please report in GitHub Issues

**Instructor**: Kunwadee Sripanidkulchai, Ph.D. (kunwadee@cp.eng.chula.ac.th)

---

**Good luck with your demo! 🚀**
