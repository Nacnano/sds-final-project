# Terraform Deployment Methods - Complete Comparison

## Available Options

### 1. Native Windows PowerShell ⚡

**Best for:** Windows users with Terraform already installed

```powershell
cd terraform
.\setup.ps1 -Action apply -AutoApprove
```

**Pros:**

- ✅ Fastest on Windows
- ✅ No additional dependencies
- ✅ Direct execution

**Cons:**

- ⚠️ May have SSH compatibility issues
- ⚠️ Windows-specific paths

---

### 2. WSL (via PowerShell) 🐧

**Best for:** Windows users wanting Linux compatibility

```powershell
cd terraform
.\setup-wsl.ps1 -Action apply -UseWSL -AutoApprove
```

**Pros:**

- ✅ Better SSH compatibility
- ✅ Same commands as Linux/Mac
- ✅ No path issues
- ✅ Automatic Terraform installation

**Cons:**

- ⚠️ Requires WSL setup
- ⚠️ Slightly slower than native

---

### 3. Direct WSL/Linux/Mac 🖥️

**Best for:** Linux/Mac users or WSL power users

```bash
cd terraform
./setup.sh apply auto-approve
```

**Pros:**

- ✅ Native Linux environment
- ✅ Best SSH compatibility
- ✅ Cross-platform scripts

**Cons:**

- ⚠️ Requires WSL on Windows

---

### 4. Manual Terraform Commands 📝

**Best for:** Advanced users who want full control

```bash
terraform init
terraform plan
terraform apply
```

**Pros:**

- ✅ Maximum control
- ✅ Standard Terraform workflow
- ✅ Works everywhere

**Cons:**

- ⚠️ No validation checks
- ⚠️ Manual network testing

---

## Quick Decision Guide

```
Start here
    |
    ├─ Are you on Windows?
    │   ├─ Yes ──> Do you have WSL?
    │   │   ├─ Yes ──> Use setup-wsl.ps1 (Option 2) ✨ RECOMMENDED
    │   │   └─ No  ──> Use setup.ps1 (Option 1)
    │   │
    │   └─ No (Linux/Mac) ──> Use setup.sh (Option 3)
    │
    └─ Are you experienced with Terraform?
        └─ Yes ──> Use manual commands (Option 4)
```

## Detailed Comparison

| Feature               | Native Windows | WSL (PowerShell)   | Direct WSL/Linux | Manual  |
| --------------------- | -------------- | ------------------ | ---------------- | ------- |
| **OS**                | Windows        | Windows            | Any              | Any     |
| **Setup Time**        | 1 min          | 5 min (first time) | 1 min            | 1 min   |
| **SSH Compatibility** | Good           | Excellent          | Excellent        | Depends |
| **Ease of Use**       | Easy           | Easy               | Medium           | Hard    |
| **Auto-Validation**   | ✅             | ✅                 | ✅               | ❌      |
| **Error Handling**    | ✅             | ✅                 | ✅               | Manual  |
| **Cross-Platform**    | ❌             | ✅                 | ✅               | ✅      |

## Installation Requirements

### Option 1: Native Windows

```powershell
# Install Terraform
choco install terraform

# Or download from terraform.io
```

### Option 2: WSL via PowerShell

```powershell
# Install WSL (if not installed)
wsl --install -d Ubuntu-22.04

# Script auto-installs Terraform in WSL
```

### Option 3: Direct WSL/Linux

```bash
# Install Terraform (if not installed)
wget https://releases.hashicorp.com/terraform/1.6.0/terraform_1.6.0_linux_amd64.zip
unzip terraform_1.6.0_linux_amd64.zip
sudo mv terraform /usr/local/bin/
```

### Option 4: Manual

- Same as Option 1 or 3 depending on OS

## Usage Examples

### All Operations

| Operation      | Option 1                      | Option 2                                  | Option 3             |
| -------------- | ----------------------------- | ----------------------------------------- | -------------------- |
| **Initialize** | `.\setup.ps1 -Action init`    | `.\setup-wsl.ps1 -Action init -UseWSL`    | `./setup.sh init`    |
| **Plan**       | `.\setup.ps1 -Action plan`    | `.\setup-wsl.ps1 -Action plan -UseWSL`    | `./setup.sh plan`    |
| **Apply**      | `.\setup.ps1 -Action apply`   | `.\setup-wsl.ps1 -Action apply -UseWSL`   | `./setup.sh apply`   |
| **Verify**     | `.\setup.ps1 -Action verify`  | `.\setup-wsl.ps1 -Action verify -UseWSL`  | `./setup.sh verify`  |
| **Destroy**    | `.\setup.ps1 -Action destroy` | `.\setup-wsl.ps1 -Action destroy -UseWSL` | `./setup.sh destroy` |

