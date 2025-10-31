# Complete Deployment Guide (Windows PowerShell)

## Step 1: Prerequisites Installation

### Install Docker Desktop
1. Download from https://www.docker.com/products/docker-desktop
2. Install and restart computer
3. Enable WSL 2 if prompted
4. Verify: `docker --version`

### Install Git
1. Download from https://git-scm.com/download/win
2. Install with default settings
3. Verify: `git --version`

### Install kubectl
```powershell
curl -LO "https://dl.k8s.io/release/v1.28.0/bin/windows/amd64/kubectl.exe"
Move-Item kubectl.exe "C:\Program Files\kubectl\kubectl.exe"
[Environment]::SetEnvironmentVariable("Path", $env:Path + ";C:\Program Files\kubectl", "Machine")
kubectl version --client
```

### Install AWS CLI
```powershell
msiexec.exe /i https://awscli.amazonaws.com/AWSCLIV2.msi
aws --version
aws configure
```

### Install Terraform
1. Download from https://www.terraform.io/downloads
2. Extract to C:\terraform
3. Add to PATH
4. Verify: `terraform --version`

## Step 2: Local Testing

```powershell
cd devops-monitoring-platform
docker-compose up --build
```

Access:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

Stop: `docker-compose down`

## Step 3: Push to GitHub

```powershell
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/devops-monitoring-platform.git
git branch -M main
git push -u origin main
```

## Step 4: Build and Push Docker Images

```powershell
docker login

$DOCKER_USER = "YOUR_DOCKERHUB_USERNAME"

docker build -t $DOCKER_USER/monitoring-backend:latest ./backend
docker build -t $DOCKER_USER/monitoring-frontend:latest ./frontend
docker build -t $DOCKER_USER/monitoring-collector:latest ./metrics-collector

docker push $DOCKER_USER/monitoring-backend:latest
docker push $DOCKER_USER/monitoring-frontend:latest
docker push $DOCKER_USER/monitoring-collector:latest
```

## Step 5: Update Kubernetes Manifests

```powershell
$files = @("k8s\backend.yaml", "k8s\frontend.yaml", "k8s\metrics-collector.yaml")
foreach ($file in $files) {
    (Get-Content $file) -replace 'YOUR_DOCKERHUB_USERNAME', $DOCKER_USER | Set-Content $file
}
```

## Step 6: Deploy Infrastructure with Terraform

```powershell
cd terraform
terraform init
terraform validate
terraform plan
terraform apply
```

Configure kubectl:
```powershell
aws eks update-kubeconfig --region us-east-1 --name monitoring-cluster
kubectl get nodes
```

## Step 7: Deploy Application to Kubernetes

```powershell
cd ..
kubectl apply -f k8s\namespace.yaml
kubectl apply -f k8s\postgres.yaml
kubectl apply -f k8s\redis.yaml

kubectl wait --for=condition=ready pod -l app=postgres -n monitoring-app --timeout=300s

kubectl apply -f k8s\backend.yaml
kubectl apply -f k8s\metrics-collector.yaml
kubectl apply -f k8s\frontend.yaml
kubectl apply -f k8s\hpa.yaml
```

## Step 8: Get Application URLs

```powershell
kubectl get svc -n monitoring-app

$FRONTEND_URL = kubectl get svc frontend -n monitoring-app -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
$BACKEND_URL = kubectl get svc backend -n monitoring-app -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'

Write-Host "Frontend: http://$FRONTEND_URL"
Write-Host "Backend: http://${BACKEND_URL}:5000"

Start-Process "http://$FRONTEND_URL"
```

## Step 9: Verify Deployment

```powershell
kubectl get pods -n monitoring-app
kubectl logs -f deployment/backend -n monitoring-app

Invoke-RestMethod -Uri "http://${BACKEND_URL}:5000/health"
Invoke-RestMethod -Uri "http://${BACKEND_URL}:5000/api/metrics"
```

## Step 10: Management Commands

### Scale Deployment
```powershell
kubectl scale deployment backend --replicas=3 -n monitoring-app
kubectl get pods -n monitoring-app -w
```

### Update Application
```powershell
docker build -t $DOCKER_USER/monitoring-backend:v2.0 ./backend
docker push $DOCKER_USER/monitoring-backend:v2.0
kubectl set image deployment/backend backend=$DOCKER_USER/monitoring-backend:v2.0 -n monitoring-app
kubectl rollout status deployment/backend -n monitoring-app
```

### Rollback
```powershell
kubectl rollout undo deployment/backend -n monitoring-app
```

## Step 11: Cleanup

```powershell
kubectl delete namespace monitoring-app

cd terraform
terraform destroy
```

## Troubleshooting

### Pods not starting
```powershell
kubectl describe pod <POD_NAME> -n monitoring-app
kubectl logs <POD_NAME> -n monitoring-app
```

### LoadBalancer pending
```powershell
kubectl describe svc frontend -n monitoring-app
# Wait 5-10 minutes for AWS to provision
```

### Database connection issues
```powershell
kubectl get pods -n monitoring-app | Select-String postgres
kubectl exec -it deployment/backend -n monitoring-app -- nc -zv postgres 5432
```

## Cost Estimation
- EKS Cluster: ~$73/month
- EC2 nodes (2x t3.medium): ~$60/month
- LoadBalancers (2): ~$36/month
- **Total: ~$170/month**

## Next Steps
1. Add Prometheus & Grafana for monitoring
2. Implement ELK Stack for logging
3. Add HTTPS with cert-manager
4. Set up Route53 with custom domain
5. Implement RBAC and Network Policies

---

For more commands, see the Quick Reference Guide.
