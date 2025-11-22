# K8s Deployment Module - Deploy services to existing cluster

resource "null_resource" "verify_cluster" {
  provisioner "local-exec" {
    command     = "bash -c \"echo '=== Verifying cluster connectivity ===' && if [ ! -f $HOME/.kube/config ]; then echo 'Error: kubeconfig not found'; exit 1; fi && sed -i 's|server: https://127.0.0.1:6443|server: https://${var.master_ip}:6443|g' $HOME/.kube/config && export KUBECONFIG=$HOME/.kube/config && kubectl cluster-info && echo 'Cluster is accessible'\""
    interpreter = ["bash", "-c"]
  }
}

resource "null_resource" "deploy_namespace" {
  depends_on = [null_resource.verify_cluster]

  provisioner "local-exec" {
    command     = "bash -c \"echo '=== Creating namespace ===' && export KUBECONFIG=$HOME/.kube/config && kubectl apply -f ${var.k8s_manifests_path}/namespace.yaml\""
    interpreter = ["bash", "-c"]
  }
}

resource "null_resource" "deploy_secrets" {
  depends_on = [null_resource.deploy_namespace]

  provisioner "local-exec" {
    command     = "bash -c \"echo '=== Deploying secrets and configmaps ===' && export KUBECONFIG=$HOME/.kube/config && kubectl apply -f ${var.k8s_manifests_path}/secrets.yaml && kubectl apply -f ${var.k8s_manifests_path}/configmap.yaml\""
    interpreter = ["bash", "-c"]
  }
}

resource "null_resource" "deploy_databases" {
  depends_on = [null_resource.deploy_secrets]

  provisioner "local-exec" {
    command     = "bash -c \"echo '=== Deploying databases ===' && export KUBECONFIG=$HOME/.kube/config && kubectl apply -f ${var.k8s_manifests_path}/shrine-db.yaml && kubectl apply -f ${var.k8s_manifests_path}/rabbitmq.yaml && echo 'Waiting for databases...' && kubectl wait --for=condition=ready pod -l app=shrine-db -n microservices --timeout=300s || true && kubectl wait --for=condition=ready pod -l app=rabbitmq -n microservices --timeout=300s || true\""
    interpreter = ["bash", "-c"]
  }
}

resource "null_resource" "deploy_location_service" {
  depends_on = [null_resource.deploy_databases]

  provisioner "local-exec" {
    command     = "bash -c \"echo '=== Deploying location service ===' && export KUBECONFIG=$HOME/.kube/config && sed -e 's|image: location-service:latest|image: nacnano/sds-final-project-location-service:latest|g' -e 's|imagePullPolicy: Never|imagePullPolicy: Always|g' ${var.k8s_manifests_path}/location-service.yaml | kubectl apply -f - && kubectl wait --for=condition=ready pod -l app=location-service -n microservices --timeout=300s || true\""
    interpreter = ["bash", "-c"]
  }
}

resource "null_resource" "deploy_shrine_service" {
  depends_on = [null_resource.deploy_location_service]

  provisioner "local-exec" {
    command     = "bash -c \"echo '=== Deploying shrine service ===' && export KUBECONFIG=$HOME/.kube/config && sed -e 's|image: shrine-service:latest|image: nacnano/sds-final-project-shrine-service:latest|g' -e 's|imagePullPolicy: Never|imagePullPolicy: Always|g' ${var.k8s_manifests_path}/shrine-service.yaml | kubectl apply -f - && kubectl wait --for=condition=ready pod -l app=shrine-service -n microservices --timeout=300s || true\""
    interpreter = ["bash", "-c"]
  }
}

resource "null_resource" "deploy_api_gateway" {
  depends_on = [null_resource.deploy_shrine_service]

  provisioner "local-exec" {
    command     = "bash -c \"echo '=== Deploying API gateway and frontend ===' && export KUBECONFIG=$HOME/.kube/config && sed -e 's|image: api-gateway:latest|image: nacnano/sds-final-project-api-gateway:latest|g' -e 's|image: frontend:latest|image: nacnano/sds-final-project-frontend:latest|g' -e 's|imagePullPolicy: Never|imagePullPolicy: Always|g' ${var.k8s_manifests_path}/api-gateway.yaml | kubectl apply -f -\""
    interpreter = ["bash", "-c"]
  }
}

resource "null_resource" "verify_deployment" {
  depends_on = [null_resource.deploy_api_gateway]

  provisioner "local-exec" {
    command     = "bash -c \"echo '==========================================' && echo 'Deployment Complete!' && echo '==========================================' && export KUBECONFIG=$HOME/.kube/config && echo '' && echo 'Pod Status:' && kubectl get pods -n microservices && echo '' && echo 'Services:' && kubectl get svc -n microservices && echo '' && echo 'Access Points:' && echo '  Frontend:    http://${var.master_ip}:30002' && echo '  API Gateway: http://${var.master_ip}:30000' && echo ''\""
    interpreter = ["bash", "-c"]
  }
}
