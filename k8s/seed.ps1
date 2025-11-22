#!/usr/bin/env pwsh

<#
.SYNOPSIS
    Seeds all databases in Kubernetes deployment
.DESCRIPTION
    Executes the seed-all-databases.js script inside a service pod that has access to all databases
#>

Write-Host "Seeding databases in Kubernetes..." -ForegroundColor Green
Write-Host "=" * 60

# Check if kubectl is available
try {
    kubectl version --client --short 2>&1 | Out-Null
} catch {
    Write-Host "ERROR: kubectl is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Set namespace
$NAMESPACE = "microservices"

Write-Host "Using namespace: $NAMESPACE" -ForegroundColor Cyan

# Function to wait for a pod to be ready
function Wait-ForPod {
    param (
        [string]$ServiceName,
        [int]$TimeoutSeconds = 30
    )
    
    Write-Host "Waiting for $ServiceName pod to be ready..." -ForegroundColor Yellow
    
    $elapsed = 0
    while ($elapsed -lt $TimeoutSeconds) {
        $pod = kubectl get pods -n $NAMESPACE -l app=$ServiceName -o jsonpath='{.items[0].metadata.name}' 2>$null
        
        if ($pod) {
            $status = kubectl get pod $pod -n $NAMESPACE -o jsonpath='{.status.phase}' 2>$null
            if ($status -eq "Running") {
                Write-Host "✅ Pod $pod is ready" -ForegroundColor Green
                return $pod
            }
        }
        
        Start-Sleep -Seconds 2
        $elapsed += 2
    }
    
    Write-Host "Warning: $ServiceName pod not ready after ${TimeoutSeconds}s" -ForegroundColor Yellow
    return $null
}

# Function to seed a specific service
function Seed-Service {
    param (
        [string]$ServiceName,
        [string]$DisplayName
    )
    
    Write-Host ""
    Write-Host "Seeding $DisplayName..." -ForegroundColor Cyan
    
    # Get the pod name
    $pod = kubectl get pods -n $NAMESPACE -l app=$ServiceName -o jsonpath='{.items[0].metadata.name}' 2>$null
    
    if (-not $pod) {
        Write-Host "ERROR: No pod found for $ServiceName" -ForegroundColor Red
        return $false
    }
    
    Write-Host "   Pod: $pod" -ForegroundColor Gray
    
    # Copy the seed script to the pod
    Write-Host "   Copying seed script to pod..." -ForegroundColor Gray
    kubectl cp tools/scripts/seed-k8s-databases.js ${NAMESPACE}/${pod}:/app/seed-k8s-databases.js 2>$null
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   Warning: Could not copy seed script" -ForegroundColor Yellow
    }
    
    # Execute the seed script
    Write-Host "   Executing seed script..." -ForegroundColor Gray
    kubectl exec -n $NAMESPACE $pod -- node /app/seed-k8s-databases.js
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   SUCCESS: $DisplayName seeded successfully" -ForegroundColor Green
        return $true
    } else {
        Write-Host "   ERROR: Failed to seed $DisplayName" -ForegroundColor Red
        return $false
    }
}

# Main seeding logic
Write-Host ""
Write-Host "Starting database seeding process..." -ForegroundColor Cyan

# We'll use the shrine-service pod to run the seed script since it has node and pg client installed
$serviceName = "shrine-service"
$pod = Wait-ForPod -ServiceName $serviceName -TimeoutSeconds 60

if (-not $pod) {
    Write-Host ""
    Write-Host "ERROR: Could not find a ready pod to execute seeding" -ForegroundColor Red
    Write-Host "Make sure your services are deployed:" -ForegroundColor Yellow
    Write-Host "   kubectl get pods -n $NAMESPACE" -ForegroundColor Gray
    exit 1
}

# Seed using the shrine-service pod
$success = Seed-Service -ServiceName $serviceName -DisplayName "All Databases"

Write-Host ""
Write-Host ("=" * 60)

if ($success) {
    Write-Host "SUCCESS: Database seeding completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Summary:" -ForegroundColor Cyan
    Write-Host "   - Shrines: seeded in shrine-db" -ForegroundColor Gray
    Write-Host "   - Users: seeded in user-db" -ForegroundColor Gray
    Write-Host "   - Wishes: seeded in wishing-db" -ForegroundColor Gray
    Write-Host "   - Ratings: seeded in rating-db" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Test User Credentials:" -ForegroundColor Cyan
    Write-Host "   Email: john.doe@example.com" -ForegroundColor Gray
    Write-Host "   Password: password123" -ForegroundColor Gray
    Write-Host ""
    Write-Host "You can now test the services!" -ForegroundColor Green
} else {
    Write-Host "ERROR: Database seeding failed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting steps:" -ForegroundColor Yellow
    Write-Host "   1. Check if all database services are running:" -ForegroundColor Gray
    Write-Host "      kubectl get pods -n $NAMESPACE" -ForegroundColor Gray
    Write-Host "   2. Check pod logs for errors:" -ForegroundColor Gray
    Write-Host "      kubectl logs -n $NAMESPACE $pod" -ForegroundColor Gray
    Write-Host "   3. Verify database connectivity from the pod:" -ForegroundColor Gray
    Write-Host "      kubectl exec -n $NAMESPACE $pod -- env" -ForegroundColor Gray
    exit 1
}
