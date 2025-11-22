# Raspberry Pi Kubernetes Cluster Setup Guide

## Hardware Requirements

- **4x Raspberry Pi 3 B+** (one per team member)
  - 1GB RAM each
  - ARMv7 (32-bit ARM) architecture
  - SD Card (minimum 16GB, Class 10 recommended)
  - Power adapters
  - Ethernet cables
- **1x TP-Link TL-WR841N Router**
- **1x Laptop/Desktop** (as Kubernetes Master/Control Plane)
  - Ubuntu VM with at least 2 CPU cores recommended
- **Ethernet adapters** as needed

## Network Topology

```
                    Internet
                        |
                   [Router]
                   192.168.1.1
                        |
        +---------------+---------------+
        |               |               |
   [Master Node]    [Pi Node 1]    [Pi Node 2]
   192.168.1.10     192.168.1.11   192.168.1.12
                        |               |
                   [Pi Node 3]     [Pi Node 4]
                   192.168.1.13    192.168.1.14
```

## Step 1: Router Setup

1. **Connect router to power**
2. **Configure router** (connect via Ethernet or WiFi):
   - Access router admin: http://192.168.1.1
   - Username: admin, Password: admin (default)
   - Set static IPs or note DHCP assignments
   - Enable wired connections for all Pis (more stable than WiFi)

3. **Recommended settings**:
   - DHCP range: 192.168.1.100-192.168.1.200
   - Reserve IPs for Master and Pis (192.168.1.10-14)

## Step 2: Raspberry Pi Initial Setup

### On Each Raspberry Pi:

1. **Flash SD Card with Ubuntu Server 22.04 LTS (64-bit ARM)**:

   ```bash
   # Download from: https://ubuntu.com/download/raspberry-pi
   # Use Raspberry Pi Imager or balenaEtcher
   # Choose: Ubuntu Server 22.04 LTS (64-bit)
   ```

2. **Enable SSH** (add empty file named `ssh` to boot partition)

3. **Configure WiFi** (if using wireless - not recommended):
   Edit `network-config` on boot partition:

   ```yaml
   wifis:
     wlan0:
       dhcp4: true
       optional: true
       access-points:
         'YourSSID':
           password: 'YourPassword'
   ```

4. **Boot Raspberry Pi and SSH in**:

   ```bash
   ssh ubuntu@192.168.1.11  # Default password: ubuntu
   # You'll be prompted to change password on first login
   ```

5. **Update system**:

   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

6. **Set hostname** (for easier identification):
   ```bash
   # On Pi 1:
   sudo hostnamectl set-hostname pi-node-1
   # Repeat for pi-node-2, pi-node-3, pi-node-4
   ```

## Step 3: Docker Installation (On Each Pi)

```bash
# Install Docker on each Raspberry Pi
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add ubuntu user to docker group
sudo usermod -aG docker ubuntu

# Start Docker on boot
sudo systemctl enable docker
sudo systemctl start docker

# Verify Docker is working
docker --version
docker run hello-world
```

## Step 4: Kubernetes Installation (All Nodes)

### On Master Node (Your Laptop/Ubuntu VM) AND All Raspberry Pis:

```bash
# Disable swap (Kubernetes requirement)
sudo swapoff -a
sudo sed -i '/ swap / s/^\(.*\)$/#\1/g' /etc/fstab

# For Raspberry Pi specifically:
sudo dphys-swapfile swapoff
sudo dphys-swapfile uninstall
sudo update-rc.d dphys-swapfile remove
sudo systemctl disable dphys-swapfile.service

# Install dependencies
sudo apt-get update
sudo apt-get install -y apt-transport-https ca-certificates curl

# Add Kubernetes GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.28/deb/Release.key | sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg

# Add Kubernetes repository
echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.28/deb/ /' | sudo tee /etc/apt/sources.list.d/kubernetes.list

# Install Kubernetes components
sudo apt-get update
sudo apt-get install -y kubelet kubeadm kubectl
sudo apt-mark hold kubelet kubeadm kubectl

# Enable kubelet
sudo systemctl enable kubelet
```

## Step 5: Initialize Kubernetes Master

### On Master Node ONLY (Your Laptop):

```bash
# Initialize the cluster
sudo kubeadm init --pod-network-cidr=10.244.0.0/16 --apiserver-advertise-address=192.168.1.10

# IMPORTANT: Save the output! You'll need the join command that looks like:
# kubeadm join 192.168.1.10:6443 --token <token> --discovery-token-ca-cert-hash sha256:<hash>

# Set up kubectl for your user
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config

# Verify master is running
kubectl get nodes
# Should show: master node in "NotReady" state (needs CNI)
```

## Step 6: Install Container Network Interface (CNI)

### On Master Node:

```bash
# Install Flannel CNI (lightweight, good for ARM)
kubectl apply -f https://raw.githubusercontent.com/flannel-io/flannel/master/Documentation/kube-flannel.yml

# Wait for Flannel pods to be ready
kubectl get pods -n kube-flannel -w

# Verify master is now Ready
kubectl get nodes
# Should show: master node in "Ready" state
```

## Step 7: Join Worker Nodes (Raspberry Pis)

### On Each Raspberry Pi:

```bash
# Use the join command from Step 5 output
# Example (use YOUR actual token and hash):
sudo kubeadm join 192.168.1.10:6443 \
  --token abcdef.0123456789abcdef \
  --discovery-token-ca-cert-hash sha256:1234567890abcdef...

# Wait for node to join (takes 30-60 seconds)
```

### On Master Node (verify):

