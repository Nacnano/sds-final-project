# K8s Deployment Module
# Deploys application services to existing K3s cluster

variable "master_ip" {
  description = "IP address of the K3s master node"
  type        = string
}

variable "k8s_manifests_path" {
  description = "Path to Kubernetes manifests directory"
  type        = string
  default     = "../k8s"
}
