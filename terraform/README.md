# Terraform Deployment for K3s Cluster

This directory contains Terraform configuration files to deploy the **สาย.mu** microservices application to a K3s cluster running on Raspberry Pi worker nodes.

## 📋 Prerequisites

Before using this Terraform configuration:

1. **K3s Cluster Running**
   - Master node configured
   - Raspberry Pi worker nodes joined to cluster
   - `kubectl` configured and working

2. **Docker Images Built**
   - ARM-compatible images built using `k8s/build-arm.ps1` or `k8s/build-arm.sh`
   - Images pushed to local registry or Docker Hub

3. **Terraform Installed**
   ```bash
   # Install Terraform (if not already installed)
   # Windows (Chocolatey):
   choco install terraform
   
   # macOS (Homebrew):
   brew install terraform
   
   # Linux:
   wget https://releases.hashicorp.com/terraform/1.6.0/terraform_1.6.0_linux_amd64.zip
   unzip terraform_1.6.0_linux_amd64.zip
   sudo mv terraform /usr/local/bin/
   ```

4. **Kubeconfig Access**
   - Ensure `~/.kube/config` has access to your K3s cluster
   - Or set `KUBECONFIG` environment variable

## 🚀 Quick Start

### 1. Initialize Terraform

```bash
cd terraform
terraform init
```

This will download the Kubernetes provider plugin.

### 2. Configure Variables (Optional)

Copy the example variables file and customize:

```bash
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values
```

**Key variables to customize:**
- `docker_registry`: Your Docker registry URL (e.g., `192.168.0.106:5000`)
- `master_node_hostname`: Your master node hostname
- `postgres_password`: Database password
- `jwt_secret`: JWT secret for authentication

### 3. Review Deployment Plan

```bash
terraform plan
```

This shows what resources will be created without making any changes.

### 4. Deploy to Cluster

```bash
terraform apply
```

Type `yes` when prompted to confirm deployment.

**Expected deployment time**: 2-5 minutes

### 5. Verify Deployment

```bash
# Check all pods are running
kubectl get pods -n microservices

# Check services
kubectl get svc -n microservices

# Check HPA
kubectl get hpa -n microservices
```

### 6. Access the Application

After successful deployment:

- **API Gateway**: `http://<master-node-ip>:30000`
- **Frontend**: `http://<master-node-ip>:30002`

Replace `<master-node-ip>` with your master node's IP address (e.g., `192.168.0.106`).

**Test API:**
```bash
curl http://192.168.0.106:30000/shrines
```

## 📂 File Structure

```
terraform/
├── versions.tf              # Terraform and provider versions
├── variables.tf             # Variable definitions
├── main.tf                  # Provider, namespace, ConfigMap, Secrets
├── databases.tf             # PostgreSQL and RabbitMQ
├── services.tf              # Shrine and Location services
├── gateway.tf               # API Gateway and Frontend
├── outputs.tf               # Output values after deployment
├── terraform.tfvars.example # Example variable values
└── README.md               # This file
```

## 🔧 Configuration Details

### Resources Created

1. **Namespace**: `microservices`
2. **ConfigMap**: Application configuration
3. **Secrets**: Database credentials, JWT secret
4. **Databases**:
   - PostgreSQL (shrine-db) with 1Gi PVC
   - RabbitMQ message broker
5. **Microservices**:
   - Location Service (2 replicas + HPA)
   - Shrine Service (2 replicas + HPA)
6. **Gateway & Frontend**:
   - API Gateway (2 replicas + HPA + PDB)
   - Frontend (2 replicas + HPA + PDB)

### Default Configuration

- **Replicas**: 2 per service (configurable)
- **HPA**: Enabled, max 2 replicas (configurable)
- **Node Selector**: `kubernetes.io/arch: arm64` (Raspberry Pi)
- **Resource Limits**:
  - API Gateway: 256Mi-512Mi memory, 250m-500m CPU
  - Services: 256Mi-512Mi memory, 250m-500m CPU
  - Frontend: 128Mi-256Mi memory, 100m-250m CPU

## 📊 Terraform Commands

### Basic Operations

```bash
# Initialize Terraform
terraform init

# Validate configuration
terraform validate

# Plan deployment (preview changes)
terraform plan

# Apply changes (deploy)
terraform apply

# Show current state
terraform show

# List managed resources
terraform state list

# Destroy all resources
terraform destroy
```

### Advanced Operations

