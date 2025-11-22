# Terraform Setup Script for Windows
# Automates the Terraform deployment for Raspberry Pi Kubernetes Cluster

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('init', 'plan', 'apply', 'destroy', 'verify')]
    [string]$Action = 'plan',
    
    [Parameter(Mandatory=$false)]
    [switch]$AutoApprove
)

$ErrorActionPreference = "Stop"

# Colors for output
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

function Test-Prerequisites {
    Write-ColorOutput "`n=== Checking Prerequisites ===" "Cyan"
    
    # Check Terraform
    try {
        $tfVersion = terraform version
        Write-ColorOutput "✓ Terraform: $($tfVersion[0])" "Green"
    } catch {
        Write-ColorOutput "✗ Terraform not found. Please install from https://www.terraform.io/downloads" "Red"
        exit 1
    }
    
    # Check SSH
    if (-not (Test-Path "$env:USERPROFILE\.ssh\id_rsa")) {
        Write-ColorOutput "⚠ SSH key not found at $env:USERPROFILE\.ssh\id_rsa" "Yellow"
        Write-ColorOutput "  Generate one with: ssh-keygen -t rsa -b 4096" "Yellow"
        $continue = Read-Host "Continue anyway? (y/n)"
        if ($continue -ne 'y') { exit 1 }
    } else {
        Write-ColorOutput "✓ SSH key found" "Green"
    }
    
    # Check terraform.tfvars
    if (-not (Test-Path "terraform.tfvars")) {
        Write-ColorOutput "⚠ terraform.tfvars not found" "Yellow"
        Write-ColorOutput "  Creating from example..." "Yellow"
        Copy-Item "terraform.tfvars.example" "terraform.tfvars" -ErrorAction SilentlyContinue
    } else {
        Write-ColorOutput "✓ terraform.tfvars found" "Green"
    }
}

function Test-NetworkConnectivity {
    Write-ColorOutput "`n=== Testing Network Connectivity ===" "Cyan"
    
    $config = Get-Content "terraform.tfvars" | ConvertFrom-StringData
    $masterIp = $config.master_ip -replace '"', ''
    $workerIps = $config.worker_ips -replace '[\[\]"\s]', '' -split ','
    
    # Test master
    Write-Host "Testing master ($masterIp)... " -NoNewline
    if (Test-Connection -ComputerName $masterIp -Count 1 -Quiet) {
        Write-ColorOutput "✓" "Green"
    } else {
        Write-ColorOutput "✗ Cannot reach master" "Red"
        return $false
    }
    
    # Test workers
    foreach ($ip in $workerIps) {
        Write-Host "Testing worker ($ip)... " -NoNewline
        if (Test-Connection -ComputerName $ip -Count 1 -Quiet) {
            Write-ColorOutput "✓" "Green"
        } else {
            Write-ColorOutput "✗" "Yellow"
        }
    }
    
    return $true
}

function Invoke-TerraformInit {
    Write-ColorOutput "`n=== Initializing Terraform ===" "Cyan"
    terraform init
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput "✓ Terraform initialized successfully" "Green"
    } else {
        Write-ColorOutput "✗ Terraform initialization failed" "Red"
        exit 1
    }
}

function Invoke-TerraformPlan {
    Write-ColorOutput "`n=== Planning Infrastructure ===" "Cyan"
    terraform plan -out=tfplan
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput "✓ Plan created successfully" "Green"
        Write-ColorOutput "`nTo apply this plan, run: .\setup.ps1 -Action apply" "Yellow"
    } else {
        Write-ColorOutput "✗ Planning failed" "Red"
        exit 1
    }
}

function Invoke-TerraformApply {
    Write-ColorOutput "`n=== Applying Infrastructure ===" "Cyan"
    Write-ColorOutput "This will configure your Kubernetes cluster." "Yellow"
    Write-ColorOutput "Estimated time: 10-15 minutes" "Yellow"
    
    if ($AutoApprove) {
        terraform apply -auto-approve
    } else {
        Write-Host "`nProceed? (yes/no): " -NoNewline
        $confirm = Read-Host
        if ($confirm -eq 'yes') {
            terraform apply
        } else {
            Write-ColorOutput "Cancelled by user" "Yellow"
            exit 0
        }
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput "`n✓ Infrastructure deployed successfully!" "Green"
        Show-NextSteps
    } else {
        Write-ColorOutput "✗ Deployment failed" "Red"
        exit 1
    }
}

