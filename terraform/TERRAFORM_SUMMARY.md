# Terraform Infrastructure Summary

## Overview

This directory contains **complete Infrastructure as Code (IaC)** for deploying the สาย.mu Shrine Discovery Platform on a Raspberry Pi Kubernetes cluster using Terraform.

## What's Included

### ✅ Fully Automated Setup

The Terraform configuration automatically provisions:

1. **Master Node (Your Laptop)**
   - Docker installation
   - Docker registry (port 5000)
   - kubectl installation
   - K3s server (Kubernetes control plane)
   - Kubeconfig setup

2. **Worker Nodes (4x Raspberry Pi 3 B+)**
   - Docker installation on each Pi
   - Registry configuration for insecure access
   - K3s agent installation
   - Automatic cluster joining
   - Node labeling

### 📁 File Structure

```
terraform/
├── README.md                    # Overview and usage
├── QUICKSTART.md               # 10-minute quick start guide
├── SETUP_GUIDE.md              # Comprehensive setup guide
├── setup.ps1                   # PowerShell automation script
├── main.tf                     # Main Terraform config
├── variables.tf                # Variable definitions
├── outputs.tf                  # Output definitions
├── terraform.tfvars            # Your custom values (gitignored)
├── terraform.tfvars.example    # Example configuration
├── .gitignore                  # Git ignore rules
├── modules/
│   ├── master/                 # Master node module
│   │   ├── main.tf            # Master provisioning logic
│   │   ├── variables.tf       # Master variables
│   │   └── outputs.tf         # Master outputs
│   └── worker/                 # Worker node module
│       ├── main.tf            # Worker provisioning logic
│       ├── variables.tf       # Worker variables
│       └── outputs.tf         # Worker outputs
└── scripts/
    ├── install-docker.sh       # Docker installation
    ├── setup-k3s-master.sh     # K3s master setup
    ├── setup-k3s-worker.sh     # K3s worker setup
    └── setup-registry.sh       # Registry setup
```

## Quick Start

### Prerequisites

- 4 Raspberry Pis with Ubuntu Server 22.04
- Static IPs configured (192.168.1.11-14)
- Master node with static IP (192.168.1.10)
- SSH access configured

### Run Terraform

```powershell
# Navigate to terraform directory
cd terraform

# Quick setup with PowerShell script
.\setup.ps1 -Action apply -AutoApprove

# Or manual Terraform commands
terraform init
terraform plan
terraform apply
```

### Verify

```bash
ssh ubuntu@192.168.1.10
kubectl get nodes
# Expected: 5 nodes (1 master + 4 workers), all Ready
```

## Course Requirements Compliance

This Terraform configuration ensures all SDS course requirements are met:

| Requirement            | Implementation                                          | Status |
| ---------------------- | ------------------------------------------------------- | ------ |
| **4+ Raspberry Pis**   | 4 Pi worker nodes configured                            | ✅     |
| **Kubernetes Cluster** | K3s with 1 master + 4 workers                           | ✅     |
| **3+ Containers**      | API Gateway, Shrine Service, Location Service, Frontend | ✅     |
| **Container Chain**    | Client → Gateway → Shrine → Location → Response         | ✅     |
| **Fault Tolerance**    | K3s auto-recovery, pod rescheduling                     | ✅     |
| **Automated Setup**    | Complete Terraform automation                           | ✅     |
| **Reproducible**       | Infrastructure as Code approach                         | ✅     |

## How It Works

### Terraform Execution Flow

1. **Initialization** (`terraform init`)
   - Downloads required providers
   - Initializes modules
   - Sets up backend

2. **Planning** (`terraform plan`)
   - Calculates infrastructure changes
   - Shows what will be created
   - Validates configuration

3. **Application** (`terraform apply`)
   - Connects to master via SSH
   - Installs Docker and K3s on master
   - Sets up Docker registry
   - Gets K3s join token
   - Connects to each worker via SSH
   - Installs Docker and K3s agent
   - Joins workers to cluster
   - Labels nodes appropriately

4. **Verification**
   - Tests cluster connectivity
   - Verifies all nodes are Ready
   - Displays cluster information

### Connection Method

Terraform uses SSH to connect and configure nodes:

- **Connection Type**: SSH with private key authentication
- **Master**: Direct SSH connection
- **Workers**: Direct SSH connection
- **Provisioner**: `remote-exec` for running commands

## Configuration Options

### Variables (terraform.tfvars)

```hcl
master_ip            = "192.168.1.10"        # Master node IP
worker_ips           = ["192.168.1.11", ...] # Worker IPs (4 required)
ssh_user             = "ubuntu"               # SSH username
ssh_private_key_path = "~/.ssh/id_rsa"       # SSH key path
cluster_name         = "sai-mu-cluster"      # Cluster name
k3s_version          = "v1.28.5+k3s1"        # K3s version
registry_port        = 5000                   # Registry port
```

### Outputs

After successful deployment:

- `master_ip` - Master node IP address
- `worker_ips` - List of worker IPs
- `registry_url` - Docker registry URL
- `cluster_endpoint` - Kubernetes API endpoint
- `kubeconfig_path` - Path to kubeconfig file

