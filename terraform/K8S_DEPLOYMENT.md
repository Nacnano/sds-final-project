# Terraform K8s Deployment Guide

## Two Deployment Scenarios

### Scenario 1: Full Setup (Cluster + Services)

**File**: `main.tf` (default)

Deploys everything from scratch:

- K3s master on your computer
- 4 Raspberry Pi workers
- All application services

```bash
cd terraform
terraform init
terraform apply
```

### Scenario 2: Deploy Services Only (Existing Cluster)

**File**: `main-deploy-only.tf`

Deploys only services to existing K3s cluster:

- Assumes cluster already configured
- Just deploys the application

**Setup**:

```bash
cd terraform

# Option A: Use targeted apply
terraform init
terraform apply -target="module.k8s_deploy"

# Option B: Switch to deploy-only mode
mv main.tf main-full.tf.backup
mv main-deploy-only.tf main.tf
mv variables.tf variables-full.tf.backup
mv variables-deploy-only.tf variables.tf

terraform init
terraform apply
```

## What Gets Deployed

The K8s deployment module (`modules/k8s-deploy/`) deploys:

1. Namespace (`microservices`)
2. Secrets and ConfigMaps
3. PostgreSQL database
4. RabbitMQ
5. Location Service
6. Shrine Service
7. API Gateway + Frontend

All with proper wait conditions and health checks.

## Variables

**Full deployment**: Needs cluster config in `terraform.tfvars`
**Deploy-only**: Only needs:

- `master_ip` = "192.168.0.103"
- `registry_port` = 5000
- `k8s_manifests_path` = "../k8s"

## Access

After deployment:

- Frontend: http://192.168.0.103:30002
- API: http://192.168.0.103:30000

## Redeploy Services

```bash
# Redeploy all services
terraform taint module.k8s_deploy.null_resource.verify_deployment
terraform apply -target="module.k8s_deploy"

# Or delete and reapply
kubectl delete namespace microservices
terraform apply -target="module.k8s_deploy"
```
