# Demo Script for December 2, 2025

## Pre-Demo Checklist (Setup Before Your Time Slot)

### Hardware Setup

- [ ] All 4 Raspberry Pis powered on and connected to router
- [ ] Laptop connected to same network
- [ ] Router plugged in and working
- [ ] Backup power source ready (if possible)
- [ ] All ethernet cables connected (wired is more stable!)

### Software Verification

```bash
# 1. Verify all nodes are Ready
kubectl get nodes

# Expected output:
# NAME        STATUS   ROLES           AGE   VERSION
# master      Ready    control-plane   Xh    v1.28.x
# pi-node-1   Ready    worker          Xh    v1.28.x
# pi-node-2   Ready    worker          Xh    v1.28.x
# pi-node-3   Ready    worker          Xh    v1.28.x
# pi-node-4   Ready    worker          Xh    v1.28.x

# 2. Verify all pods are Running
kubectl get pods -n microservices

# Expected: All pods in "Running" state, none in "Pending" or "Error"

# 3. Verify services are accessible
kubectl get svc -n microservices

# 4. Test application
curl http://192.168.1.10:30000/health
# Should return: {"status":"ok"}

# 5. Test frontend
# Open browser: http://192.168.1.10:30002
# Should show shrine discovery interface
```

### Backup Plan

- [ ] Screenshots of working application saved
- [ ] Backup join command for nodes saved
- [ ] kubectl config backed up
- [ ] Database seed script ready

---

## Demo Flow (Total: ~15 minutes)

### Part 1: Introduction (2 minutes)

**What to say:**

> "Hello! We've built a microservices application called 'สาย.mu' - a platform for discovering Thai shrines and temples. Our system runs on a Kubernetes cluster with 4 Raspberry Pi worker nodes and uses a microservices architecture with 3 main services: API Gateway, Shrine Service, and Location Service."

**Show cluster:**

```bash
# Display cluster topology
kubectl get nodes -o wide

# Highlight:
# - 1 master node (your laptop)
# - 4 Raspberry Pi worker nodes
# - All nodes in "Ready" state
```

---

### Part 2: Application Overview (3 minutes)

**What to say:**

> "Our application architecture consists of multiple containers working together. Let me show you what's running."

```bash
# Show all deployed pods with their nodes
kubectl get pods -n microservices -o wide

# Point out:
# - Multiple replicas of services (API Gateway: 3, Location Service: 3)
# - Pods distributed across different Raspberry Pi nodes
# - All in "Running" state
```

**Show services:**

```bash
kubectl get svc -n microservices

# Explain:
# - ClusterIP services for internal communication
# - NodePort services for external access (30000, 30002)
```

**Demo the application working:**

- Open browser: `http://192.168.1.10:30002`
- Show the shrine discovery interface
- Browse shrines
- Search for nearby shrines

---

### Part 3: Multi-Container Request Flow (5 minutes)

**What to say:**

> "Now I'll demonstrate that each client request is serviced by multiple containers. Let me trace a request through the system."

**Prepare terminals (3 windows side-by-side):**

```bash
# Terminal 1: API Gateway logs
kubectl logs -f -l app=api-gateway -n microservices --tail=10

# Terminal 2: Shrine Service logs
kubectl logs -f -l app=shrine-service -n microservices --tail=10

# Terminal 3: Location Service logs
kubectl logs -f -l app=location-service -n microservices --tail=10
```

**Make API request:**

```bash
# In a 4th terminal or use curl in PowerShell
curl -X GET http://192.168.1.10:30000/shrines
```

**Point out the logs:**

> "As you can see in the logs:
>
> 1. **API Gateway** (Container 1) receives the HTTP request
> 2. **Shrine Service** (Container 2) processes shrine data from database
> 3. The response flows back through API Gateway to the client
>
> For creating shrines, the flow is even longer:"

```bash
# Create a shrine
curl -X POST http://192.168.1.10:30000/shrines \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Demo Shrine",
    "description": "Created during demo",
    "location": "Bangkok, Thailand",
    "category": "spiritual"
  }'
```

**Show logs again:**

> "Notice:
>
> 1. **API Gateway** receives POST request
> 2. **Shrine Service** validates and stores data
> 3. **Location Service** (Container 3) resolves coordinates via Google Maps API
> 4. Response returns to client
>
> This shows at least 3 containers servicing one request! ✓"

---

### Part 4: Fault Tolerance Demo (5 minutes)

**What to say:**

> "Now for the most important part: fault tolerance. I'll show what happens when a Raspberry Pi node goes offline."

**Step 1: Show current state**

```bash
# Show pod distribution
kubectl get pods -n microservices -o wide | grep -E "NAME|api-gateway|shrine-service|location-service"

# Note which pods are on which nodes
# Example output:
# NAME                              READY   STATUS    NODE
# api-gateway-xxx                   1/1     Running   pi-node-2
# api-gateway-yyy                   1/1     Running   pi-node-3
# api-gateway-zzz                   1/1     Running   pi-node-4
# shrine-service-xxx                1/1     Running   pi-node-1
# location-service-xxx              1/1     Running   pi-node-2
```

**Step 2: Instructor chooses a Pi to disconnect**

**Before unplugging, start monitoring:**

