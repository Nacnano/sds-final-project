variable "master_ip" {
  description = "IP address of the master node (your laptop running Terraform)"
  type        = string
  default     = "192.168.1.10"
}

variable "worker_ips" {
  description = "List of IP addresses for Raspberry Pi worker nodes"
  type        = list(string)
  default     = ["192.168.1.11", "192.168.1.12", "192.168.1.13", "192.168.1.14"]
}

variable "ssh_user" {
  description = "SSH username for WORKER nodes (Raspberry Pis only)"
  type        = string
  default     = "ubuntu"
}

variable "ssh_private_key_path" {
  description = "Path to SSH private key for WORKER nodes (Raspberry Pis only)"
  type        = string
  default     = "~/.ssh/id_rsa"
}

variable "cluster_name" {
  description = "Name of the Kubernetes cluster"
  type        = string
  default     = "sai-mu-cluster"
}

variable "k3s_version" {
  description = "K3s version to install"
  type        = string
  default     = "v1.28.5+k3s1"
}

variable "registry_port" {
  description = "Port for Docker registry on master node"
  type        = number
  default     = 5000
}

variable "install_dashboard" {
  description = "Install Kubernetes dashboard"
  type        = bool
  default     = false
}

variable "node_labels" {
  description = "Labels to apply to worker nodes"
  type        = map(string)
  default = {
    "node-role" = "worker"
    "project"   = "sai-mu"
  }
}
