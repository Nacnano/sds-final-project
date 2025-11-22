output "deployment_status" {
  description = "Deployment status message"
  value       = "Services deployed to K3s cluster at ${var.master_ip}"
  depends_on  = [null_resource.verify_deployment]
}

output "access_urls" {
  description = "Application access URLs"
  value = {
    frontend    = "http://${var.master_ip}:30002"
    api_gateway = "http://${var.master_ip}:30000"
  }
}