```bash
# Check all nodes joined
kubectl get nodes

# Should show:
# NAME        STATUS   ROLES           AGE   VERSION
# master      Ready    control-plane   5m    v1.28.x
# pi-node-1   Ready    <none>          2m    v1.28.x
# pi-node-2   Ready    <none>          2m    v1.28.x
# pi-node-3   Ready    <none>          2m    v1.28.x
# pi-node-4   Ready    <none>          2m    v1.28.x
```

## Step 8: Label Nodes (Optional but Recommended)

```bash
# Label nodes for identification
kubectl label node pi-node-1 node-role.kubernetes.io/worker=worker
kubectl label node pi-node-2 node-role.kubernetes.io/worker=worker
kubectl label node pi-node-3 node-role.kubernetes.io/worker=worker
kubectl label node pi-node-4 node-role.kubernetes.io/worker=worker

# Add custom labels for demo
kubectl label node pi-node-1 demo-role=database
kubectl label node pi-node-2 demo-role=services
kubectl label node pi-node-3 demo-role=services
kubectl label node pi-node-4 demo-role=gateway
```

## Step 9: Set Up Local Docker Registry

### On Master Node:

```bash
# Run a local Docker registry
docker run -d -p 5000:5000 --restart=always --name registry registry:2

# Verify registry is running
curl http://localhost:5000/v2/_catalog
# Should return: {"repositories":[]}

# Configure insecure registry on ALL nodes (Master + Pis)
# Edit /etc/docker/daemon.json on each node:
sudo nano /etc/docker/daemon.json
```

Add this content:

```json
{
  "insecure-registries": ["192.168.1.10:5000"]
}
```

```bash
# Restart Docker on each node
sudo systemctl restart docker

# Verify on master
docker info | grep -A 5 "Insecure Registries"
```

## Step 10: Install Metrics Server (for HPA)

```bash
# Download metrics server manifest
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# Patch metrics server for insecure TLS (required for local cluster)
kubectl patch deployment metrics-server -n kube-system --type='json' -p='[
  {
    "op": "add",
    "path": "/spec/template/spec/containers/0/args/-",
    "value": "--kubelet-insecure-tls"
  }
]'

# Wait for metrics server to be ready
kubectl get pods -n kube-system | grep metrics-server

# Verify metrics are available (may take 1-2 minutes)
kubectl top nodes
```

## Step 11: Verify Cluster is Ready

```bash
# Check all nodes
kubectl get nodes -o wide

# Check all system pods
kubectl get pods -n kube-system

# Check cluster info
kubectl cluster-info

# Test pod scheduling on Pi nodes
kubectl run test-nginx --image=nginx:alpine --restart=Never
kubectl get pods -o wide
# Should be scheduled on one of the Pi nodes

# Clean up test
kubectl delete pod test-nginx
```

## Troubleshooting

### Issue: Node stays in "NotReady" state

```bash
# Check kubelet status
sudo systemctl status kubelet
journalctl -xeu kubelet

# Common fix: Restart kubelet
sudo systemctl restart kubelet
```

### Issue: Pods stuck in "Pending" state

```bash
# Check events
kubectl describe pod <pod-name>

# Common causes:
# 1. Insufficient resources - reduce memory/CPU requests
# 2. Image pull errors - check image availability for ARM
# 3. Volume mount issues - check PersistentVolume status
```

### Issue: Can't pull images from registry

```bash
# Verify registry is accessible from Pi
curl http://192.168.1.10:5000/v2/_catalog

# Check Docker daemon.json on Pi
cat /etc/docker/daemon.json

# Test manual pull
docker pull 192.168.1.10:5000/test-image:latest
```

### Issue: Join token expired

```bash
# Generate new token on master
kubeadm token create --print-join-command
```

### Issue: High memory usage on Pi

```bash
# Check memory on Pi
free -h

# Check pod resource usage
kubectl top pods -n microservices

# Reduce pod replicas if needed
kubectl scale deployment <deployment-name> --replicas=1 -n microservices
```

## Network Testing Checklist

```bash
# From Master, ping each Pi
ping 192.168.1.11
ping 192.168.1.12
ping 192.168.1.13
ping 192.168.1.14

# From each Pi, ping Master
ping 192.168.1.10

# SSH to each Pi
ssh ubuntu@192.168.1.11
ssh ubuntu@192.168.1.12
ssh ubuntu@192.168.1.13
ssh ubuntu@192.168.1.14

# Check DNS resolution
nslookup google.com
```

## Next Steps

Once your cluster is ready:

1. Build ARM-compatible Docker images (see `k8s/build-arm.sh`)
2. Push images to local registry
3. Deploy application (see `k8s/deploy.ps1`)
4. Test fault tolerance
5. Practice demo!

## Cluster Maintenance

### Save cluster state before demo:

```bash
# Export all resources
kubectl get all -n microservices -o yaml > cluster-backup.yaml
```

### Reset a node (if needed):

```bash
# On the node to reset
sudo kubeadm reset
sudo rm -rf /etc/cni/net.d
sudo rm -rf $HOME/.kube/config

# Then rejoin with kubeadm join command
```

### Complete cluster teardown:

```bash
# On Master
kubectl drain <node-name> --delete-emptydir-data --force --ignore-daemonsets
kubectl delete node <node-name>

# On each Pi
sudo kubeadm reset
sudo reboot
```

## Demo Day Quick Start

```bash
# 1. Verify cluster health
kubectl get nodes
kubectl get pods -n microservices

# 2. Check application is running
curl http://192.168.1.10:30000/health

# 3. Open frontend
http://192.168.1.10:30002

# 4. Monitor in real-time
kubectl get pods -n microservices -w
```

Good luck! 🚀
