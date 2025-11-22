# 🎓 Demo Day Quick Reference Card

**Date**: December 2, 2025 | **Time**: 13:00-16:00

---

## 🔌 Pre-Demo Setup (15 minutes before)

### Hardware Check

```bash
# 1. Power on all devices
[ ] Router powered on
[ ] 4x Raspberry Pis powered on
[ ] All ethernet cables connected
[ ] Laptop/master charged and connected

# 2. Verify network
ping 192.168.1.1     # Router
ping 192.168.1.11    # Pi 1
ping 192.168.1.12    # Pi 2
ping 192.168.1.13    # Pi 3
ping 192.168.1.14    # Pi 4
```

### Cluster Check

```bash
# 3. Verify Kubernetes cluster
kubectl get nodes
# Expected: 5 nodes (1 master + 4 workers), all "Ready"

# 4. Check if application is running
kubectl get pods -n microservices
# Expected: All pods "Running", no "CrashLoopBackOff"

# 5. Test application
curl http://192.168.1.10:30000/shrines
# Expected: JSON response with shrine data

# 6. Test frontend
# Open browser: http://192.168.1.10:30002
# Expected: Shrine discovery website loads
```

---

## 📋 Demo Script (15 minutes)

### Part 1: Show Cluster (2 min)

```bash
# Terminal 1: Show infrastructure
kubectl get nodes -o wide

# Explain to instructor:
"We have 5 nodes: 1 master (this laptop) and 4 Raspberry Pi 3 B+ workers.
All nodes are connected via TP-Link router on wired ethernet."

kubectl get pods -n microservices -o wide

# Point out:
"Our application has 4 microservices:
- API Gateway (3 replicas for high availability)
- Shrine Service (manages shrine data)
- Location Service (validates GPS coordinates)
- Frontend (React web interface)
Plus PostgreSQL database and RabbitMQ message broker."
```

### Part 2: Demonstrate Application (3 min)

```bash
# Browser: Open http://192.168.1.10:30002

# Show:
1. Homepage with shrine list
2. Click on "Erawan Shrine" → show details
3. Show location coordinates (lat/lng)
4. Show category (e.g., "wealth")

# Terminal: API call
curl http://192.168.1.10:30000/shrines | jq '.[0]'

# Explain:
"Frontend calls REST API at port 30000, which routes to API Gateway service."
```

### Part 3: Prove Multi-Container Chain (5 min)

**CRITICAL**: This proves requirement "2+ containers per request"

```bash
# Terminal 1: API Gateway logs
kubectl logs -f -n microservices deployment/api-gateway | grep "GET /shrines"

# Terminal 2: Shrine Service logs
kubectl logs -f -n microservices deployment/shrine-service | grep "location"

# Terminal 3: Make request
curl http://192.168.1.10:30000/shrines

# Watch all 3 terminals simultaneously
# Point out to instructor:
```

**Draw on whiteboard**:

```
Request Flow:
Client → [API Gateway Pod] → [Shrine Service Pod] → [Location Service Pod]
           Container 1          Container 2           Container 3
                                                           ↓
                                                    [PostgreSQL Pod]
                                                      Container 4
```

**Alternative proof method**:

```bash
# Show service-to-service connectivity
kubectl exec -it -n microservices deployment/api-gateway -- sh
> nslookup shrine-service
> exit

kubectl exec -it -n microservices deployment/shrine-service -- sh
> nslookup location-service
> exit

# Explain:
"This proves our services can reach each other.
Every shrine request goes through at least 3 containers."
```

### Part 4: Fault Tolerance Demo (5 min)

**CRITICAL**: This proves automatic recovery requirement

```bash
# Before unplugging
kubectl get pods -n microservices -o wide

# Note which pods are on which nodes
# Example output:
# api-gateway-abc    pi-node-2
# shrine-service-xyz pi-node-3

# Terminal 1: Watch pods
kubectl get pods -n microservices -o wide -w

# Terminal 2: Continuous testing
while true; do
  echo "Test at $(date +%H:%M:%S):"
  curl -s http://192.168.1.10:30000/shrines | jq '.[0].name' || echo "FAILED"
  sleep 2
done
```

**Instructor unplugs a random Pi (e.g., pi-node-3)**

```bash
# Observe Terminal 1:
# - Pods on pi-node-3 go "Terminating" / "Unknown"
# - New pods automatically created
# - New pods scheduled to healthy nodes (pi-node-1, pi-node-2, pi-node-4)
# - New pods start "Running"

# Observe Terminal 2:
# - First 3-4 requests: May fail (30-60 seconds recovery time)
# - After recovery: All requests succeed

# Explain to instructor:
"Kubernetes detected the node failure.
It automatically rescheduled the pods to healthy nodes.
The application recovered without manual intervention.
This demonstrates fault tolerance."

# After demo, check node status
kubectl get nodes
# pi-node-3 will show "NotReady"

# Plug Pi back in
# (Node will transition to "Ready" after ~1 minute)
```

