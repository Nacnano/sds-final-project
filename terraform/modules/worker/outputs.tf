output "worker_status" {
  description = "Status of worker nodes"
  value = [
    for idx, ip in var.worker_ips : {
      node_id = "pi-${idx + 1}"
      ip      = ip
      status  = "Configured"
    }
  ]
}

output "worker_count" {
  description = "Number of worker nodes configured"
  value       = length(var.worker_ips)
}
