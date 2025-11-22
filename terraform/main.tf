terraform {
  required_version = ">= 1.0"
  required_providers {
    null = {
      source  = "hashicorp/null"
      version = "~> 3.2"
    }
  }
}

# Master Node Module
module "master" {
  source = "./modules/master"

  master_ip            = var.master_ip
  ssh_user             = var.ssh_user
  ssh_private_key_path = var.ssh_private_key_path
  cluster_name         = var.cluster_name
  k3s_version          = var.k3s_version
  registry_port        = var.registry_port
}

# Worker Nodes Module
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
    Kubernetes Cluster Setup Complete!
    ============================================
    
    Master Node: ${var.master_ip}
    Worker Nodes: ${join(", ", var.worker_ips)}
    Docker Registry: ${var.master_ip}:${var.registry_port}
    
    Next Steps:
    1. Verify cluster:
       kubectl get nodes
    
    2. Build ARM images:
       cd k8s
       .\build-arm.ps1
    
    3. Deploy application:
       .\deploy-pi.ps1
    
    4. Check deployment:
       kubectl get pods -n microservices
    
    5. Access application:
       http://${var.master_ip}:30000/shrines (API)
       http://${var.master_ip}:30002 (Frontend)
    
    For troubleshooting, see terraform/README.md
    ============================================
  EOT
  description = "Instructions for next steps after cluster setup"
}