---

## 🎤 Key Points to Emphasize

1. **4 Raspberry Pis**: "We're using all 4 Pis as worker nodes in the cluster."

2. **Multiple Services**: "We have 4 distinct microservices with logical separation."

3. **Container Chain**: "Every request touches minimum 3 containers: Gateway → Shrine → Location."

4. **Fault Tolerance**: "When a Pi fails, Kubernetes automatically reschedules pods and application recovers."

5. **Automatic Deployment**: "Everything deployed from GitHub with kubectl apply."

---

## 🆘 Emergency Troubleshooting

### If pods won't start:

```bash
# Check why
kubectl describe pod -n microservices <pod-name>

# Common fixes:
kubectl delete pod -n microservices <pod-name>  # Force restart
kubectl get events -n microservices --sort-by='.lastTimestamp'  # See errors
```

### If application won't respond:

```bash
# Check services
kubectl get svc -n microservices

# Check endpoints
kubectl get endpoints -n microservices

# Restart deployment
kubectl rollout restart deployment -n microservices api-gateway
```

### If node shows NotReady:

```bash
# SSH to node
ssh ubuntu@192.168.1.11

# Check K3s
sudo systemctl status k3s-agent
sudo systemctl restart k3s-agent

# Check network
ping 192.168.1.10
```

### Nuclear option (if everything breaks):

```bash
# Delete and redeploy
kubectl delete namespace microservices
./k8s/deploy-pi.sh

# Wait 5 minutes for all pods to start
kubectl get pods -n microservices -w
```

---

## 📞 Commands Cheat Sheet

```bash
# Quick status
kubectl get all -n microservices

# Pod status with nodes
kubectl get pods -n microservices -o wide

# Logs
kubectl logs -f -n microservices deployment/api-gateway
kubectl logs -f -n microservices deployment/shrine-service

# Service endpoints
kubectl get svc -n microservices

# Node status
kubectl get nodes

# Resource usage
kubectl top nodes
kubectl top pods -n microservices

# Force restart
kubectl rollout restart deployment -n microservices <deployment-name>

# Delete stuck pod
kubectl delete pod -n microservices <pod-name> --force --grace-period=0

# Port forward (if NodePort doesn't work)
kubectl port-forward -n microservices svc/api-gateway 3000:3000

# Get events (troubleshooting)
kubectl get events -n microservices --sort-by='.lastTimestamp'
```

---

## 📱 Access URLs (Update with your IP)

- **Frontend**: http://192.168.1.10:30002
- **API Gateway**: http://192.168.1.10:30000
- **API Health**: http://192.168.1.10:30000/health (if implemented)

---

## ✅ Post-Demo Cleanup

```bash
# 1. Sign in and return equipment
# 2. Delete application
kubectl delete namespace microservices

# 3. Stop K3s
sudo systemctl stop k3s  # On master
ssh ubuntu@192.168.1.11 "sudo systemctl stop k3s-agent"  # On each Pi

# 4. Flash Raspberry Pis
# Use Raspberry Pi Imager → Raspberry Pi OS (32-bit)

# 5. Factory reset router
# Press reset button for 10 seconds
```

---

## 🎯 Success Criteria

- ✅ Cluster with 4 Pis + 1 master visible
- ✅ Application accessible via browser
- ✅ API returning shrine data
- ✅ Multi-container request flow demonstrated
- ✅ Fault tolerance: App recovers after Pi unplugged

---

## 💬 What to Say During Demo

**Opening** (30 sec):
"Hi, we're demonstrating สาย.mu, a microservices platform for discovering Thailand's shrines. We built it using 4 Raspberry Pis as Kubernetes workers, with my laptop as the control plane."

**Architecture** (1 min):
"Our architecture has 4 microservices: API Gateway for REST endpoints, Shrine Service for business logic, Location Service for GPS validation, and a React frontend. They communicate via gRPC and use PostgreSQL and RabbitMQ."

**Request Flow** (1 min):
"When a user searches for shrines, the request flows through at least 3 containers: the API Gateway receives the HTTP request, calls Shrine Service via gRPC, which calls Location Service to validate coordinates, then queries the database. Let me show you the logs..."

**Fault Tolerance** (1 min):
"For fault tolerance, Kubernetes monitors all pods with health checks. If a node fails—like when you unplug this Pi—Kubernetes automatically reschedules the pods to healthy nodes. Watch the application recover..."

**Closing** (30 sec):
"Everything we showed is deployed from our GitHub repo using kubectl apply. The whole cluster can be recreated from scratch by following our setup guide."

---

## 🎉 Confidence Boosters

- You've tested this before → it works
- Kubernetes handles failures → trust the system
- Instructors want you to succeed → they're on your side
- Minor glitches are OK → explain what's happening
- You know your system → you can troubleshoot

**Deep breath. You've got this! 🚀**
