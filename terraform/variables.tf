variable "master_ip" {
  description = "IP address of the K3s master node (existing cluster)"
  type        = string
  default     = "192.168.0.103"
}

variable "registry_port" {
  description = "Port for Docker registry on master node"
  type        = number
  default     = 5000
}

variable "k8s_manifests_path" {
  description = "Path to Kubernetes manifests directory"
  type        = string
  default     = "../k8s"
}
