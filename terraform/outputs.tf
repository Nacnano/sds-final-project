output "namespace" {
  description = "Kubernetes namespace for microservices"
  value       = kubernetes_namespace.microservices.metadata[0].name
}

output "api_gateway_url" {
  description = "API Gateway URL (use your master node IP)"
  value       = "http://<master-node-ip>:30000"
}

output "frontend_url" {
  description = "Frontend URL (use your master node IP)"
  value       = "http://<master-node-ip>:30002"
}

output "shrine_db_service" {
  description = "Shrine database service name"
  value       = kubernetes_service.shrine_db.metadata[0].name
}

output "rabbitmq_service" {
  description = "RabbitMQ service name"
  value       = kubernetes_service.rabbitmq.metadata[0].name
}

output "services_deployed" {
  description = "List of deployed services"
  value = [
    kubernetes_service.shrine_db.metadata[0].name,
    kubernetes_service.rabbitmq.metadata[0].name,
    kubernetes_service.location_service.metadata[0].name,
    kubernetes_service.shrine_service.metadata[0].name,
    kubernetes_service.api_gateway.metadata[0].name,
    kubernetes_service.frontend.metadata[0].name
  ]
}

output "deployment_info" {
  description = "Deployment information"
  value = {
    namespace      = kubernetes_namespace.microservices.metadata[0].name
    api_gateway    = "NodePort 30000"
    frontend       = "NodePort 30002"
    shrine_service = "ClusterIP 5001"
    location_service = "ClusterIP 5006"
    shrine_db      = "ClusterIP 5432"
    rabbitmq       = "ClusterIP 5672"
  }
}
