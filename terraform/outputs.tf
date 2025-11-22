output "master_ip" {
  description = "Master node IP address"
  value       = var.master_ip
}

output "worker_ips" {
  description = "Worker node IP addresses"
  value       = var.worker_ips
}

output "docker_hub_images" {
  description = "Docker Hub image repository"
  value       = "nacnano/sds-final-project-*"
}

output "cluster_endpoint" {
  description = "Kubernetes API endpoint"
  value       = "https://${var.master_ip}:6443"
}

output "kubeconfig_path" {
  description = "Path to kubeconfig file on master node"
  value       = "/home/${var.ssh_user}/.kube/config"
}
