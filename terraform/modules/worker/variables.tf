variable "worker_ips" {
  description = "List of worker node IP addresses"
  type        = list(string)
}

variable "ssh_user" {
  description = "SSH username"
  type        = string
}

variable "ssh_private_key_path" {
  description = "Path to SSH private key"
  type        = string
}

variable "master_ip" {
  description = "Master node IP address"
  type        = string
}

variable "k3s_token" {
  description = "K3s token from master for joining cluster"
  type        = string
  sensitive   = true
}

variable "k3s_version" {
  description = "K3s version to install"
  type        = string
}
