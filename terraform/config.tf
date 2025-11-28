# ConfigMap
resource "kubernetes_config_map" "microservices_config" {
  metadata {
    name      = "microservices-config"
    namespace = kubernetes_namespace.microservices.metadata[0].name
  }

  data = {
    NODE_ENV                = "production"
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
    POSTGRES_USER           = var.postgres_user
    POSTGRES_PASSWORD       = var.postgres_password
    DATABASE_USER           = var.postgres_user
    DATABASE_PASSWORD       = var.postgres_password
    JWT_SECRET              = var.jwt_secret
    PGADMIN_DEFAULT_EMAIL   = var.pgadmin_email
    PGADMIN_DEFAULT_PASSWORD = var.pgadmin_password
  }
}
