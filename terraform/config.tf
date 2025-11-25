# ConfigMap
resource "kubernetes_config_map" "microservices_config" {
  metadata {
    name      = "microservices-config"
    namespace = kubernetes_namespace.microservices.metadata[0].name
  }

  data = {
    NODE_ENV                = "production"
    RABBITMQ_URL            = "amqp://rabbitmq:5672"
    RABBITMQ_DEFAULT_USER   = "guest"
    RABBITMQ_DEFAULT_PASS   = "guest"
    SHRINE_DATABASE_HOST    = "shrine-db"
    SHRINE_DATABASE_PORT    = "5432"
    SHRINE_SERVICE_URL      = "shrine-service:5001"
    LOCATION_SERVICE_URL    = "location-service:5006"
    GATEWAY_PORT            = "3000"
    SHRINE_GRPC_PORT        = "5001"
    LOCATION_GRPC_PORT      = "5006"
    FRONTEND_URL            = var.frontend_url
  }
}

# Secrets
resource "kubernetes_secret" "microservices_secrets" {
  metadata {
    name      = "microservices-secrets"
    namespace = kubernetes_namespace.microservices.metadata[0].name
  }

  type = "Opaque"

  data = {
    POSTGRES_USER           = base64encode(var.postgres_user)
    POSTGRES_PASSWORD       = base64encode(var.postgres_password)
    DATABASE_USER           = base64encode(var.postgres_user)
    DATABASE_PASSWORD       = base64encode(var.postgres_password)
    JWT_SECRET              = base64encode(var.jwt_secret)
    PGADMIN_DEFAULT_EMAIL   = base64encode(var.pgadmin_email)
    PGADMIN_DEFAULT_PASSWORD = base64encode(var.pgadmin_password)
  }
}
