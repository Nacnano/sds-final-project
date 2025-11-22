# Terraform Infrastructure for Raspberry Pi Kubernetes Cluster

This directory contains Terraform configurations for provisioning the infrastructure for the สาย.mu Shrine Discovery Platform on Raspberry Pi.

## Prerequisites

1. **Terraform Installation**

   ```powershell
   # Windows (using Chocolatey)
   choco install terraform

   # Or download from https://www.terraform.io/downloads
   ```

2. **SSH Access to Raspberry Pis**
   - All Raspberry Pis must be accessible via SSH
   - SSH keys should be set up for passwordless authentication
   - Default user: `ubuntu` (for Ubuntu Server on Pi)

3. **Network Configuration**
   - Router: TP-Link TL-WR841N
   - Master Node (Laptop): 192.168.1.10
   - Raspberry Pi Nodes: 192.168.1.11-14
   - All devices connected via Ethernet

## Directory Structure

```
terraform/
├── README.md                    # This file
├── main.tf                      # Main configuration
├── variables.tf                 # Variable definitions
├── outputs.tf                   # Output definitions
├── terraform.tfvars             # Variable values (customize this)
├── modules/
│   ├── master/                  # Master node configuration
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   └── worker/                  # Worker node configuration
│       ├── main.tf
│       ├── variables.tf
│       └── outputs.tf
└── scripts/
    ├── install-docker.sh        # Docker installation script
    ├── setup-k3s-master.sh      # K3s master setup
    ├── setup-k3s-worker.sh      # K3s worker setup
    └── setup-registry.sh        # Docker registry setup

```

## Quick Start

1. **Initialize Terraform**

   ```powershell
   cd terraform
   terraform init
   ```

2. **Review Configuration**

   ```powershell
   # Edit terraform.tfvars with your settings
   notepad terraform.tfvars
   ```

3. **Plan Infrastructure**

   ```powershell
   terraform plan
   ```

4. **Apply Configuration**

   ```powershell
   terraform apply
   ```

5. **Verify Cluster**

   ```powershell
   # SSH to master node
   ssh ubuntu@192.168.1.10

   # Check nodes
   kubectl get nodes
   ```

## Configuration Variables

Key variables to customize in `terraform.tfvars`:

- `master_ip` - Master node IP address (default: 192.168.1.10)
- `worker_ips` - List of worker node IPs (default: ["192.168.1.11", "192.168.1.12", "192.168.1.13", "192.168.1.14"])
- `ssh_user` - SSH username (default: ubuntu)
- `ssh_private_key_path` - Path to SSH private key
- `cluster_name` - Kubernetes cluster name (default: sai-mu-cluster)

## What Terraform Will Do

### Master Node (Laptop/Desktop)

1. Install Docker
2. Setup Docker registry on port 5000
3. Install kubectl
4. Initialize K3s master node
5. Configure kubeconfig
6. Install Kubernetes dashboard (optional)

### Worker Nodes (Raspberry Pis)

1. Install Docker on each Pi
2. Join K3s cluster as worker nodes
3. Configure container runtime
4. Label nodes appropriately

## Post-Terraform Steps

After Terraform completes:

1. **Build and Push Docker Images**

   ```powershell
   cd k8s
   .\build-arm.ps1
   ```

2. **Deploy Application**

   ```powershell
   .\deploy-pi.ps1
   ```

3. **Verify Deployment**
   ```powershell
   kubectl get pods -n microservices
   kubectl get svc -n microservices
   ```

## Troubleshooting

### SSH Connection Issues

```powershell
# Test SSH connectivity
ssh ubuntu@192.168.1.11 "echo 'Connection successful'"

# Check SSH key permissions
icacls $env:USERPROFILE\.ssh\id_rsa
```

### Terraform State Issues

```powershell
# Reset state if needed
terraform state list
terraform state rm <resource_name>
```

### K3s Issues

```bash
# On master: Check K3s status
sudo systemctl status k3s

# On worker: Check K3s agent status
sudo systemctl status k3s-agent

# View logs
sudo journalctl -u k3s -f
```

## Destroy Infrastructure

To tear down the cluster:

```powershell
terraform destroy
```

**Warning**: This will:

- Remove K3s from all nodes
- Remove Docker registry
- Clean up configuration files
- NOT remove Docker itself (requires manual cleanup)

## Notes

- This Terraform configuration uses `null_resource` with `remote-exec` provisioners
- It assumes Ubuntu Server is already installed on all Raspberry Pis
- Network configuration must be done manually on the router
- For production, consider using proper configuration management (Ansible, etc.)

## Support

For issues specific to:

- **Terraform**: Check Terraform logs with `TF_LOG=DEBUG`
- **K3s**: See [K3s Documentation](https://docs.k3s.io/)
- **Project**: Refer to RASPBERRY_PI_COMPLETE_GUIDE.md

## Course Requirements Met

✅ Kubernetes cluster with 4+ Raspberry Pis  
✅ Automated deployment configuration  
✅ Infrastructure as Code approach  
✅ Reproducible cluster setup
