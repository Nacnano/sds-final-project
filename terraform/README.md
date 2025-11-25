# Terraform Kubernetes Deployment

This directory contains Terraform configuration for deploying the microservices application to Kubernetes.

## Prerequisites

1. **Terraform**: Install Terraform >= 1.0
   ```bash
   # Ubuntu/Debian
   wget -O- https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
   echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
   sudo apt update && sudo apt install terraform
   ```

2. **kubectl**: Configured with access to your Kubernetes cluster

3. **Docker Images**: Built and pushed to your registry

## Configuration

1. **Create terraform.tfvars** (optional):
   ```bash
   cp terraform.tfvars.example terraform.tfvars
   # Edit terraform.tfvars with your values
   ```

2. **Configure Variables**:
   - `namespace`: Kubernetes namespace (default: microservices)
   - `kube_context`: Kubernetes context to use
   - `registry_url`: Docker registry URL
   - `node_hostname`: Node hostname for database placement
   - `postgres_user` and `postgres_password`: Database credentials
   - `jwt_secret`: JWT secret for authentication
   - Replica counts for services

## Quick Start

### Deploy All Resources

```bash
# Initialize Terraform
terraform init

# Plan deployment
terraform plan

# Apply deployment
terraform apply

# Or use the deploy script
bash deploy.sh
```

### Deploy with Custom Variables

```bash
terraform apply -var="api_gateway_replicas=3" -var="frontend_replicas=4"
```

### View Outputs

```bash
terraform output
```

### Destroy Resources

```bash
terraform destroy

# Or use the destroy script
bash destroy.sh
```

## File Structure

- `main.tf`: Provider configuration and namespace
- `variables.tf`: Input variable definitions
- `outputs.tf`: Output definitions
- `config.tf`: ConfigMap and Secrets
- `database.tf`: PostgreSQL database resources
- `rabbitmq.tf`: RabbitMQ message broker resources
- `services.tf`: Shrine and Location microservices
- `gateway-frontend.tf`: API Gateway and Frontend resources
- `deploy.sh`: Deployment script
- `destroy.sh`: Destroy script

## Deployment Order

Terraform automatically handles dependencies:

1. Namespace creation
2. ConfigMap and Secrets
3. Database (PostgreSQL) and RabbitMQ
4. Microservices (Shrine Service, Location Service)
5. API Gateway
6. Frontend

## Managing State

Terraform state is stored locally by default in `terraform.tfstate`. For production:

1. **Use Remote State** (recommended):
   ```hcl
   terraform {
     backend "s3" {
       bucket = "your-terraform-state"
       key    = "microservices/terraform.tfstate"
       region = "us-east-1"
     }
   }
   ```

2. **Backup State Files**:
   ```bash
   cp terraform.tfstate terraform.tfstate.backup
   ```

## Common Operations

### Scale Services

```bash
# Edit variables.tf or terraform.tfvars
# Then apply
terraform apply -var="api_gateway_replicas=5"
```

### Update Image

```bash
# Images are pulled with imagePullPolicy: Always
# Just apply to restart pods
terraform apply -replace="kubernetes_deployment.api_gateway"
```

### View Resources

```bash
# Show all resources
terraform state list

# Show specific resource
terraform state show kubernetes_deployment.api_gateway
```

### Import Existing Resources

```bash
terraform import kubernetes_namespace.microservices microservices
```

## Troubleshooting

### View Terraform Plan

```bash
terraform plan -out=tfplan
terraform show tfplan
```

### Debug Provider Issues

```bash
export TF_LOG=DEBUG
terraform apply
```

### Force Resource Recreation

```bash
terraform taint kubernetes_deployment.api_gateway
terraform apply
```

### Check Kubernetes Resources

```bash
kubectl get all -n microservices
kubectl describe pod <pod-name> -n microservices
kubectl logs <pod-name> -n microservices
```

## Comparison with deploy-vm.sh

| Feature | deploy-vm.sh | Terraform |
|---------|--------------|-----------|
| State Management | None | Yes (terraform.tfstate) |
| Idempotent | No | Yes |
| Dependency Management | Manual (sleep) | Automatic |
| Resource Updates | Replace all | Incremental |
| Rollback | Manual | terraform state |
| Variable Management | Hardcoded | Variables file |
| Preview Changes | No | terraform plan |

## Migration from deploy-vm.sh

The Terraform configuration replicates all functionality from `deploy-vm.sh`:

- ✅ Namespace creation
- ✅ ConfigMap and Secrets
- ✅ Database deployment (PostgreSQL)
- ✅ RabbitMQ deployment
- ✅ Microservices deployment
- ✅ API Gateway deployment
- ✅ Frontend deployment
- ✅ HPA (Horizontal Pod Autoscaler)
- ✅ PDB (Pod Disruption Budget)
- ✅ Node selectors and tolerations
- ✅ Resource limits and requests

## Next Steps

1. Deploy metrics server:
   ```bash
   kubectl apply -f ../k8s/components.yaml
   bash ../k8s/patch-metrics-server.sh
   ```

2. Seed database:
   ```bash
   bash ../k8s/seed.sh
   ```

3. Monitor deployment:
   ```bash
   watch kubectl get pods -n microservices
   ```

## Support

For issues or questions, refer to the main project documentation or check the Kubernetes dashboard.
