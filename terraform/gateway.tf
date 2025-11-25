# API Gateway Deployment
resource "kubernetes_deployment" "api_gateway" {
  metadata {
    name      = "api-gateway"
    namespace = kubernetes_namespace.microservices.metadata[0].name
    labels = {
      app = "api-gateway"
    }
  }

  spec {
    replicas = var.api_gateway_replicas

    strategy {
      type = "RollingUpdate"
      rolling_update {
        max_unavailable = "1"
        max_surge       = "1"
      }
    }

    selector {
      match_labels = {
        app = "api-gateway"
      }
    }

    template {
      metadata {
        labels = {
          app = "api-gateway"
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
          name  = "api-gateway"
          image = "${var.docker_registry}/api-gateway:${var.image_tag}"
          image_pull_policy = "Always"

          port {
            container_port = 3000
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
            name = "GATEWAY_PORT"
            value_from {
              config_map_key_ref {
                name = kubernetes_config_map.microservices_config.metadata[0].name
                key  = "GATEWAY_PORT"
              }
            }
          }

          env {
            name = "SHRINE_SERVICE_URL"
            value_from {
              config_map_key_ref {
                name = kubernetes_config_map.microservices_config.metadata[0].name
                key  = "SHRINE_SERVICE_URL"
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

          env {
            name = "FRONTEND_URL"
            value_from {
              config_map_key_ref {
                name = kubernetes_config_map.microservices_config.metadata[0].name
                key  = "FRONTEND_URL"
              }
            }
          }

          env {
            name = "JWT_SECRET"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.microservices_secrets.metadata[0].name
                key  = "JWT_SECRET"
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

          readiness_probe {
            http_get {
              path = "/"
              port = 3000
            }
            initial_delay_seconds = 10
            period_seconds        = 10
            failure_threshold     = 3
          }

          liveness_probe {
            http_get {
              path = "/"
              port = 3000
            }
            initial_delay_seconds = 30
            period_seconds        = 20
            failure_threshold     = 3
          }
        }
      }
    }
  }

  depends_on = [
    kubernetes_service.shrine_service,
    kubernetes_service.location_service
  ]
}

# API Gateway Service
resource "kubernetes_service" "api_gateway" {
  metadata {
    name      = "api-gateway"
    namespace = kubernetes_namespace.microservices.metadata[0].name
  }

  spec {
    selector = {
      app = "api-gateway"
    }

    port {
      port        = 3000
      target_port = 3000
      node_port   = 30000
    }

    type = "NodePort"
  }

  depends_on = [kubernetes_deployment.api_gateway]
}

# API Gateway PDB
resource "kubernetes_pod_disruption_budget_v1" "api_gateway_pdb" {
  metadata {
    name      = "api-gateway-pdb"
    namespace = kubernetes_namespace.microservices.metadata[0].name
  }

  spec {
    min_available = 2

    selector {
      match_labels = {
        app = "api-gateway"
      }
    }
  }

  depends_on = [kubernetes_deployment.api_gateway]
}

# API Gateway HPA
resource "kubernetes_horizontal_pod_autoscaler_v2" "api_gateway_hpa" {
  count = var.enable_hpa ? 1 : 0

  metadata {
    name      = "api-gateway-hpa"
    namespace = kubernetes_namespace.microservices.metadata[0].name
  }

  spec {
    scale_target_ref {
      api_version = "apps/v1"
      kind        = "Deployment"
      name        = kubernetes_deployment.api_gateway.metadata[0].name
    }

    min_replicas = var.api_gateway_replicas
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

  depends_on = [kubernetes_deployment.api_gateway]
}

# Frontend Deployment
resource "kubernetes_deployment" "frontend" {
  metadata {
    name      = "frontend"
    namespace = kubernetes_namespace.microservices.metadata[0].name
    labels = {
      app = "frontend"
    }
  }

  spec {
    replicas = var.frontend_replicas

    strategy {
      type = "RollingUpdate"
      rolling_update {
        max_unavailable = "1"
        max_surge       = "1"
      }
    }

    selector {
      match_labels = {
        app = "frontend"
      }
    }

    template {
      metadata {
        labels = {
          app = "frontend"
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
                    values   = ["frontend"]
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
          name  = "frontend"
          image = "${var.docker_registry}/frontend:${var.image_tag}"
          image_pull_policy = "Always"

          port {
            container_port = 80
          }

          resources {
            requests = {
              memory = "128Mi"
              cpu    = "100m"
            }
            limits = {
              memory = "256Mi"
              cpu    = "250m"
            }
          }

          readiness_probe {
            http_get {
              path = "/"
              port = 80
            }
            initial_delay_seconds = 10
            period_seconds        = 10
            failure_threshold     = 3
          }

          liveness_probe {
            http_get {
              path = "/"
              port = 80
            }
            initial_delay_seconds = 30
            period_seconds        = 20
            failure_threshold     = 3
          }
        }
      }
    }
  }

  depends_on = [kubernetes_service.api_gateway]
}

# Frontend Service
resource "kubernetes_service" "frontend" {
  metadata {
    name      = "frontend"
    namespace = kubernetes_namespace.microservices.metadata[0].name
  }

  spec {
    selector = {
      app = "frontend"
    }

    port {
      port        = 80
      target_port = 80
      node_port   = 30002
    }

    type = "NodePort"
  }

  depends_on = [kubernetes_deployment.frontend]
}

# Frontend PDB
resource "kubernetes_pod_disruption_budget_v1" "frontend_pdb" {
  metadata {
    name      = "frontend-pdb"
    namespace = kubernetes_namespace.microservices.metadata[0].name
  }

  spec {
    min_available = 1

    selector {
      match_labels = {
        app = "frontend"
      }
    }
  }

  depends_on = [kubernetes_deployment.frontend]
}

# Frontend HPA
resource "kubernetes_horizontal_pod_autoscaler_v2" "frontend_hpa" {
  count = var.enable_hpa ? 1 : 0

  metadata {
    name      = "frontend-hpa"
    namespace = kubernetes_namespace.microservices.metadata[0].name
  }

  spec {
    scale_target_ref {
      api_version = "apps/v1"
      kind        = "Deployment"
      name        = kubernetes_deployment.frontend.metadata[0].name
    }

    min_replicas = var.frontend_replicas
    max_replicas = var.hpa_max_replicas

    metric {
      type = "Resource"
      resource {
        name = "cpu"
        target {
          type                = "Utilization"
          average_utilization = 45
        }
      }
    }
  }

  depends_on = [kubernetes_deployment.frontend]
}