function Invoke-TerraformDestroy {
    Write-ColorOutput "`n=== Destroying Infrastructure ===" "Cyan"
    Write-ColorOutput "⚠ WARNING: This will remove K3s from all nodes!" "Red"
    
    if ($AutoApprove) {
        terraform destroy -auto-approve
    } else {
        Write-Host "`nType 'yes' to confirm destruction: " -NoNewline
        $confirm = Read-Host
        if ($confirm -eq 'yes') {
            terraform destroy
        } else {
            Write-ColorOutput "Cancelled by user" "Yellow"
            exit 0
        }
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput "✓ Infrastructure destroyed" "Green"
    }
}

function Invoke-ClusterVerification {
    Write-ColorOutput "`n=== Verifying Cluster ===" "Cyan"
    
    $config = Get-Content "terraform.tfvars" | ConvertFrom-StringData
    $masterIp = $config.master_ip -replace '"', ''
    $sshUser = $config.ssh_user -replace '"', ''
    
    Write-ColorOutput "Connecting to master node..." "Yellow"
    ssh -o StrictHostKeyChecking=no "$sshUser@$masterIp" "kubectl get nodes"
    
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput "`n✓ Cluster is operational!" "Green"
        Write-ColorOutput "`nTo access the cluster:" "Cyan"
        Write-ColorOutput "  ssh $sshUser@$masterIp" "White"
    } else {
        Write-ColorOutput "✗ Cannot verify cluster" "Red"
    }
}

function Show-NextSteps {
    Write-ColorOutput "`n============================================" "Cyan"
    Write-ColorOutput "Next Steps:" "Cyan"
    Write-ColorOutput "============================================" "Cyan"
    Write-ColorOutput "1. Verify cluster:" "White"
    Write-ColorOutput "   .\setup.ps1 -Action verify" "Yellow"
    Write-ColorOutput ""
    Write-ColorOutput "2. Build ARM images:" "White"
    Write-ColorOutput "   cd ..\k8s" "Yellow"
    Write-ColorOutput "   .\build-arm.ps1" "Yellow"
    Write-ColorOutput ""
    Write-ColorOutput "3. Deploy application:" "White"
    Write-ColorOutput "   .\deploy-pi.ps1" "Yellow"
    Write-ColorOutput ""
    Write-ColorOutput "4. Check deployment:" "White"
    Write-ColorOutput "   kubectl get pods -n microservices" "Yellow"
    Write-ColorOutput "============================================" "Cyan"
}

# Main execution
Clear-Host
Write-ColorOutput "╔═══════════════════════════════════════════════════╗" "Cyan"
Write-ColorOutput "║  Raspberry Pi Kubernetes Cluster Setup           ║" "Cyan"
Write-ColorOutput "║  สาย.mu - Shrine Discovery Platform              ║" "Cyan"
Write-ColorOutput "╚═══════════════════════════════════════════════════╝" "Cyan"

switch ($Action) {
    'init' {
        Test-Prerequisites
        Invoke-TerraformInit
    }
    'plan' {
        Test-Prerequisites
        if (-not (Test-Path ".terraform")) {
            Invoke-TerraformInit
        }
        Test-NetworkConnectivity
        Invoke-TerraformPlan
    }
    'apply' {
        Test-Prerequisites
        if (-not (Test-Path ".terraform")) {
            Invoke-TerraformInit
        }
        Test-NetworkConnectivity
        Invoke-TerraformApply
    }
    'destroy' {
        Invoke-TerraformDestroy
    }
    'verify' {
        Invoke-ClusterVerification
    }
}

Write-ColorOutput "`nDone!" "Green"