## Next Steps After Terraform

1. **Build ARM Docker Images**

   ```powershell
   cd ..\k8s
   .\build-arm.ps1
   ```

2. **Deploy Application**

   ```powershell
   .\deploy-pi.ps1
   ```

3. **Verify Deployment**

   ```bash
   kubectl get pods -n microservices
   kubectl get svc -n microservices
   ```

4. **Access Application**
   - API: http://192.168.1.10:30000/shrines
   - Frontend: http://192.168.1.10:30002

## Troubleshooting

### Common Issues

**1. SSH Connection Failed**

- Verify network connectivity: `ping 192.168.1.11`
- Test SSH access: `ssh ubuntu@192.168.1.11`
- Check SSH key permissions

**2. Terraform Timeout**

- Increase timeout in provisioner blocks
- Check node is responsive
- Verify SSH service is running

**3. K3s Installation Failed**

- Check node has sufficient resources
- Verify Docker is installed
- Review logs: `sudo journalctl -u k3s -f`

**4. Worker Not Joining**

- Verify K3s token is correct
- Check network connectivity to master:6443
- Ensure firewall allows port 6443

### Debug Commands

```bash
# Check K3s status
sudo systemctl status k3s          # On master
sudo systemctl status k3s-agent    # On worker

# View K3s logs
sudo journalctl -u k3s -f
sudo journalctl -u k3s-agent -f

# Check Docker
docker ps
sudo systemctl status docker

# Verify registry
curl http://192.168.1.10:5000/v2/_catalog
```

## Architecture

```
┌─────────────────────────────────────────────────┐
│  Master Node (192.168.1.10)                     │
│  ┌──────────────────────────────────────┐      │
│  │  K3s Server (Control Plane)          │      │
│  │  - API Server                         │      │
│  │  - Scheduler                          │      │
│  │  - Controller Manager                 │      │
│  └──────────────────────────────────────┘      │
│  ┌──────────────────────────────────────┐      │
│  │  Docker Registry :5000                │      │
│  └──────────────────────────────────────┘      │
│  ┌──────────────────────────────────────┐      │
│  │  kubectl CLI                          │      │
│  └──────────────────────────────────────┘      │
└─────────────────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
┌───────▼────┐ ┌─────▼──────┐ ┌───▼────────┐
│ Worker 1   │ │ Worker 2   │ │ Worker 3-4 │
│ (.11)      │ │ (.12)      │ │ (.13-.14)  │
├────────────┤ ├────────────┤ ├────────────┤
│ K3s Agent  │ │ K3s Agent  │ │ K3s Agent  │
│ Docker     │ │ Docker     │ │ Docker     │
│ Pods       │ │ Pods       │ │ Pods       │
└────────────┘ └────────────┘ └────────────┘
```

## Benefits of Using Terraform

1. **Reproducibility** - Same configuration every time
2. **Version Control** - Track infrastructure changes in Git
3. **Automation** - No manual steps required
4. **Idempotency** - Safe to run multiple times
5. **Documentation** - Configuration is self-documenting
6. **Testing** - Easy to create/destroy test clusters

## Comparison: Manual vs Terraform

| Aspect             | Manual Setup | Terraform Setup     |
| ------------------ | ------------ | ------------------- |
| Time               | 2-3 hours    | 10-15 minutes       |
| Errors             | High risk    | Automated, tested   |
| Reproducible       | Difficult    | Easy                |
| Documentation      | Manual notes | Code as docs        |
| Team Collaboration | Complex      | Simple              |
| Rollback           | Manual       | `terraform destroy` |

## Security Considerations

- SSH private keys are never stored in Terraform state
- K3s token is marked as sensitive
- Registry uses insecure mode (localhost only)
- Consider using proper secrets management for production

## Limitations

- Assumes Ubuntu Server 22.04 on all nodes
- Requires pre-configured network (static IPs)
- Uses K3s (lightweight) instead of full Kubernetes
- Registry is insecure (development only)
- No built-in backup/restore

## Future Enhancements

Possible improvements:

- [ ] Add Ansible integration for OS-level config
- [ ] Support dynamic IP allocation
- [ ] Add Helm chart deployment
- [ ] Implement monitoring (Prometheus/Grafana)
- [ ] Add backup/restore automation
- [ ] Support multiple cloud providers

## Resources

- [Terraform Documentation](https://www.terraform.io/docs)
- [K3s Documentation](https://docs.k3s.io/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Docker Documentation](https://docs.docker.com/)

## Support

- **Setup Issues**: See `SETUP_GUIDE.md`
- **Quick Start**: See `QUICKSTART.md`
- **Project Docs**: See `../DOCUMENTATION_INDEX.md`
- **Demo Prep**: See `../DEMO_DAY_QUICK_REFERENCE.md`

---

**Created for**: 2110415 Software-Defined Systems  
**Semester**: 1/2025  
**Project**: สาย.mu - Thailand's Shrine Discovery Platform
