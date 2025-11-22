terraform {
  required_version = ">= 1.0"
  required_providers {
    null = {
      source  = "hashicorp/null"
      version = "~> 3.2"
    }
  }
}

# K8s Deployment Module - Deploy services to existing K3s cluster
# Use this when cluster is already set up manually

module "k8s_deploy" {
  source = "./modules/k8s-deploy"

  master_ip           = var.master_ip
  registry_port       = var.registry_port
  k8s_manifests_path  = var.k8s_manifests_path
}

# Output deployment information
output "deployment_info" {
  value = {
    master_ip     = var.master_ip
    registry_url  = "${var.master_ip}:${var.registry_port}"
    frontend_url  = "http://${var.master_ip}:30002"
    api_url       = "http://${var.master_ip}:30000"
    status        = module.k8s_deploy.deployment_status
  }
  description = "Kubernetes deployment information"
}

output "next_steps" {
  value = <<-EOT
    ============================================
    Services Deployed Successfully!
    ============================================
    
    Master Node: ${var.master_ip}
    Docker Registry: ${var.master_ip}:${var.registry_port}
    
    Access URLs:
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
    
    To redeploy:
       terraform taint module.k8s_deploy.null_resource.deploy_api_gateway
       terraform apply
    ============================================
  EOT
  description = "Instructions after deployment"
}
