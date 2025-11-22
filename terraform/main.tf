terraform {
  required_version = ">= 1.0"
  required_providers {
    null = {
      source  = "hashicorp/null"
      version = "~> 3.2"
    }
  }
}

# Master Node Module (Runs on YOUR local computer)
module "master" {
  source = "./modules/master"

  master_ip     = var.master_ip
  cluster_name  = var.cluster_name
  k3s_version   = var.k3s_version
  registry_port = var.registry_port
}

# Worker Nodes Module (Raspberry Pis - need SSH)
module "workers" {
  source = "./modules/worker"

  worker_ips           = var.worker_ips
  ssh_user             = var.ssh_user
  ssh_private_key_path = var.ssh_private_key_path
  master_ip            = var.master_ip
  k3s_token            = module.master.k3s_token
  k3s_version          = var.k3s_version

  depends_on = [module.master]
}

# K8s Services Deployment Module (Optional - deploy services after cluster is ready)
module "k8s_deploy" {
  source = "./modules/k8s-deploy"

  master_ip          = var.master_ip
  registry_port      = var.registry_port
  k8s_manifests_path = var.k8s_manifests_path

  depends_on = [module.workers]
}

# Output cluster information
output "cluster_info" {
  value = {
    master_ip      = var.master_ip
    worker_ips     = var.worker_ips
    registry_url   = "${var.master_ip}:${var.registry_port}"
    kubeconfig     = module.master.kubeconfig_path
    cluster_status = "Run 'kubectl get nodes' to verify cluster"
  }
  description = "Kubernetes cluster information"
}

output "next_steps" {
  value = <<-EOT
    ============================================
    Kubernetes Cluster & Services Deployed!
    ============================================
    
    Master Node: ${var.master_ip}
    Worker Nodes: ${join(", ", var.worker_ips)}
    Docker Registry: ${var.master_ip}:${var.registry_port}
    
    Application URLs:
    - Frontend:    http://${var.master_ip}:30002
    - API Gateway: http://${var.master_ip}:30000/shrines
    
    Monitoring Commands:
    1. Check cluster:
       kubectl get nodes
    
    2. Check pods:
       kubectl get pods -n microservices
    
    3. Watch deployment:
       kubectl get pods -n microservices -w
    
    4. View logs:
       kubectl logs -n microservices -l app=api-gateway
    
    5. Check services:
       kubectl get svc -n microservices
    
    Redeploy services only:
       terraform apply -target="module.k8s_deploy"
    
    For troubleshooting, see terraform/README.md
    ============================================
  EOT
  description = "Instructions for next steps after cluster setup"
}
