# Worker Nodes Configuration
# Sets up Raspberry Pi nodes to join K3s cluster

resource "null_resource" "worker_setup" {
  count = length(var.worker_ips)

  connection {
    type        = "ssh"
    user        = var.ssh_user
    host        = var.worker_ips[count.index]
    private_key = file(var.ssh_private_key_path)
  }

  # Install Docker on Raspberry Pi
  provisioner "remote-exec" {
    inline = [
      "echo '=== Installing Docker on Pi ${count.index + 1} (${var.worker_ips[count.index]}) ==='",
      "sudo apt-get update",
      "sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common",
      "curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg",
      "echo 'deb [arch=arm64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable' | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null",
      "sudo apt-get update",
      "sudo apt-get install -y docker-ce docker-ce-cli containerd.io",
      "sudo usermod -aG docker ${var.ssh_user}",
      "sudo systemctl enable docker",
      "sudo systemctl start docker",
      "echo '✓ Docker installed on Pi ${count.index + 1}'"
    ]
  }

  # Configure Docker for insecure registry
  provisioner "remote-exec" {
    inline = [
      "echo '=== Configuring Docker for registry access ==='",
      "sudo mkdir -p /etc/docker",
      "echo '{' | sudo tee /etc/docker/daemon.json",
      "echo '  \"insecure-registries\": [\"${var.master_ip}:5000\"]' | sudo tee -a /etc/docker/daemon.json",
      "echo '}' | sudo tee -a /etc/docker/daemon.json",
      "sudo systemctl restart docker",
      "echo '✓ Registry configured on Pi ${count.index + 1}'"
    ]
  }

  # Install K3s agent
  provisioner "remote-exec" {
    inline = [
      "echo '=== Joining K3s cluster from Pi ${count.index + 1} ==='",
      "curl -sfL https://get.k3s.io | INSTALL_K3S_VERSION=${var.k3s_version} K3S_URL=https://${var.master_ip}:6443 K3S_TOKEN='${var.k3s_token}' sh -s - agent --docker",
      "sudo systemctl enable k3s-agent",
      "sleep 20",
      "sudo systemctl status k3s-agent --no-pager",
      "echo '✓ Pi ${count.index + 1} joined cluster successfully'"
    ]
  }

  # Label the node
  provisioner "remote-exec" {
    inline = [
      "echo '✓ Worker node Pi-${count.index + 1} configured at ${var.worker_ips[count.index]}'"
    ]
  }
}

# Verify all workers joined from local computer
resource "null_resource" "verify_workers" {
  depends_on = [null_resource.worker_setup]

  provisioner "local-exec" {
    command = <<-EOT
      echo "=== Verifying worker nodes joined the cluster ==="
      export KUBECONFIG=$HOME/.kube/config
      kubectl get nodes -o wide
      echo "✓ All nodes displayed above"
    EOT
    interpreter = ["bash", "-c"]
  }
}

# Label worker nodes from local computer
resource "null_resource" "label_workers" {
  depends_on = [null_resource.verify_workers]
  count      = length(var.worker_ips)

  provisioner "local-exec" {
    command = <<-EOT
      echo "=== Labeling worker node ${count.index + 1} (${var.worker_ips[count.index]}) ==="
      export KUBECONFIG=$HOME/.kube/config
      NODE_NAME=$(kubectl get nodes -o jsonpath="{.items[?(@.status.addresses[?(@.address==\"${var.worker_ips[count.index]}\")])].metadata.name}")
      if [ -n "$NODE_NAME" ]; then
        kubectl label nodes "$NODE_NAME" node-role.kubernetes.io/worker=worker node.kubernetes.io/instance-type=raspberry-pi --overwrite
        echo "✓ Labeled $NODE_NAME as worker"
      else
        echo "⚠ Warning: Could not find node with IP ${var.worker_ips[count.index]}"
      fi
    EOT
    interpreter = ["bash", "-c"]
  }
}
