# Complete Setup Guide for Raspberry Pi Kubernetes Cluster

This guide walks you through setting up the Kubernetes cluster using Terraform for the สาย.mu Shrine Discovery Platform.

## Prerequisites Checklist

### Hardware

- [x] 1 Laptop/Desktop (Master node)
- [x] 4 Raspberry Pi 3 B+ with power adapters
- [x] 5 Ethernet cables
- [x] 1 TP-Link TL-WR841N Router
- [x] 4 SD cards (16GB+, Class 10) with Ubuntu Server 22.04 LTS

### Software on Your Computer

- [x] Terraform (>= 1.0)
- [x] SSH client
- [x] Git

### Network Configuration

- [x] Router: 192.168.1.1
- [x] Master: 192.168.1.10
- [x] Pi 1: 192.168.1.11
- [x] Pi 2: 192.168.1.12
- [x] Pi 3: 192.168.1.13
- [x] Pi 4: 192.168.1.14

## Step-by-Step Setup

### 1. Prepare Raspberry Pis

#### 1.1 Flash Ubuntu Server on SD Cards

```powershell
# Download Raspberry Pi Imager
# https://www.raspberrypi.com/software/

# Flash Ubuntu Server 22.04 LTS (64-bit) on each SD card
# Enable SSH during setup
```

#### 1.2 Configure Static IPs

On each Pi (after first boot via HDMI/keyboard or SSH):

```bash
# Connect via SSH
ssh ubuntu@<pi-ip>
# Default password: ubuntu (you'll be prompted to change)

# Edit netplan
sudo nano /etc/netplan/50-cloud-init.yaml
```

Add this configuration:

```yaml
network:
  version: 2
  ethernets:
    eth0:
      dhcp4: false
      addresses:
        - 192.168.1.11/24 # Change for each Pi: .11, .12, .13, .14
      gateway4: 192.168.1.1
      nameservers:
        addresses: [8.8.8.8, 8.8.4.4]
```

Apply changes:

```bash
sudo netplan apply
```

#### 1.3 Setup SSH Keys

On your laptop:

```powershell
# Generate SSH key if you don't have one
ssh-keygen -t rsa -b 4096 -f $env:USERPROFILE\.ssh\id_rsa

# Copy public key to each Pi
type $env:USERPROFILE\.ssh\id_rsa.pub | ssh ubuntu@192.168.1.11 "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
type $env:USERPROFILE\.ssh\id_rsa.pub | ssh ubuntu@192.168.1.12 "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
type $env:USERPROFILE\.ssh\id_rsa.pub | ssh ubuntu@192.168.1.13 "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
type $env:USERPROFILE\.ssh\id_rsa.pub | ssh ubuntu@192.168.1.14 "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"

# Test SSH without password
ssh ubuntu@192.168.1.11 "echo 'SSH works!'"
```

### 2. Prepare Master Node (Your Laptop)

#### 2.1 Install Ubuntu (if not already running)

Option A: Dual boot Ubuntu 22.04
Option B: Use WSL2 with Ubuntu 22.04

```powershell
# For WSL2
wsl --install -d Ubuntu-22.04
```

#### 2.2 Configure Static IP on Master

For WSL2/native Ubuntu:

```bash
# Check your network interface
ip addr

# Edit netplan (may vary based on setup)
sudo nano /etc/netplan/01-network-manager-all.yaml
```

### 3. Install Terraform

```powershell
# Windows (using Chocolatey)
choco install terraform

# Or download from https://www.terraform.io/downloads

# Verify installation
terraform --version
```

### 4. Clone and Configure Project

```powershell
# Clone repository
git clone https://github.com/Nacnano/sds-final-project.git
cd sds-final-project/terraform

# Edit terraform.tfvars
notepad terraform.tfvars
```

Update `terraform.tfvars`:

```hcl
master_ip            = "192.168.1.10"
worker_ips           = ["192.168.1.11", "192.168.1.12", "192.168.1.13", "192.168.1.14"]
ssh_user             = "ubuntu"
ssh_private_key_path = "~/.ssh/id_rsa"  # Update to your path
cluster_name         = "sai-mu-cluster"
k3s_version          = "v1.28.5+k3s1"
registry_port        = 5000
```

### 5. Run Terraform

```powershell
# Initialize Terraform
terraform init

# Preview changes
terraform plan

# Apply configuration (this will take 10-15 minutes)
terraform apply

# Type 'yes' when prompted
```

### 6. Verify Cluster

