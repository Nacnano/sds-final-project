# 🚀 Terraform-Based Deployment for สาย.mu

## Two Deployment Options

### Option 1: 🚀 Automated with Terraform (RECOMMENDED)

**Time: ~15 minutes | Difficulty: Easy**

Complete Infrastructure as Code setup that automatically configures everything.

```powershell
cd terraform
.\setup.ps1 -Action apply -AutoApprove
```

✅ Installs Docker on all nodes  
✅ Sets up K3s cluster  
✅ Configures registry  
✅ Labels nodes  
✅ Fully automated

**See:** [`terraform/QUICKSTART.md`](./QUICKSTART.md)

---

### Option 2: 📖 Manual Setup

**Time: ~2-3 hours | Difficulty: Medium**

Step-by-step instructions for manual configuration.

**See:** [`RASPBERRY_PI_COMPLETE_GUIDE.md`](../RASPBERRY_PI_COMPLETE_GUIDE.md)

---

## Why Use Terraform?

| Benefit          | Description                         |
| ---------------- | ----------------------------------- |
| **Fast**         | 15 minutes vs 2-3 hours manual      |
| **Reliable**     | Tested, reproducible configuration  |
| **Recoverable**  | Easy to rebuild if something breaks |
| **Documented**   | Code is the documentation           |
| **Professional** | Industry-standard practice          |

## Prerequisites

Before running Terraform, ensure:

1. **Hardware Ready**
   - 4 Raspberry Pi 3 B+ with Ubuntu Server 22.04
   - 1 Laptop/Desktop as master
   - All connected to router via Ethernet

2. **Network Configured**
   - Static IPs assigned (192.168.1.11-14 for Pis)
   - Master at 192.168.1.10
   - All nodes pingable

3. **SSH Access**
   - SSH enabled on all nodes
   - SSH keys copied to all nodes
   - Passwordless SSH working

## Quick Validation

Test your setup before running Terraform:

```bash
# Linux/Mac/WSL
cd terraform/scripts
chmod +x validate.sh
./validate.sh

# Windows PowerShell
cd terraform
.\setup.ps1 -Action plan
```

## Installation Steps

### 1. Install Terraform

**Windows:**

```powershell
choco install terraform
```

**Linux/Mac:**

```bash
wget https://releases.hashicorp.com/terraform/1.6.0/terraform_1.6.0_linux_amd64.zip
unzip terraform_1.6.0_linux_amd64.zip
sudo mv terraform /usr/local/bin/
```

### 2. Configure

```powershell
cd terraform
Copy-Item terraform.tfvars.example terraform.tfvars
notepad terraform.tfvars
```

Update with your IPs and settings.

### 3. Deploy

**Windows:**

```powershell
.\setup.ps1 -Action apply
```

**Linux/Mac:**

```bash
terraform init
terraform apply
```

### 4. Verify

```bash
ssh ubuntu@192.168.1.10
kubectl get nodes
# Should show 5 nodes: 1 master + 4 workers
```

## What Happens During Deployment

```
[1/8] Validating configuration... ✓
[2/8] Installing Docker on master... ✓
[3/8] Setting up registry... ✓
[4/8] Installing K3s master... ✓
[5/8] Installing Docker on workers... ✓
[6/8] Joining workers to cluster... ✓
[7/8] Labeling nodes... ✓
[8/8] Verifying cluster... ✓

Deployment complete! 🎉
```

## Post-Deployment

After Terraform succeeds:

### 1. Build ARM Images

```powershell
cd ..\k8s
.\build-arm.ps1
```

### 2. Deploy Application

```powershell
.\deploy-pi.ps1
```

### 3. Verify

```bash
kubectl get pods -n microservices
kubectl get svc -n microservices
```

### 4. Test

- API: http://192.168.1.10:30000/shrines
- Frontend: http://192.168.1.10:30002

## Troubleshooting

### "SSH connection refused"

```bash
# Test SSH manually
ssh ubuntu@192.168.1.11

# Copy SSH key if needed
ssh-copy-id ubuntu@192.168.1.11
```

### "Terraform timeout"

```bash
# Increase verbosity
export TF_LOG=DEBUG
terraform apply
```

### "K3s failed to start"

```bash
# On master
ssh ubuntu@192.168.1.10
sudo journalctl -u k3s -f

# Restart if needed
sudo systemctl restart k3s
```

## Architecture Deployed

```
Master (192.168.1.10)
├── K3s Server (Control Plane)
├── Docker Registry (:5000)
└── kubectl

Workers (192.168.1.11-14)
├── K3s Agent
└── Docker Runtime
```

## Files Created

- `terraform.tfstate` - Infrastructure state
- `modules/master/k3s-token.txt` - Cluster join token
- `.terraform/` - Provider plugins

## Cleanup

To destroy the cluster:

```powershell
# Windows
.\setup.ps1 -Action destroy

# Linux/Mac
terraform destroy
```

**⚠️ Warning:** This removes K3s but not Docker.

## Course Requirements ✅

This Terraform setup meets all requirements:

- ✅ 4+ Raspberry Pi nodes
- ✅ Kubernetes cluster (K3s)
- ✅ 3+ distinct services
- ✅ Container dependency chain
- ✅ Fault tolerance (K3s auto-recovery)
- ✅ Automated deployment
- ✅ Reproducible setup

## Comparison with Manual Setup

| Aspect       | Terraform | Manual    |
| ------------ | --------- | --------- |
| Time         | 15 min    | 2-3 hours |
| Complexity   | Low       | High      |
| Error-prone  | No        | Yes       |
| Reproducible | Yes       | Hard      |
| Documented   | Code      | Notes     |
| Rollback     | Easy      | Hard      |

## Next Steps

1. **Learn More:**
   - [`TERRAFORM_SUMMARY.md`](./TERRAFORM_SUMMARY.md) - Complete overview
   - [`SETUP_GUIDE.md`](./SETUP_GUIDE.md) - Detailed guide

2. **Deploy App:**
   - [`../k8s/README_PI.md`](../k8s/README_PI.md) - Application deployment

3. **Prepare Demo:**
   - [`../DEMO_DAY_QUICK_REFERENCE.md`](../DEMO_DAY_QUICK_REFERENCE.md)

## Support

- **Terraform Issues**: Check `SETUP_GUIDE.md`
- **Project Issues**: Check `../DOCUMENTATION_INDEX.md`
- **Quick Reference**: `QUICKSTART.md`

## Additional Resources

- [Terraform Documentation](https://www.terraform.io/docs)
- [K3s Documentation](https://docs.k3s.io/)
- [Project Repository](https://github.com/Nacnano/sds-final-project)

---

**Course**: 2110415 Software-Defined Systems  
**Semester**: 1/2025  
**Instructor**: Kunwadee Sripanidkulchai, Ph.D.
