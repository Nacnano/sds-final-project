output "k3s_token" {
  description = "K3s token for workers to join cluster"
  value       = file("${path.module}/k3s-token.txt")
  sensitive   = true
  depends_on  = [null_resource.get_k3s_token]
}

output "kubeconfig_path" {
  description = "Path to kubeconfig on local computer"
  value       = "$HOME/.kube/config"
}

output "master_status" {
  description = "Master node setup status"
  value       = "Master node configured at ${var.master_ip}"
}
