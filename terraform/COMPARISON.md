# Deployment Comparison: deploy-vm.sh vs Terraform

## Overview

This document compares the traditional shell script deployment (`deploy-vm.sh`) with the new Terraform-based deployment.

## Quick Comparison

| Aspect | deploy-vm.sh | Terraform |
|--------|--------------|-----------|
| **Deployment Method** | Shell script with kubectl | Infrastructure as Code |
| **State Management** | None (stateless) | terraform.tfstate |
| **Idempotency** | ❌ No | ✅ Yes |
| **Preview Changes** | ❌ No | ✅ terraform plan |
| **Dependency Management** | Manual (sleep commands) | ✅ Automatic |
| **Rollback** | Manual kubectl delete | ✅ terraform state |
| **Variable Management** | Hardcoded in YAML | ✅ variables.tf |
| **Incremental Updates** | ❌ Replace all | ✅ Only changed resources |
| **Documentation** | Comments in script | ✅ Self-documenting |
| **Team Collaboration** | Difficult | ✅ Version controlled state |
| **Resource Drift Detection** | ❌ No | ✅ terraform plan |
| **Complexity** | Simple | Moderate |

## Detailed Comparison

### 1. State Management

**deploy-vm.sh:**
```bash
# No state - runs kubectl apply every time
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
# ... more applies
```

**Terraform:**
```hcl
# Tracks state in terraform.tfstate
# Knows what exists and what changed
resource "kubernetes_namespace" "microservices" {
  # ...
}
```

**Winner:** ✅ Terraform - knows current state, prevents duplicate resources

### 2. Dependency Management

**deploy-vm.sh:**
```bash
# Manual waits
kubectl apply -f k8s/shrine-db.yaml
sleep 10  # Hope database is ready
kubectl apply -f k8s/shrine-service.yaml
```

**Terraform:**
```hcl
resource "kubernetes_deployment" "shrine_service" {
  # ...
  depends_on = [
    kubernetes_deployment.shrine_db,  # Automatic dependency
    kubernetes_deployment.rabbitmq
  ]
}
```

**Winner:** ✅ Terraform - automatic dependency resolution

### 3. Idempotency

**deploy-vm.sh:**
- Running twice may cause errors or unnecessary updates
- No way to know if resources changed

**Terraform:**
- Running `terraform apply` multiple times is safe
- Only applies changes when needed
- Shows what will change before applying

**Winner:** ✅ Terraform

### 4. Preview Changes

**deploy-vm.sh:**
```bash
# No preview - just applies everything
bash deploy-vm.sh
```

**Terraform:**
```bash
# See what will change BEFORE applying
terraform plan

# Example output:
# + create 15 resources
# ~ modify 2 resources
# - destroy 0 resources
```

**Winner:** ✅ Terraform

### 5. Variable Management

**deploy-vm.sh:**
```yaml
# Hardcoded in YAML files
image: 192.168.0.106:5000/api-gateway:latest
replicas: 2
```

**Terraform:**
```hcl
# Centralized variables
variable "registry_url" {
  default = "192.168.0.106:5000"
}

# Override per environment
terraform apply -var="api_gateway_replicas=5"
```

**Winner:** ✅ Terraform - flexible variable management

### 6. Rollback Capabilities

**deploy-vm.sh:**
```bash
# Manual rollback - need to remember what changed
kubectl delete -f k8s/api-gateway.yaml
kubectl apply -f k8s/api-gateway.yaml.backup
```

**Terraform:**
```bash
# Easy rollback to previous state
terraform state pull > backup.tfstate
terraform apply  # Apply known good config
```

**Winner:** ✅ Terraform

### 7. Incremental Updates

**deploy-vm.sh:**
```bash
# Applies everything every time
kubectl apply -f k8s/*.yaml
# All resources get re-applied
```

**Terraform:**
```bash
# Only updates what changed
terraform apply
# Plan: 0 to add, 2 to change, 0 to destroy
```

**Winner:** ✅ Terraform - faster deployments

### 8. Resource Drift Detection

**deploy-vm.sh:**
- No way to detect manual changes
- Script doesn't know if someone modified resources

**Terraform:**
```bash
terraform plan
# Shows if resources were modified outside Terraform
# "Note: Objects have changed outside of Terraform"
```

**Winner:** ✅ Terraform

## Migration Path

### Step 1: Test Terraform Deployment

```bash
# In a test environment
cd terraform
terraform init
terraform plan
terraform apply
```

