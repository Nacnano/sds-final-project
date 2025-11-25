# Shrine Database PVC
resource "kubernetes_persistent_volume_claim" "shrine_db_pvc" {
  metadata {
    name      = "shrine-db-pvc"
    namespace = kubernetes_namespace.microservices.metadata[0].name
  }

  spec {
    access_modes = ["ReadWriteOnce"]
    resources {
      requests = {
        storage = "1Gi"
      }
    }
  }

  wait_until_bound = false
}

# Shrine Database Deployment
resource "kubernetes_deployment" "shrine_db" {
  metadata {
    name      = "shrine-db"
    namespace = kubernetes_namespace.microservices.metadata[0].name
    labels = {
      app = "shrine-db"
    }
  }

  spec {
    replicas = 1

    selector {
      match_labels = {
        app = "shrine-db"
      }
    }

    template {
      metadata {
        labels = {
          app = "shrine-db"
        }
      }

      spec {
        # Force the pod to run on the master node
        node_selector = {
          "kubernetes.io/hostname" = var.master_node_hostname
        }

        # Allow running on the master even if it is tainted
        toleration {
          key      = "node-role.kubernetes.io/control-plane"
          operator = "Exists"
          effect   = "NoSchedule"
        }

        container {
          name  = "postgres"
          image = "postgres:15-alpine"

          port {
            container_port = 5432
          }

          env {
            name  = "POSTGRES_DB"
            value = "shrine_service"
          }

          env {
            name = "POSTGRES_USER"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.microservices_secrets.metadata[0].name
                key  = "POSTGRES_USER"
              }
            }
          }

          env {
            name = "POSTGRES_PASSWORD"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.microservices_secrets.metadata[0].name
                key  = "POSTGRES_PASSWORD"
              }
            }
          }

          volume_mount {
            name       = "shrine-db-storage"
            mount_path = "/var/lib/postgresql/data"
          }
        }

        volume {
          name = "shrine-db-storage"
          persistent_volume_claim {
            claim_name = kubernetes_persistent_volume_claim.shrine_db_pvc.metadata[0].name
          }
        }
      }
    }
  }

  depends_on = [
    kubernetes_config_map.microservices_config,
    kubernetes_secret.microservices_secrets
  ]
}

# Shrine Database Service
resource "kubernetes_service" "shrine_db" {
  metadata {
    name      = "shrine-db"
    namespace = kubernetes_namespace.microservices.metadata[0].name
  }

  spec {
    selector = {
      app = "shrine-db"
    }

    port {
      port        = 5432
      target_port = 5432
    }

    type = "ClusterIP"
  }

  depends_on = [kubernetes_deployment.shrine_db]
}

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
          "kubernetes.io/arch" = var.worker_node_arch
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

  depends_on = [
    kubernetes_config_map.microservices_config,
    kubernetes_secret.microservices_secrets
  ]
}

# RabbitMQ Service
resource "kubernetes_service" "rabbitmq" {
  metadata {
    name      = "rabbitmq"
    namespace = kubernetes_namespace.microservices.metadata[0].name
  }

  spec {
    selector = {
      app = "rabbitmq"
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

  depends_on = [kubernetes_deployment.rabbitmq]
}
