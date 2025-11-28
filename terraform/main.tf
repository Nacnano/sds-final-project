terraform {
  required_version = ">= 1.0"
  
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.38.0"
    }
    null = {
      source  = "hashicorp/null"
      version = "~> 3.2.0"
    }
  }
}

# Load kubeconfig to get host and user credentials
locals {
  kubeconfig       = yamldecode(file(pathexpand("~/.kube/config")))
  current_context  = var.kube_context
  context          = [for c in local.kubeconfig.contexts : c if c.name == local.current_context][0]
  cluster_name     = local.context.context.cluster
  cluster          = [for c in local.kubeconfig.clusters : c if c.name == local.cluster_name][0]
  user_name        = local.context.context.user
  user             = [for u in local.kubeconfig.users : u if u.name == local.user_name][0]
}

provider "kubernetes" {
  host                   = local.cluster.cluster.server
  cluster_ca_certificate = file("${path.module}/k3s-server-ca.crt")
  client_certificate     = file("${path.module}/client.crt")
  client_key             = file("${path.module}/client.key")
}

# Namespace
resource "kubernetes_namespace" "microservices" {
  metadata {
    name = var.namespace
    labels = {
      name = var.namespace
    }
  }
  lifecycle {
    prevent_destroy = true
  }
}
