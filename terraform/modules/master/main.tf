# Master Node Configuration
# Sets up K3s master node with Docker registry on LOCAL machine

resource "null_resource" "master_setup" {
  # NOTE: Master is YOUR computer running Terraform, so we use local-exec
  
  # Install Docker locally
  provisioner "local-exec" {
    command = <<-EOT
      echo '=== Installing Docker on Master (This Computer) ==='
      sudo apt-get update
      sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common
      curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
      echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
      sudo apt-get update
      sudo apt-get install -y docker-ce docker-ce-cli containerd.io
      sudo usermod -aG docker $USER
      sudo systemctl enable docker
      sudo systemctl start docker
      echo '✓ Docker installed successfully on master'
    EOT
    interpreter = ["bash", "-c"]
  }

  # Setup Docker Registry locally
  provisioner "local-exec" {
    command = <<-EOT
      echo '=== Setting up Docker Registry on Master ==='
      docker stop registry 2>/dev/null || true
      docker rm registry 2>/dev/null || true
      docker run -d -p ${var.registry_port}:5000 --restart=always --name registry registry:2
      echo '✓ Docker registry running on port ${var.registry_port}'
    EOT
    interpreter = ["bash", "-c"]
  }

  # Install kubectl locally
  provisioner "local-exec" {
    command = <<-EOT
      echo '=== Installing kubectl on Master ==='
      curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
      sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
      rm kubectl
      kubectl version --client
      echo '✓ kubectl installed successfully'
    EOT
    interpreter = ["bash", "-c"]
  }

  # Install K3s master locally
  provisioner "local-exec" {
    command = <<-EOT
      echo '=== Installing K3s Master on This Computer ==='
      curl -sfL https://get.k3s.io | INSTALL_K3S_VERSION=${var.k3s_version} sh -s - server --docker --write-kubeconfig-mode 644 --cluster-init
      sudo systemctl enable k3s
      sleep 30
      sudo systemctl status k3s --no-pager
      echo '✓ K3s master installed successfully'
    EOT
    interpreter = ["bash", "-c"]
  }

  # Setup kubeconfig locally
  provisioner "local-exec" {
    command = <<-EOT
      echo '=== Configuring kubectl on Master ==='
      mkdir -p $HOME/.kube
      sudo cp /etc/rancher/k3s/k3s.yaml $HOME/.kube/config
      sudo chown $USER:$USER $HOME/.kube/config
      export KUBECONFIG=$HOME/.kube/config
      kubectl get nodes
      echo '✓ kubectl configured successfully'
    EOT
    interpreter = ["bash", "-c"]
  }

  # Wait for cluster to be ready
  provisioner "local-exec" {
    command = <<-EOT
      echo '=== Waiting for cluster to be ready ==='
      for i in {1..30}; do
        if kubectl get nodes | grep -q Ready; then
          echo '✓ Cluster is ready'
          break
        fi
        echo "Waiting for cluster... ($i/30)"
        sleep 10
      done
      kubectl get nodes -o wide
    EOT
    interpreter = ["bash", "-c"]
  }
}

# Get K3s token for workers
resource "null_resource" "get_k3s_token" {
  depends_on = [null_resource.master_setup]

  provisioner "local-exec" {
    command = <<-EOT
      ssh -o StrictHostKeyChecking=no -i ${var.ssh_private_key_path} ${var.ssh_user}@${var.master_ip} "sudo cat /var/lib/rancher/k3s/server/node-token" > ${path.module}/k3s-token.txt
    EOT
  }
}

# Configure registry for insecure access (for local development)
resource "null_resource" "configure_registry" {
  depends_on = [null_resource.master_setup]

  connection {
    type        = "ssh"
    user        = var.ssh_user
    host        = var.master_ip
    private_key = file(var.ssh_private_key_path)
  }

  provisioner "remote-exec" {
    inline = [
      "echo '=== Configuring Docker for insecure registry ==='",
      "sudo mkdir -p /etc/docker",
      "echo '{' | sudo tee /etc/docker/daemon.json",
      "echo '  \"insecure-registries\": [\"${var.master_ip}:${var.registry_port}\"]' | sudo tee -a /etc/docker/daemon.json",
      "echo '}' | sudo tee -a /etc/docker/daemon.json",
      "sudo systemctl restart docker",
      "echo '✓ Registry configured for insecure access'"
    ]
  }
}
