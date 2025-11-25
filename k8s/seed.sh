#!/usr/bin/env bash

# --------------------------------------------------
# Seeds all databases in Kubernetes deployment
# --------------------------------------------------

set -e

echo -e "\033[32mSeeding databases in Kubernetes...\033[0m"
printf '=%.0s' {1..60}
echo ""

# Check kubectl
if ! kubectl version --client >/dev/null 2>&1; then
  echo -e "\033[31mERROR: kubectl is not installed or not in PATH\033[0m"
  exit 1
fi

NAMESPACE="microservices"
echo -e "\033[36mUsing namespace: $NAMESPACE\033[0m"

# --------------------------------------------------
# Wait for Pod function
# --------------------------------------------------
wait_for_pod() {
  local service_name="$1"
  local timeout="${2:-30}"
  local elapsed=0

  echo -e "\033[33mWaiting for $service_name pod to be ready...\033[0m"

  while [ $elapsed -lt $timeout ]; do
    pod=$(kubectl get pods -n "$NAMESPACE" -l app="$service_name" -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)

    if [ -n "$pod" ]; then
      status=$(kubectl get pod "$pod" -n "$NAMESPACE" -o jsonpath='{.status.phase}' 2>/dev/null)
      if [ "$status" = "Running" ]; then
        echo -e "\033[32m✔ Pod $pod is ready\033[0m"
        echo "$pod"
        return
      fi
    fi

    sleep 2
    elapsed=$((elapsed + 2))
  done

  echo -e "\033[33mWarning: $service_name pod not ready after ${timeout}s\033[0m"
  echo ""
}

# --------------------------------------------------
# Seed function
# --------------------------------------------------
seed_service() {
  local service_name="$1"
  local display_name="$2"

  echo ""
  echo -e "\033[36mSeeding $display_name...\033[0m"

  pod=$(kubectl get pods -n "$NAMESPACE" -l app="$service_name" -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)

  if [ -z "$pod" ]; then
    echo -e "\033[31mERROR: No pod found for $service_name\033[0m"
    return 1
  fi

  echo -e "   Pod: \033[90m$pod\033[0m"

  echo -e "   Copying seed script to pod...\033[90m"
  if ! kubectl cp tools/scripts/seed-k8s-databases.js "$NAMESPACE/$pod:/app/seed-k8s-databases.js" 2>/dev/null; then
    echo -e "\033[33m   Warning: Could not copy seed script\033[0m"
  fi

  echo -e "   Executing seed script...\033[90m"
  if kubectl exec -n "$NAMESPACE" "$pod" -- node /app/seed-k8s-databases.js; then
    echo -e "\033[32m   SUCCESS: $display_name seeded successfully\033[0m"
    return 0
  else
    echo -e "\033[31m   ERROR: Failed to seed $display_name\033[0m"
    return 1
  fi
}

# --------------------------------------------------
# Main logic
# --------------------------------------------------

echo ""
echo -e "\033[36mStarting database seeding process...\033[0m"

service_name="shrine-service"
pod=$(wait_for_pod "$service_name" 60)

if [ -z "$pod" ]; then
  echo ""
  echo -e "\033[31mERROR: Could not find a ready pod to execute seeding\033[0m"
  echo -e "\033[33mMake sure your services are deployed:\033[0m"
  echo -e "\033[90m   kubectl get pods -n $NAMESPACE\033[0m"
  exit 1
fi

if seed_service "$service_name" "All Databases"; then
  success=true
else
  success=false
fi

echo ""
printf '=%.0s' {1..60}
echo ""

if [ "$success" = true ]; then
  echo -e "\033[32mSUCCESS: Database seeding completed successfully!\033[0m"
  echo ""
  echo -e "\033[36mSummary:\033[0m"
  echo -e "\033[90m   - Shrines: seeded in shrine-db\033[0m"
  echo ""
  echo -e "\033[32mYou can now test the services!\033[0m"
else
  echo -e "\033[31mERROR: Database seeding failed!\033[0m"
  echo ""
  echo -e "\033[33mTroubleshooting steps:\033[0m"
  echo -e "\033[90m   1. Check if all database services are running:"
  echo "      kubectl get pods -n $NAMESPACE"
  echo "   2. Check pod logs:"
  echo "      kubectl logs -n $NAMESPACE $pod"
  echo "   3. Verify database connectivity:"
  echo "      kubectl exec -n $NAMESPACE $pod -- env\033[0m"
  exit 1
fi