```bash
# Watch pods in real-time
kubectl get pods -n microservices -w
```

**Step 3: Unplug chosen Raspberry Pi**

> "I'm now disconnecting pi-node-X as instructed..."

**What to show:**

```bash
# You'll see:
# 1. Node becomes "NotReady" after ~40 seconds
kubectl get nodes

# 2. Pods on that node go to "Terminating" then "Pending"
# 3. Kubernetes reschedules pods on other nodes
# 4. New pods start on healthy nodes
# 5. After ~60-90 seconds, all pods are "Running" again
```

**Step 4: Test application during recovery**

```bash
# Test API (may have 1-2 failures during transition)
for i in {1..10}; do
  echo "Request $i:"
  curl -s http://192.168.1.10:30000/shrines | jq -r '.[0].name' || echo "Failed"
  sleep 2
done
```

**What to say:**

> "As you can see:
>
> - Initially, some requests may fail during pod rescheduling
> - But within 60-90 seconds, Kubernetes has rescheduled the pods
> - The application is now fully functional again
> - This demonstrates automatic self-healing! ✓"

**Step 5: Show final state**

```bash
# All pods running again (on different nodes)
kubectl get pods -n microservices -o wide

# Node still down (expected)
kubectl get nodes
```

**What to say:**

> "The failed node shows as 'NotReady', but our application continues to work because:
>
> 1. We have multiple replicas of each service
> 2. Kubernetes automatically rescheduled pods to healthy nodes
> 3. Load balancing ensures requests go to running pods
> 4. The system is fault-tolerant! ✓"

---

## Common Issues & Solutions

### Issue: Pods stuck in "Pending" after node failure

**Solution:**

```bash
# Check events
kubectl get events -n microservices --sort-by='.lastTimestamp' | tail -20

# If insufficient resources:
# Reduce HPA max replicas
kubectl patch hpa api-gateway-hpa -n microservices -p '{"spec":{"maxReplicas":2}}'

# Force delete stuck pods if needed
kubectl delete pod <pod-name> -n microservices --grace-period=0 --force
```

### Issue: Application not responding

**Solution:**

```bash
# Check service endpoints
kubectl get endpoints -n microservices

# Check pod logs for errors
kubectl logs -l app=api-gateway -n microservices --tail=50

# Restart pods if needed
kubectl rollout restart deployment api-gateway -n microservices
```

### Issue: Node won't reconnect after plugging back in

**Solution:**

```bash
# Wait 2-3 minutes for kubelet to reconnect

# If still NotReady, SSH to Pi and restart kubelet:
ssh ubuntu@192.168.1.1X
sudo systemctl restart kubelet
```

### Issue: Can't access application from browser

**Solution:**

```bash
# Check NodePort services
kubectl get svc -n microservices | grep NodePort

# Verify firewall not blocking ports 30000-30100

# Test from command line first
curl http://192.168.1.10:30000/health

# If curl works but browser doesn't, check browser proxy settings
```

---

## After Demo Checklist

### Equipment Return

- [ ] Sign attendance sheet
- [ ] Return all Raspberry Pis to instructor
- [ ] Return power adapters
- [ ] Return ethernet cables
- [ ] Return router

### Cleanup

- [ ] Flash all Raspberry Pi SD cards with Raspbian OS:

  ```bash
  # Use Raspberry Pi Imager
  # Select: Raspberry Pi OS (32-bit)
  # Write to each SD card
  ```

- [ ] Factory reset router:
  - Hold reset button for 10 seconds
  - Wait for lights to blink
  - Verify reset by accessing http://192.168.1.1 (should ask for setup)

---

## Backup Commands (Just in Case)

### Quick cluster health check

```bash
kubectl get all -n microservices
kubectl top nodes
kubectl top pods -n microservices
```

### Force pod recreation

```bash
kubectl delete pod <pod-name> -n microservices
```

### Restart deployment

```bash
kubectl rollout restart deployment <deployment-name> -n microservices
```

### Get logs from failed pod

```bash
kubectl logs <pod-name> -n microservices --previous
```

### Re-seed database if needed

```bash
kubectl exec -it <shrine-db-pod> -n microservices -- psql -U postgres -d shrine_service -f /seed.sql
```

---

## Time Management

| Section                      | Duration | Critical? |
| ---------------------------- | -------- | --------- |
| Introduction                 | 2 min    | ✓         |
| Application Overview         | 3 min    | ✓         |
| Multi-Container Request Flow | 5 min    | ✓✓✓       |
| Fault Tolerance Demo         | 5 min    | ✓✓✓       |

**Total: ~15 minutes**

If running short on time, prioritize:

1. Fault tolerance demo (MOST IMPORTANT)
2. Multi-container request flow (VERY IMPORTANT)
3. Application overview (Nice to have)

---

## Presentation Tips

1. **Speak clearly and confidently** - you know this system better than anyone!
2. **Explain as you type** - narrate each command before executing
3. **Have backup terminals ready** - logs should be streaming before demo starts
4. **Stay calm if something breaks** - that's why we practice!
5. **Emphasize key points**:
   - ✓ Microservices architecture
   - ✓ Multiple containers per request
   - ✓ Automatic fault tolerance
   - ✓ Kubernetes orchestration

Good luck! You've got this! 🚀🍀
