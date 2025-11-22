# Quick Start - Raspberry Pi Kubernetes Cluster Setup

## For Instructor/TA Quick Validation ⚡

This Terraform setup automates the entire cluster deployment for the สาย.mu project.

### Prerequisites (5 minutes)

1. **All Raspberry Pis must have:**
   - Ubuntu Server 22.04 LTS installed
   - Static IPs configured (192.168.1.11-14)
   - SSH enabled with password or key authentication

2. **Master node (your laptop) must have:**
   - Terraform installed
   - SSH client
   - Network connectivity to all Pis

### Quick Setup (10 minutes)

```powershell
# 1. Navigate to terraform directory
cd terraform

# 2. Copy and edit configuration
Copy-Item terraform.tfvars.example terraform.tfvars
notepad terraform.tfvars  # Update IPs and SSH settings

# 3. Run automated setup
.\setup.ps1 -Action apply -AutoApprove

# 4. Verify cluster
.\setup.ps1 -Action verify
```

### What This Does

The Terraform configuration automatically:

- ✅ Installs Docker on all nodes
- ✅ Sets up Docker registry on master (port 5000)
- ✅ Installs kubectl on master
- ✅ Initializes K3s master node
- ✅ Joins all 4 Raspberry Pis as workers
- ✅ Configures networking and labels

### Expected Output

After ~10-15 minutes, you should see:

```
Apply complete! Resources: X added, 0 changed, 0 destroyed.

Outputs:
cluster_info = {
  "master_ip" = "192.168.1.10"
  "worker_ips" = ["192.168.1.11", ...]
  "registry_url" = "192.168.1.10:5000"
}
```

Verify with:

```bash
ssh ubuntu@192.168.1.10
kubectl get nodes
# Should show 5 nodes: 1 master + 4 workers, all Ready
```

### Next Steps

1. **Build ARM images** - `cd ..\k8s; .\build-arm.ps1`
2. **Deploy application** - `.\deploy-pi.ps1`
3. **Test application** - Open http://192.168.1.10:30002

### Course Requirements Verification ✓

- [x] 4+ Raspberry Pi nodes (configured as workers)
- [x] 1 master node (laptop/desktop)
- [x] Kubernetes cluster with K3s
- [x] Automated deployment via Terraform
- [x] Reproducible infrastructure as code

### Troubleshooting

**Issue: "Connection refused"**

```powershell
# Test connectivity
ping 192.168.1.11
ssh ubuntu@192.168.1.11 "echo 'test'"
```

**Issue: "SSH key permission denied"**

```powershell
# Check key exists
Test-Path $env:USERPROFILE\.ssh\id_rsa

# Copy key to Pis
type $env:USERPROFILE\.ssh\id_rsa.pub | ssh ubuntu@192.168.1.11 "cat >> ~/.ssh/authorized_keys"
```

**Issue: Terraform fails**

```powershell
# Enable debug mode
$env:TF_LOG="DEBUG"
terraform apply
```

### Manual Verification Commands

```bash
# On master node
kubectl get nodes -o wide
kubectl get pods --all-namespaces
kubectl cluster-info

# Check K3s status
sudo systemctl status k3s

# On worker nodes
sudo systemctl status k3s-agent
```

### Clean Up

To destroy the cluster:

```powershell
terraform destroy -auto-approve
```

**Note:** This removes K3s configuration but doesn't uninstall Docker.

---

## For Detailed Setup

See `SETUP_GUIDE.md` for step-by-step instructions including:

- Flashing Ubuntu on Raspberry Pis
- Network configuration
- SSH key setup
- Manual installation steps (if Terraform fails)

## Architecture Overview

```
Master Node (192.168.1.10)
├── K3s Server (Kubernetes control plane)
├── Docker Registry (port 5000)
└── kubectl

Worker Nodes (192.168.1.11-14)
├── K3s Agent (Kubernetes worker)
└── Docker runtime

Network: All connected via TP-Link router on 192.168.1.0/24
```

## Files Generated

After successful deployment:

- `terraform.tfstate` - Current infrastructure state
- `modules/master/k3s-token.txt` - Cluster join token (sensitive)
- `tfplan` - Terraform execution plan

## Support

- Full guide: `SETUP_GUIDE.md`
- Project docs: `../RASPBERRY_PI_COMPLETE_GUIDE.md`
- Demo prep: `../DEMO_DAY_QUICK_REFERENCE.md`
