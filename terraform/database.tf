# Shrine Database PVC
resource "kubernetes_persistent_volume_claim" "shrine_db" {
  wait_until_bound = false

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
        node_selector = {
          "kubernetes.io/hostname" = var.node_hostname
        }

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
            claim_name = kubernetes_persistent_volume_claim.shrine_db.metadata[0].name
          }
        }
      }
    }
  }

  depends_on = [
    kubernetes_secret.microservices_secrets,
    kubernetes_persistent_volume_claim.shrine_db
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
      app = kubernetes_deployment.shrine_db.spec[0].template[0].metadata[0].labels.app
    }

    port {
      port        = 5432
      target_port = 5432
    }

    type = "ClusterIP"
  }
}

# Database Seeding
resource "null_resource" "seed_databases" {
  # Trigger seed when shrine-service deployment changes
  triggers = {
    shrine_service_id = kubernetes_deployment.shrine_service.id
    shrine_db_id      = kubernetes_deployment.shrine_db.id
  }

  provisioner "local-exec" {
    command     = "cd ${path.module}/.. && ./k8s/seed.sh"
    working_dir = path.module
    interpreter = ["/bin/bash", "-c"]
  }

  depends_on = [
    kubernetes_deployment.shrine_service,
    kubernetes_deployment.shrine_db,
    kubernetes_service.shrine_db
  ]
}
