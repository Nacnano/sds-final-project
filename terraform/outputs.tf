output "namespace" {
  description = "Kubernetes namespace"
  value       = kubernetes_namespace.microservices.metadata[0].name
}

output "api_gateway_url" {
  description = "API Gateway URL"
  value       = "http://${var.node_hostname}:30000"
}

output "frontend_url" {
  description = "Frontend URL"
  value       = "http://${var.node_hostname}:30002"
}

output "pgadmin_url" {
  description = "PgAdmin URL (if enabled)"
  value       = "http://${var.node_hostname}:30080"
}

output "services" {
  description = "Deployed services"
  value = {
    api_gateway      = kubernetes_service.api_gateway.metadata[0].name
    shrine_service   = kubernetes_service.shrine_service.metadata[0].name
    location_service = kubernetes_service.location_service.metadata[0].name
    frontend         = kubernetes_service.frontend.metadata[0].name
    shrine_db        = kubernetes_service.shrine_db.metadata[0].name
    rabbitmq         = kubernetes_service.rabbitmq.metadata[0].name
  }
}