```bash
# SSH to master
ssh ubuntu@192.168.1.10

# Check nodes (should show 5 nodes: 1 master + 4 workers)
kubectl get nodes

# Expected output:
# NAME       STATUS   ROLES                  AGE   VERSION
# master     Ready    control-plane,master   5m    v1.28.5+k3s1
# pi-1       Ready    worker                 3m    v1.28.5+k3s1
# pi-2       Ready    worker                 3m    v1.28.5+k3s1
# pi-3       Ready    worker                 3m    v1.28.5+k3s1
# pi-4       Ready    worker                 3m    v1.28.5+k3s1

# Check node details
kubectl get nodes -o wide
```

### 7. Build and Deploy Application

```powershell
# On your development machine
cd k8s

# Build ARM images for Raspberry Pi
.\build-arm.ps1

# Deploy to cluster
.\deploy-pi.ps1

# Wait for pods to be ready (2-3 minutes)
kubectl get pods -n microservices --watch

# Check services
kubectl get svc -n microservices
```

### 8. Test Application

```bash
# Test API
curl http://192.168.1.10:30000/shrines

# Open frontend in browser
# http://192.168.1.10:30002
```

## Troubleshooting

### Issue: SSH Connection Failed

```powershell
# Check connectivity
ping 192.168.1.11

# Verify SSH service
ssh -v ubuntu@192.168.1.11

# Reset SSH known hosts if needed
Remove-Item $env:USERPROFILE\.ssh\known_hosts
```

### Issue: Terraform Apply Failed

```powershell
# Check Terraform logs
$env:TF_LOG="DEBUG"
terraform apply

# Destroy and retry
terraform destroy
terraform apply
```

### Issue: K3s Not Starting

```bash
# On affected node, check logs
sudo journalctl -u k3s -f          # Master
sudo journalctl -u k3s-agent -f    # Worker

# Restart service
sudo systemctl restart k3s         # Master
sudo systemctl restart k3s-agent   # Worker
```

### Issue: Worker Not Joining Cluster

```bash
# On master, get token again
sudo cat /var/lib/rancher/k3s/server/node-token

# On worker, manually join
curl -sfL https://get.k3s.io | \
  K3S_URL=https://192.168.1.10:6443 \
  K3S_TOKEN=<token> \
  sh -s - agent --docker
```

### Issue: Registry Not Accessible

```bash
# On master, check registry
docker ps | grep registry

# Restart registry
docker restart registry

# Test from worker
telnet 192.168.1.10 5000
```

## Manual Setup (If Terraform Fails)

If Terraform doesn't work, you can set up manually:

### On Master Node:

```bash
# 1. Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# 2. Setup Registry
docker run -d -p 5000:5000 --restart=always --name registry registry:2

# 3. Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install kubectl /usr/local/bin/kubectl

# 4. Install K3s
curl -sfL https://get.k3s.io | sh -s - server --docker --write-kubeconfig-mode 644

# 5. Setup kubeconfig
mkdir -p ~/.kube
sudo cp /etc/rancher/k3s/k3s.yaml ~/.kube/config
sudo chown $USER:$USER ~/.kube/config

# 6. Get token
sudo cat /var/lib/rancher/k3s/server/node-token
```

### On Each Worker Node:

```bash
# 1. Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# 2. Configure registry
sudo mkdir -p /etc/docker
echo '{"insecure-registries":["192.168.1.10:5000"]}' | sudo tee /etc/docker/daemon.json
sudo systemctl restart docker

# 3. Join cluster
curl -sfL https://get.k3s.io | \
  K3S_URL=https://192.168.1.10:6443 \
  K3S_TOKEN=<token-from-master> \
  sh -s - agent --docker
```

## Next Steps After Cluster Setup

1. **Deploy Application**: See `k8s/README_PI.md`
2. **Test Fault Tolerance**: See `DEMO_DAY_QUICK_REFERENCE.md`
3. **Monitor Cluster**: Use `kubectl top nodes` and `kubectl top pods`

## Resources

- [K3s Documentation](https://docs.k3s.io/)
- [Terraform Documentation](https://www.terraform.io/docs)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Project Documentation](../DOCUMENTATION_INDEX.md)

## Support

For project-specific issues:

- Check `RASPBERRY_PI_COMPLETE_GUIDE.md`
- Check `TROUBLESHOOTING.md`
- Ask on Discord

For course requirements:

- Verify with `DEMO_DAY_QUICK_REFERENCE.md`
