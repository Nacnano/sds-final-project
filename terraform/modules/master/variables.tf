variable "master_ip" {
  description = "IP address of the master node"
  type        = string
}

variable "ssh_user" {
  description = "SSH username"
  type        = string
}

variable "ssh_private_key_path" {
  description = "Path to SSH private key"
  type        = string
}

variable "cluster_name" {
  description = "Kubernetes cluster name"
  type        = string
}

variable "k3s_version" {
  description = "K3s version to install"
  type        = string
}

variable "registry_port" {
  description = "Docker registry port"
  type        = number
}