## Common Scenarios

### Scenario 1: First Time Setup (Windows)

```powershell
# Install WSL (if not done)
wsl --install -d Ubuntu-22.04
# Restart computer

# Setup cluster
cd terraform
.\setup-wsl.ps1 -Action apply -UseWSL
```

### Scenario 2: SSH Issues on Windows

```powershell
# Switch to WSL method
.\setup-wsl.ps1 -Action apply -UseWSL
```

### Scenario 3: Quick Deploy (Linux/Mac)

```bash
cd terraform
chmod +x setup.sh
./setup.sh apply auto-approve
```

### Scenario 4: CI/CD Pipeline

```bash
# Use standard Terraform commands
terraform init
terraform plan -out=tfplan
terraform apply tfplan
```

## Troubleshooting by Method

### Option 1: Native Windows Issues

**Problem:** SSH connection fails

```powershell
# Solution: Switch to WSL
.\setup-wsl.ps1 -Action apply -UseWSL
```

**Problem:** Path issues

```powershell
# Solution: Use forward slashes in terraform.tfvars
ssh_private_key_path = "C:/Users/Name/.ssh/id_rsa"
```

### Option 2: WSL Issues

**Problem:** WSL not installed

```powershell
# Solution: Install WSL
wsl --install -d Ubuntu-22.04
```

**Problem:** Terraform not in WSL

```powershell
# Solution: Script auto-installs, or install manually
wsl bash -c "wget https://releases.hashicorp.com/terraform/1.6.0/terraform_1.6.0_linux_amd64.zip && unzip terraform_1.6.0_linux_amd64.zip && sudo mv terraform /usr/local/bin/"
```

### Option 3: Direct WSL/Linux Issues

**Problem:** Permission denied

```bash
# Solution: Fix script permissions
chmod +x setup.sh scripts/*.sh
```

**Problem:** Line ending issues

```bash
# Solution: Convert line endings
dos2unix setup.sh scripts/*.sh
```

## Performance Comparison

Based on 4 Raspberry Pi cluster deployment:

| Method           | Initialization | Deployment | Total Time |
| ---------------- | -------------- | ---------- | ---------- |
| Native Windows   | ~30s           | ~12min     | ~12.5min   |
| WSL (PowerShell) | ~45s           | ~13min     | ~13.5min   |
| Direct WSL       | ~30s           | ~12min     | ~12.5min   |
| Manual           | ~30s           | ~12min     | ~12.5min\* |

\*Manual time doesn't include validation steps

## Recommendations

### For Course Demo

**Use Option 2 (WSL via PowerShell)**

- Most reliable
- Best SSH compatibility
- Professional approach

### For Quick Testing

**Use Option 1 (Native Windows)**

- Fastest on Windows
- Good for iteration

### For Production

**Use Option 4 (Manual) with CI/CD**

- Standard Terraform workflow
- Better for automation

### For Learning

**Use Option 3 (Direct WSL/Linux)**

- Learn Linux commands
- Cross-platform skills

## Configuration Tips

### SSH Keys

**Windows (Option 1):**

```hcl
ssh_private_key_path = "C:/Users/YourName/.ssh/id_rsa"
```

**WSL (Options 2 & 3):**

```hcl
ssh_private_key_path = "~/.ssh/id_rsa"
```

### Copying SSH Keys

**Windows to WSL:**

```powershell
wsl bash -c "mkdir -p ~/.ssh"
type $env:USERPROFILE\.ssh\id_rsa | wsl bash -c "cat > ~/.ssh/id_rsa"
wsl bash -c "chmod 600 ~/.ssh/id_rsa"
```

## Next Steps After Deployment

Regardless of method used:

1. **Verify Cluster**

   ```bash
   ssh ubuntu@192.168.1.10
   kubectl get nodes
   ```

2. **Build Images**

   ```powershell
   cd ..\k8s
   .\build-arm.ps1  # or ./build-arm.sh on Linux
   ```

3. **Deploy Application**
   ```powershell
   .\deploy-pi.ps1  # or ./deploy-pi.sh on Linux
   ```

## Resources

- **Native Windows**: See `README.md`
- **WSL Setup**: See `WSL_SETUP.md`
- **Detailed Guide**: See `SETUP_GUIDE.md`
- **Quick Start**: See `QUICKSTART.md`

## Summary

| Choose This  | If You Want                 |
| ------------ | --------------------------- |
| **Option 1** | Fastest Windows deployment  |
| **Option 2** | Best reliability on Windows |
| **Option 3** | Native Linux experience     |
| **Option 4** | Maximum control             |

**For most users on Windows: Use Option 2 (setup-wsl.ps1)** ✨
