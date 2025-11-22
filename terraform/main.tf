terraform {
  required_version = ">= 1.0"
  required_providers {
    null = {
      source  = "hashicorp/null"
      version = "~> 3.2"
    }
  }
}

# K8s Services Deployment Module
# Deploys services to existing K3s cluster
module "k8s_deploy" {
  source = "./modules/k8s-deploy"

  master_ip          = var.master_ip
  k8s_manifests_path = var.k8s_manifests_path
}

# Output deployment information
output "deployment_info" {
  value = {
    master_ip    = var.master_ip
    docker_hub   = "nacnano/sds-final-project-*"
    frontend_url = "http://${var.master_ip}:30002"
    api_url      = "http://${var.master_ip}:30000"
    status       = module.k8s_deploy.deployment_status
  }
  description = "Kubernetes deployment information"
}

output "next_steps" {
  value = <<-EOT
    ============================================
    Services Deployed Successfully!
    ============================================
    
    Master Node: ${var.master_ip}
    Docker Images: Docker Hub (nacnano/sds-final-project-*)
    
    Application URLs:
    - Frontend:    http://${var.master_ip}:30002
    - API Gateway: http://${var.master_ip}:30000/shrines
    
    Monitoring Commands:
    1. Check pods:
       kubectl get pods -n microservices
    
    2. Watch deployment:
       kubectl get pods -n microservices -w
    
    3. View logs:
       kubectl logs -n microservices -l app=api-gateway
       kubectl logs -n microservices -l app=shrine-service
    
    4. Check services:
       kubectl get svc -n microservices
    
    Redeploy services:
       terraform taint module.k8s_deploy.null_resource.verify_deployment
       terraform apply
    
    For troubleshooting, see terraform/K8S_DEPLOYMENT.md
    ============================================
  EOT
  description = "Instructions after deployment"
}
