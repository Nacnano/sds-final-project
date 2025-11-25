variable "namespace" {
  description = "Kubernetes namespace for microservices"
  type        = string
  default     = "microservices"
}

variable "kube_context" {
  description = "Kubernetes context to use"
  type        = string
  default     = "default"
}

variable "registry_url" {
  description = "Docker registry URL"
  type        = string
  default     = "192.168.0.106:5000"
}

variable "node_hostname" {
  description = "Kubernetes node hostname for database"
  type        = string
  default     = "warissara-virtualbox"
}

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

variable "pgadmin_email" {
  description = "PgAdmin default email"
  type        = string
  default     = "admin@example.com"
}

variable "pgadmin_password" {
  description = "PgAdmin default password"
  type        = string
  default     = "admin"
  sensitive   = true
}

variable "frontend_url" {
  description = "Frontend URL"
  type        = string
  default     = "http://localhost:30002"
}

variable "api_gateway_replicas" {
  description = "Number of API Gateway replicas"
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

variable "frontend_replicas" {
  description = "Number of Frontend replicas"
  type        = number
  default     = 2
}
