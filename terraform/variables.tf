variable "master_ip" {
  description = "IP address of the K3s master node"
  type        = string
  default     = "192.168.0.103"
}

variable "worker_ips" {
  description = "List of IP addresses for Raspberry Pi worker nodes"
  type        = list(string)
  default     = ["192.168.0.100", "192.168.0.102", "192.168.0.104", "192.168.0.105"]
}

variable "ssh_user" {
  description = "SSH username for worker nodes"
  type        = string
  default     = "warissara"
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