### Step 2: Compare Results

```bash
# Check both deployments produce same resources
kubectl get all -n microservices

# Compare specific resources
kubectl get deployment api-gateway -n microservices -o yaml
```

### Step 3: Migrate Production

```bash
# Option A: Fresh deployment
bash k8s/delete-vm.sh  # Delete old resources
bash terraform/deploy.sh  # Deploy with Terraform

# Option B: Import existing resources
terraform import kubernetes_namespace.microservices microservices
terraform import kubernetes_deployment.api_gateway microservices/api-gateway
# ... import other resources
```

## When to Use Each

### Use deploy-vm.sh when:
- ✅ Quick one-time deployment
- ✅ Learning Kubernetes
- ✅ No need for state management
- ✅ Simple environments

### Use Terraform when:
- ✅ Production deployments
- ✅ Multiple environments (dev, staging, prod)
- ✅ Team collaboration
- ✅ Need to track changes over time
- ✅ Complex infrastructure
- ✅ Need rollback capabilities

## Performance Comparison

### Initial Deployment Time

| Method | Time | Notes |
|--------|------|-------|
| deploy-vm.sh | ~30-60s | Includes sleep commands |
| Terraform | ~45-75s | Includes dependency resolution |

### Update Deployment Time

| Method | Time | Notes |
|--------|------|-------|
| deploy-vm.sh | ~30-60s | Re-applies everything |
| Terraform | ~10-30s | Only updates changed resources |

**Winner:** ✅ Terraform (for updates)

## Resource Usage

Both methods deploy identical resources with same specifications:
- Same CPU/Memory requests and limits
- Same replica counts
- Same environment variables
- Same probes and health checks

## Learning Curve

| Aspect | deploy-vm.sh | Terraform |
|--------|--------------|-----------|
| Initial Setup | Easy | Moderate |
| Understanding | Easy | Requires HCL knowledge |
| Debugging | kubectl logs | terraform show + kubectl logs |
| Maintenance | Easy | Moderate |

## Recommendations

### For Development
- Start with `deploy-vm.sh` to understand Kubernetes
- Migrate to Terraform when comfortable

### For Production
- **Use Terraform** for:
  - Better state management
  - Change tracking
  - Team collaboration
  - Multiple environments

### For CI/CD
- **Use Terraform** with:
  - Remote state backend (S3, etc.)
  - Automated planning in PRs
  - Automated deployment on merge

## Example Workflows

### deploy-vm.sh Workflow
```bash
# Developer makes changes to YAML
vim k8s/api-gateway.yaml

# Deploy
bash k8s/deploy-vm.sh

# Hope nothing breaks
```

### Terraform Workflow
```bash
# Developer makes changes
vim terraform/gateway-frontend.tf

# Preview changes
terraform plan

# Review with team
git diff

# Apply changes
terraform apply

# Rollback if needed
git revert HEAD
terraform apply
```

## Cost Analysis

### Time Investment
- **Setup Time:** deploy-vm.sh (1 hour) vs Terraform (2-3 hours)
- **Maintenance Time:** deploy-vm.sh (high) vs Terraform (low)
- **Debugging Time:** deploy-vm.sh (high) vs Terraform (medium)

### Long-term Value
- **deploy-vm.sh:** Good for learning and simple deployments
- **Terraform:** Better ROI for production and team environments

## Conclusion

**For this project:**
- ✅ **Use Terraform** for production deployments
- ✅ Keep `deploy-vm.sh` for quick testing and learning
- ✅ Both methods are valid and serve different purposes

**Migration Recommendation:**
- Start using Terraform for new deployments
- Gradually migrate existing deployments
- Keep shell scripts for emergency situations

## Quick Command Reference

### deploy-vm.sh
```bash
# Deploy
bash k8s/deploy-vm.sh

# Delete
bash k8s/delete-vm.sh

# Check status
kubectl get all -n microservices
```

### Terraform
```bash
# Deploy
cd terraform && terraform apply

# Preview
terraform plan

# Destroy
terraform destroy

# Check status
terraform show
kubectl get all -n microservices
```

## Support and Troubleshooting

### deploy-vm.sh Issues
- Check kubectl access
- Verify YAML files
- Check logs: `kubectl logs -n microservices <pod>`

### Terraform Issues
- Run `terraform validate`
- Check state: `terraform state list`
- Review plan: `terraform plan`
- Check provider docs: https://registry.terraform.io/providers/hashicorp/kubernetes/
