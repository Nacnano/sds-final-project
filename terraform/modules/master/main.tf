# Master Node Configuration
# Sets up K3s master node with Docker registry

resource "null_resource" "master_setup" {
  connection {
    type        = "ssh"
    user        = var.ssh_user
    host        = var.master_ip
    private_key = file(var.ssh_private_key_path)
  }

  # Install Docker
  provisioner "remote-exec" {
    inline = [
      "echo '=== Installing Docker ==='",
      "sudo apt-get update",
      "sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common",
      "curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg",
      "echo 'deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable' | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null",
      "sudo apt-get update",
      "sudo apt-get install -y docker-ce docker-ce-cli containerd.io",
      "sudo usermod -aG docker ${var.ssh_user}",
      "sudo systemctl enable docker",
      "sudo systemctl start docker",
      "echo '✓ Docker installed successfully'"
    ]
  }

  # Setup Docker Registry
  provisioner "remote-exec" {
    inline = [
      "echo '=== Setting up Docker Registry ==='",
      "sudo docker run -d -p ${var.registry_port}:5000 --restart=always --name registry registry:2",
      "echo '✓ Docker registry running on port ${var.registry_port}'"
    ]
  }

  # Install kubectl
  provisioner "remote-exec" {
    inline = [
      "echo '=== Installing kubectl ==='",
      "curl -LO \"https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl\"",
      "sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl",
      "rm kubectl",
      "kubectl version --client",
      "echo '✓ kubectl installed successfully'"
    ]
  }

  # Install K3s master
  provisioner "remote-exec" {
    inline = [
      "echo '=== Installing K3s Master ==='",
      "curl -sfL https://get.k3s.io | INSTALL_K3S_VERSION=${var.k3s_version} sh -s - server --docker --write-kubeconfig-mode 644 --cluster-init",
      "sudo systemctl enable k3s",
      "sleep 30",
      "sudo systemctl status k3s --no-pager",
      "echo '✓ K3s master installed successfully'"
    ]
  }

  # Setup kubeconfig
  provisioner "remote-exec" {
    inline = [
      "echo '=== Configuring kubectl ==='",
      "mkdir -p $HOME/.kube",
      "sudo cp /etc/rancher/k3s/k3s.yaml $HOME/.kube/config",
      "sudo chown ${var.ssh_user}:${var.ssh_user} $HOME/.kube/config",
      "export KUBECONFIG=$HOME/.kube/config",
      "kubectl get nodes",
      "echo '✓ kubectl configured successfully'"
    ]
  }

  # Wait for cluster to be ready
  provisioner "remote-exec" {
    inline = [
      "echo '=== Waiting for cluster to be ready ==='",
      "for i in {1..30}; do",
      "  if kubectl get nodes | grep -q Ready; then",
      "    echo '✓ Cluster is ready'",
      "    break",
      "  fi",
      "  echo 'Waiting for cluster... ($i/30)'",
      "  sleep 10",
      "done",
      "kubectl get nodes -o wide"
    ]
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
