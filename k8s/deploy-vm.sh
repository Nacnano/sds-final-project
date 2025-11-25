#!/bin/bash

set -e  # Exit immediately if a command fails

echo -e "\e[32mDeploying Kubernetes resources...\e[0m"

# 1. Create namespace
echo -e "\n\e[33m1. Creating namespace...\e[0m"
kubectl apply -f k8s/namespace.yaml

# 2. Create ConfigMap and Secrets
echo -e "\n\e[33m2. Creating ConfigMap and Secrets...\e[0m"
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml

# 3. Deploy databases
echo -e "\n\e[33m3. Deploying databases...\e[0m"
kubectl apply -f k8s/shrine-db.yaml

# 4. Deploy RabbitMQ
echo -e "\n\e[33m4. Deploying RabbitMQ...\e[0m"
kubectl apply -f k8s/rabbitmq.yaml

# Wait for databases to be ready
echo -e "\n\e[33m5. Waiting for databases to be ready...\e[0m"
sleep 5

# 6. Deploy microservices
echo -e "\n\e[33m6. Deploying microservices...\e[0m"
kubectl apply -f k8s/shrine-service.yaml
kubectl apply -f k8s/location-service.yaml

# Wait for services to be ready
echo -e "\n\e[33m7. Waiting for services to be ready...\e[0m"
sleep 5

# 8. Deploy API Gateway
echo -e "\n\e[33m8. Deploying API Gateway...\e[0m"
kubectl apply -f k8s/api-gateway.yaml

# 9. Deploy Metrics Server (for HPA)
echo -e "\n\e[33m9. Deploying Metrics Server...\e[0m"
kubectl apply -f k8s/components.yaml
# Run patch script (convert to Bash if needed)
bash k8s/patch-metrics-server.sh || echo "Patch script failed or not converted"

# 10. Deploy pgAdmin (optional)
echo -e "\n\e[33m10. Deploying pgAdmin...\e[0m"
kubectl apply -f k8s/pgadmin.yaml

# 11. Show deployment status
echo -e "\n\e[33m11. Checking deployment status...\e[0m"
kubectl get all -n microservices

# 12. Seed databases
echo -e "\n\e[33m12. Seeding databases...\e[0m"
bash ./k8s/seed.sh || echo "Database seed script failed or not converted"

# 13. Deploy frontend
# echo -e "\n\e[33m13. Deploying frontend...\e[0m"
# kubectl apply -f k8s/frontend.yaml

echo -e "\n\e[32mDeployment complete!\e[0m"
echo -e "\n\e[36mTo access the services:\e[0m"
echo "- API Gateway: http://192.168.0.106:30000"
echo "- Frontend: http://192.168.0.106:30002"
echo "- pgAdmin: http://192.168.0.106:30080"
echo "- Metrics Server: (Internal only, check logs)"
echo -e "\n\e[36mTo view logs:\e[0m"
echo "kubectl logs -n microservices -l app=<service-name>"
echo -e "\n\e[36mTo view pods:\e[0m"
echo "kubectl get pods -n microservices"
