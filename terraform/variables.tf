variable "kubeconfig_path" {
  description = "Path to kubeconfig file for K3s cluster"
  type        = string
  default     = "~/.kube/config"
}

variable "namespace" {
  description = "Kubernetes namespace for microservices"
  type        = string
  default     = "microservices"
}

variable "docker_registry" {
  description = "Docker registry URL for ARM images"
  type        = string
  default     = "192.168.0.106:5000"
}

variable "image_tag" {
  description = "Docker image tag"
  type        = string
  default     = "latest"
}

variable "master_node_hostname" {
  description = "Hostname of the master node for database placement"
  type        = string
  default     = "warissara-virtualbox"
}

# Database Configuration
variable "postgres_user" {
  description = "PostgreSQL username"
  type        = string
  default     = "postgres"
  sensitive   = true
}

variable "postgres_password" {
  description = "PostgreSQL password"
  type        = string
  default     = "postgres"
  sensitive   = true
}

variable "jwt_secret" {
  description = "JWT secret for authentication"
  type        = string
  default     = "cr2YO0XOTY9t9Ijc6k59NU7KUnwn29uvIwzNfKXuiMItC+rAAOeDcDPjl6iq9+O+w9218kt584Zb5FwjWsDqYw=="
  sensitive   = true
}

# Replica Configuration
variable "api_gateway_replicas" {
  description = "Number of API Gateway replicas"
  type        = number
  default     = 2
}

variable "frontend_replicas" {
  description = "Number of Frontend replicas"
  type        = number
  default     = 2
}

variable "shrine_service_replicas" {
  description = "Number of Shrine Service replicas"
  type        = number
  default     = 2
}

variable "location_service_replicas" {
  description = "Number of Location Service replicas"
  type        = number
  default     = 2
}

# Node Selector
variable "worker_node_arch" {
  description = "Architecture for worker nodes (arm64 for Raspberry Pi)"
  type        = string
  default     = "arm64"
}

# HPA Configuration
variable "enable_hpa" {
  description = "Enable Horizontal Pod Autoscaler"
  type        = bool
  default     = true
}

variable "hpa_max_replicas" {
  description = "Maximum replicas for HPA"
  type        = number
  default     = 2
}
