#!/bin/bash

echo -e "\e[31mDeleting all Kubernetes resources...\e[0m"

echo -e "\n\e[33m1. Deleting pgAdmin...\e[0m"
kubectl delete -f k8s/pgadmin.yaml

echo -e "\n\e[33m2. Deleting API Gateway...\e[0m"
kubectl delete -f k8s/api-gateway.yaml

echo -e "\n\e[33m3. Deleting microservices...\e[0m"
kubectl delete -f k8s/location-service.yaml
kubectl delete -f k8s/shrine-service.yaml

echo -e "\n\e[33m4. Deleting RabbitMQ...\e[0m"
kubectl delete -f k8s/rabbitmq.yaml

echo -e "\n\e[33m5. Deleting databases...\e[0m"
kubectl delete -f k8s/shrine-db.yaml

echo -e "\n\e[33m6. Deleting ConfigMap and Secrets...\e[0m"
kubectl delete -f k8s/configmap.yaml
kubectl delete -f k8s/secrets.yaml

echo -e "\n\e[33mDo you want to delete the namespace 'microservices'? (y/n)\e[0m"
read response
if [[ "$response" == "y" || "$response" == "Y" ]]; then
    kubectl delete namespace microservices
    echo -e "\e[32mNamespace deleted.\e[0m"
fi

echo -e "\n\e[32mCleanup complete!\e[0m"
