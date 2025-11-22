# Master Module Variables
# NOTE: Master is your LOCAL computer running Terraform, no SSH needed

variable "master_ip" {
  description = "IP address of the master node (your computer)"
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
