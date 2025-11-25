# Location Service Deployment
resource "kubernetes_deployment" "location_service" {
  metadata {
    name      = "location-service"
    namespace = kubernetes_namespace.microservices.metadata[0].name
    labels = {
      app = "location-service"
    }
  }

  spec {
    replicas = var.location_service_replicas

    selector {
      match_labels = {
        app = "location-service"
      }
    }

    template {
      metadata {
        labels = {
          app = "location-service"
        }
      }

      spec {
        node_selector = {
          "kubernetes.io/arch" = var.worker_node_arch
        }

        # Anti-affinity for spreading pods
        affinity {
          pod_anti_affinity {
            preferred_during_scheduling_ignored_during_execution {
              weight = 100
              pod_affinity_term {
                label_selector {
                  match_expressions {
                    key      = "app"
                    operator = "In"
                    values   = ["api-gateway"]
                  }
                }
                topology_key = "kubernetes.io/hostname"
              }
            }
          }
        }

        # Tolerations for node failures
        toleration {
          key                = "node.kubernetes.io/unreachable"
          operator           = "Exists"
          effect             = "NoExecute"
          toleration_seconds = 5
        }

        toleration {
          key                = "node.kubernetes.io/not-ready"
          operator           = "Exists"
          effect             = "NoExecute"
          toleration_seconds = 5
        }

        container {
          name  = "location-service"
          image = "${var.docker_registry}/location-service:${var.image_tag}"
          image_pull_policy = "Always"

          port {
            container_port = 5006
          }

          env {
            name = "NODE_ENV"
            value_from {
              config_map_key_ref {
                name = kubernetes_config_map.microservices_config.metadata[0].name
                key  = "NODE_ENV"
              }
            }
          }

          env {
            name = "LOCATION_GRPC_PORT"
            value_from {
              config_map_key_ref {
                name = kubernetes_config_map.microservices_config.metadata[0].name
                key  = "LOCATION_GRPC_PORT"
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

# Location Service
resource "kubernetes_service" "location_service" {
  metadata {
    name      = "location-service"
    namespace = kubernetes_namespace.microservices.metadata[0].name
  }

  spec {
    selector = {
      app = "location-service"
    }

    port {
      port        = 5006
      target_port = 5006
    }

    type = "ClusterIP"
  }

  depends_on = [kubernetes_deployment.location_service]
}

# Location Service HPA
resource "kubernetes_horizontal_pod_autoscaler_v2" "location_service_hpa" {
  count = var.enable_hpa ? 1 : 0

  metadata {
    name      = "location-service-hpa"
    namespace = kubernetes_namespace.microservices.metadata[0].name
  }

  spec {
    scale_target_ref {
      api_version = "apps/v1"
      kind        = "Deployment"
      name        = kubernetes_deployment.location_service.metadata[0].name
    }

    min_replicas = var.location_service_replicas
    max_replicas = var.hpa_max_replicas

    metric {
      type = "Resource"
      resource {
        name = "cpu"
        target {
          type                = "Utilization"
          average_utilization = 50
        }
      }
    }
  }

  depends_on = [kubernetes_deployment.location_service]
}

# Shrine Service Deployment
resource "kubernetes_deployment" "shrine_service" {
  metadata {
    name      = "shrine-service"
    namespace = kubernetes_namespace.microservices.metadata[0].name
    labels = {
      app = "shrine-service"
    }
  }

  spec {
    replicas = var.shrine_service_replicas

    selector {
      match_labels = {
        app = "shrine-service"
      }
    }

    template {
      metadata {
        labels = {
          app = "shrine-service"
        }
      }

      spec {
        node_selector = {
          "kubernetes.io/arch" = var.worker_node_arch
        }

        # Anti-affinity for spreading pods
        affinity {
          pod_anti_affinity {
            preferred_during_scheduling_ignored_during_execution {
              weight = 100
              pod_affinity_term {
                label_selector {
                  match_expressions {
                    key      = "app"
                    operator = "In"
                    values   = ["api-gateway"]
                  }
                }
                topology_key = "kubernetes.io/hostname"
              }
            }
          }
        }

        # Tolerations for node failures
        toleration {
          key                = "node.kubernetes.io/unreachable"
          operator           = "Exists"
          effect             = "NoExecute"
          toleration_seconds = 5
        }

        toleration {
          key                = "node.kubernetes.io/not-ready"
          operator           = "Exists"
          effect             = "NoExecute"
          toleration_seconds = 5
        }

        container {
          name  = "shrine-service"
          image = "${var.docker_registry}/shrine-service:${var.image_tag}"
          image_pull_policy = "Always"

          port {
            container_port = 5001
          }

          env {
            name = "NODE_ENV"
            value_from {
              config_map_key_ref {
                name = kubernetes_config_map.microservices_config.metadata[0].name
                key  = "NODE_ENV"
              }
            }
          }

          env {
            name = "SHRINE_GRPC_PORT"
            value_from {
              config_map_key_ref {
                name = kubernetes_config_map.microservices_config.metadata[0].name
                key  = "SHRINE_GRPC_PORT"
              }
            }
          }

          env {
            name = "DATABASE_HOST"
            value_from {
              config_map_key_ref {
                name = kubernetes_config_map.microservices_config.metadata[0].name
                key  = "SHRINE_DATABASE_HOST"
              }
            }
          }

          env {
            name = "DATABASE_PORT"
            value_from {
              config_map_key_ref {
                name = kubernetes_config_map.microservices_config.metadata[0].name
                key  = "SHRINE_DATABASE_PORT"
              }
            }
          }

          env {
            name = "DATABASE_USER"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.microservices_secrets.metadata[0].name
                key  = "DATABASE_USER"
              }
            }
          }

          env {
            name = "DATABASE_PASSWORD"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.microservices_secrets.metadata[0].name
                key  = "DATABASE_PASSWORD"
              }
            }
          }

          env {
            name = "RABBITMQ_URL"
            value_from {
              config_map_key_ref {
                name = kubernetes_config_map.microservices_config.metadata[0].name
                key  = "RABBITMQ_URL"
              }
            }
          }

          env {
            name = "LOCATION_SERVICE_URL"
            value_from {
              config_map_key_ref {
                name = kubernetes_config_map.microservices_config.metadata[0].name
                key  = "LOCATION_SERVICE_URL"
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
    kubernetes_service.shrine_db,
    kubernetes_service.location_service,
    kubernetes_service.rabbitmq
  ]
}

# Shrine Service
resource "kubernetes_service" "shrine_service" {
  metadata {
    name      = "shrine-service"
    namespace = kubernetes_namespace.microservices.metadata[0].name
  }

  spec {
    selector = {
      app = "shrine-service"
    }

    port {
      port        = 5001
      target_port = 5001
    }

    type = "ClusterIP"
  }

  depends_on = [kubernetes_deployment.shrine_service]
}

# Shrine Service HPA
resource "kubernetes_horizontal_pod_autoscaler_v2" "shrine_service_hpa" {
  count = var.enable_hpa ? 1 : 0

  metadata {
    name      = "shrine-service-hpa"
    namespace = kubernetes_namespace.microservices.metadata[0].name
  }

  spec {
    scale_target_ref {
      api_version = "apps/v1"
      kind        = "Deployment"
      name        = kubernetes_deployment.shrine_service.metadata[0].name
    }

    min_replicas = var.shrine_service_replicas
    max_replicas = var.hpa_max_replicas

    metric {
      type = "Resource"
      resource {
        name = "cpu"
        target {
          type                = "Utilization"
          average_utilization = 50
        }
      }
    }
  }

  depends_on = [kubernetes_deployment.shrine_service]
}
