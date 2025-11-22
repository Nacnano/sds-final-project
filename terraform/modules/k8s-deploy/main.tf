# K8s Deployment Module - Deploy services to existing cluster

resource "null_resource" "verify_cluster" {
  provisioner "local-exec" {
    command = <<-EOT
      echo '=== Verifying cluster connectivity ==='
      if [ ! -f "$HOME/.kube/config" ]; then
        echo "Error: kubeconfig not found at $HOME/.kube/config"
        exit 1
      fi
      
      # Update kubeconfig to use correct master IP
      sed -i "s|server: https://127.0.0.1:6443|server: https://${var.master_ip}:6443|g" $HOME/.kube/config
      
      export KUBECONFIG=$HOME/.kube/config
      kubectl cluster-info || { echo "Error: Cannot connect to cluster"; exit 1; }
      echo '✓ Cluster is accessible'
    EOT
    interpreter = ["bash", "-c"]
  }
}

resource "null_resource" "deploy_namespace" {
  depends_on = [null_resource.verify_cluster]

  provisioner "local-exec" {
    command = <<-EOT
      echo '=== Creating namespace ==='
      export KUBECONFIG=$HOME/.kube/config
      kubectl apply -f ${var.k8s_manifests_path}/namespace.yaml
    EOT
    interpreter = ["bash", "-c"]
  }
}

resource "null_resource" "deploy_secrets" {
  depends_on = [null_resource.deploy_namespace]

  provisioner "local-exec" {
    command = <<-EOT
      echo '=== Deploying secrets and configmaps ==='
      export KUBECONFIG=$HOME/.kube/config
      kubectl apply -f ${var.k8s_manifests_path}/secrets.yaml
      kubectl apply -f ${var.k8s_manifests_path}/configmap.yaml
    EOT
    interpreter = ["bash", "-c"]
  }
}

resource "null_resource" "deploy_databases" {
  depends_on = [null_resource.deploy_secrets]

  provisioner "local-exec" {
    command = <<-EOT
      echo '=== Deploying databases ==='
      export KUBECONFIG=$HOME/.kube/config
      kubectl apply -f ${var.k8s_manifests_path}/shrine-db.yaml
      kubectl apply -f ${var.k8s_manifests_path}/rabbitmq.yaml
      
      echo 'Waiting for databases to be ready...'
      kubectl wait --for=condition=ready pod -l app=shrine-db -n microservices --timeout=300s || true
      kubectl wait --for=condition=ready pod -l app=rabbitmq -n microservices --timeout=300s || true
    EOT
    interpreter = ["bash", "-c"]
  }
}

resource "null_resource" "deploy_location_service" {
  depends_on = [null_resource.deploy_databases]

  provisioner "local-exec" {
    command = <<-EOT
      echo '=== Deploying location service ==='
      export KUBECONFIG=$HOME/.kube/config
      REGISTRY="${var.master_ip}:${var.registry_port}"
      sed -e "s|image: location-service:latest|image: $REGISTRY/location-service:latest|g" \
          -e "s|imagePullPolicy: Never|imagePullPolicy: Always|g" \
          ${var.k8s_manifests_path}/location-service.yaml | kubectl apply -f -
      
      echo 'Waiting for location service...'
      kubectl wait --for=condition=ready pod -l app=location-service -n microservices --timeout=300s || true
    EOT
    interpreter = ["bash", "-c"]
  }
}

resource "null_resource" "deploy_shrine_service" {
  depends_on = [null_resource.deploy_location_service]

  provisioner "local-exec" {
    command = <<-EOT
      echo '=== Deploying shrine service ==='
      export KUBECONFIG=$HOME/.kube/config
      REGISTRY="${var.master_ip}:${var.registry_port}"
      sed -e "s|image: shrine-service:latest|image: $REGISTRY/shrine-service:latest|g" \
          -e "s|imagePullPolicy: Never|imagePullPolicy: Always|g" \
          ${var.k8s_manifests_path}/shrine-service.yaml | kubectl apply -f -
      
      echo 'Waiting for shrine service...'
      kubectl wait --for=condition=ready pod -l app=shrine-service -n microservices --timeout=300s || true
    EOT
    interpreter = ["bash", "-c"]
  }
}

resource "null_resource" "deploy_api_gateway" {
  depends_on = [null_resource.deploy_shrine_service]

  provisioner "local-exec" {
    command = <<-EOT
      echo '=== Deploying API gateway and frontend ==='
      export KUBECONFIG=$HOME/.kube/config
      REGISTRY="${var.master_ip}:${var.registry_port}"
      sed -e "s|image: api-gateway:latest|image: $REGISTRY/api-gateway:latest|g" \
          -e "s|image: frontend:latest|image: $REGISTRY/frontend:latest|g" \
          -e "s|imagePullPolicy: Never|imagePullPolicy: Always|g" \
          ${var.k8s_manifests_path}/api-gateway.yaml | kubectl apply -f -
    EOT
    interpreter = ["bash", "-c"]
  }
}

resource "null_resource" "verify_deployment" {
  depends_on = [null_resource.deploy_api_gateway]

  provisioner "local-exec" {
    command = <<-EOT
      echo '=========================================='
      echo 'Deployment Complete!'
      echo '=========================================='
      export KUBECONFIG=$HOME/.kube/config
      
      echo ''
      echo 'Pod Status:'
      kubectl get pods -n microservices
      
      echo ''
      echo 'Services:'
      kubectl get svc -n microservices
      
      echo ''
      echo 'Access Points:'
      echo "  Frontend:    http://${var.master_ip}:30002"
      echo "  API Gateway: http://${var.master_ip}:30000"
      echo ''
    EOT
    interpreter = ["bash", "-c"]
  }
}