```bash
# Apply with specific variable values
terraform apply -var="docker_registry=192.168.0.106:5000"

# Apply without confirmation
terraform apply -auto-approve

# Destroy without confirmation
terraform destroy -auto-approve

# Target specific resource
terraform apply -target=kubernetes_deployment.api_gateway

# View outputs
terraform output

# Format Terraform files
terraform fmt

# Refresh state
terraform refresh
```

## 🔄 Updating Deployment

### Update Docker Images

1. Build new images:
   ```bash
   cd k8s
   ./build-arm.sh
   ```

2. Restart deployments to pull new images:
   ```bash
   kubectl rollout restart deployment/api-gateway -n microservices
   kubectl rollout restart deployment/shrine-service -n microservices
   kubectl rollout restart deployment/location-service -n microservices
   kubectl rollout restart deployment/frontend -n microservices
   ```

### Update Configuration

1. Edit `terraform.tfvars` or modify variables
2. Run `terraform apply`
3. Terraform will update only changed resources

### Scale Services

Edit `terraform.tfvars`:
```hcl
api_gateway_replicas = 3
shrine_service_replicas = 3
```

Then apply:
```bash
terraform apply
```

## 🧹 Cleanup

### Remove All Resources

```bash
terraform destroy
```

This will:
- Delete all deployments
- Delete all services
- Delete ConfigMap and Secrets
- Delete PVCs (data will be lost!)
- Delete namespace

### Selective Cleanup

```bash
# Remove only specific resources
terraform destroy -target=kubernetes_deployment.frontend
```

## 🐛 Troubleshooting

### Issue: `terraform init` fails

**Solution**: Ensure you have internet connectivity to download providers.

### Issue: `Error: Kubernetes cluster unreachable`

**Solution**:
```bash
# Verify kubectl works
kubectl cluster-info

# Check kubeconfig path
echo $KUBECONFIG

# Or specify path directly
export KUBECONFIG=~/.kube/config
```

### Issue: Pods stuck in `Pending` state

**Solutions**:
1. Check node resources:
   ```bash
   kubectl top nodes
   kubectl describe nodes
   ```

2. Check events:
   ```bash
   kubectl get events -n microservices --sort-by='.lastTimestamp'
   ```

3. Reduce resource requests in `variables.tf`

### Issue: Image pull errors

**Solutions**:
1. Verify images exist in registry:
   ```bash
   curl http://192.168.0.106:5000/v2/_catalog
   ```

2. Check if registry is accessible from Pi nodes:
   ```bash
   ssh pi-node-1
   docker pull 192.168.0.106:5000/shrine-service:latest
   ```

3. Verify `insecure-registries` in `/etc/docker/daemon.json`

### Issue: Database pod won't start

**Solutions**:
1. Check PVC status:
   ```bash
   kubectl get pvc -n microservices
   ```

2. Verify node has storage:
   ```bash
   kubectl describe pvc shrine-db-pvc -n microservices
   ```

3. Check master node disk space:
   ```bash
   df -h
   ```

## 📝 Notes

- **State Management**: Terraform state is stored locally in `terraform.tfstate`. Back this up if needed.
- **Secrets**: Never commit `terraform.tfvars` with real credentials to git.
- **Dependencies**: Terraform handles resource dependencies automatically.
- **Idempotent**: You can run `terraform apply` multiple times safely.

## 🔗 Related Documentation

- [Kubernetes Deployment Guide](../k8s/README.md)
- [Raspberry Pi Setup Guide](../RASPBERRY_PI_COMPLETE_GUIDE.md)
- [Main Project README](../README.md)
- [Terraform Kubernetes Provider Docs](https://registry.terraform.io/providers/hashicorp/kubernetes/latest/docs)

## 🎯 Comparison with Shell Script

This Terraform configuration replaces `k8s/deploy-vm.sh` with benefits:

| Feature | Shell Script | Terraform |
|---------|-------------|-----------|
| **Idempotent** | ❌ No | ✅ Yes |
| **State Tracking** | ❌ No | ✅ Yes |
| **Dependency Management** | ⚠️ Manual | ✅ Automatic |
| **Rollback** | ❌ Manual | ✅ Easy |
| **Configuration** | ⚠️ Hardcoded | ✅ Variables |
| **Validation** | ❌ Runtime only | ✅ Pre-deployment |

## 🤝 Contributing

When modifying Terraform files:

1. Run `terraform fmt` to format code
2. Run `terraform validate` to check syntax
3. Test on development cluster first
4. Document variable changes in README

---

**Need help?** Check the troubleshooting section or project documentation.
