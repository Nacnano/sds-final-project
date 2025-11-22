# K8s Deployment Configuration
# Deploy services to existing K3s cluster

master_ip            = "192.168.0.103"
worker_ips           = ["192.168.0.100", "192.168.0.102", "192.168.0.104", "192.168.0.105"]
ssh_user             = "warissara"
registry_port        = 5000
k8s_manifests_path   = "../k8s"
