# RabbitMQ Deployment
resource "kubernetes_deployment" "rabbitmq" {
  metadata {
    name      = "rabbitmq"
    namespace = kubernetes_namespace.microservices.metadata[0].name
    labels = {
      app = "rabbitmq"
    }
  }

  spec {
    replicas = 1

    selector {
      match_labels = {
        app = "rabbitmq"
      }
    }

    template {
      metadata {
        labels = {
          app = "rabbitmq"
        }
      }

      spec {
        node_selector = {
          "kubernetes.io/arch" = "arm64"
        }

        container {
          name  = "rabbitmq"
          image = "rabbitmq:3-management"

          port {
            container_port = 5672
            name           = "amqp"
          }

          port {
            container_port = 15672
            name           = "management"
          }

          env {
            name = "RABBITMQ_DEFAULT_USER"
            value_from {
              config_map_key_ref {
                name = kubernetes_config_map.microservices_config.metadata[0].name
                key  = "RABBITMQ_DEFAULT_USER"
              }
            }
          }

          env {
            name = "RABBITMQ_DEFAULT_PASS"
            value_from {
              config_map_key_ref {
                name = kubernetes_config_map.microservices_config.metadata[0].name
                key  = "RABBITMQ_DEFAULT_PASS"
              }
            }
          }

          resources {
            requests = {
              memory = "256Mi"
              cpu    = "250m"
            }
            limits = {
              memory = "512Mi"
              cpu    = "500m"
            }
          }
        }
      }
    }
  }

  depends_on = [kubernetes_config_map.microservices_config]
}

# RabbitMQ Service
resource "kubernetes_service" "rabbitmq" {
  metadata {
    name      = "rabbitmq"
    namespace = kubernetes_namespace.microservices.metadata[0].name
  }

  spec {
    selector = {
      app = kubernetes_deployment.rabbitmq.spec[0].template[0].metadata[0].labels.app
    }

    port {
      port        = 5672
      target_port = 5672
      name        = "amqp"
    }

    port {
      port        = 15672
      target_port = 15672
      name        = "management"
    }

    type = "ClusterIP"
  }
}
