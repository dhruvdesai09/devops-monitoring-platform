# Real-Time Monitoring Platform - DevOps Project

## Overview
Full-stack monitoring application with microservices architecture deployed on AWS EKS using CI/CD pipeline.

## Architecture
- **Frontend**: React dashboard with real-time charts
- **Backend**: Node.js REST API
- **Metrics Collector**: Python service for data collection
- **Database**: PostgreSQL
- **Cache**: Redis
- **Orchestration**: Kubernetes (EKS)
- **CI/CD**: Jenkins
- **IaC**: Terraform

## Features
- Real-time metric collection (CPU, Memory, Disk, Network)
- RESTful API with caching
- Interactive dashboard with live charts
- Auto-scaling based on load
- High availability with multiple replicas
- Persistent storage for metrics

## Tech Stack
- Docker & Docker Compose
- Kubernetes (EKS)
- Jenkins CI/CD
- Terraform
- AWS (VPC, EKS, LoadBalancer)
- Git & GitHub

## Project Structure
```
devops-monitoring-platform/
â”œâ”€â”€ backend/                 # Node.js API service
â”œâ”€â”€ frontend/               # React dashboard
â”œâ”€â”€ metrics-collector/      # Python metrics collector
â”œâ”€â”€ k8s/                    # Kubernetes manifests
â”œâ”€â”€ terraform/              # Infrastructure as Code
â”œâ”€â”€ docker-compose.yml      # Local development
â”œâ”€â”€ Jenkinsfile            # CI/CD pipeline
â””â”€â”€ README.md
```

## Quick Start (Local Development)

### Prerequisites
- Docker Desktop for Windows
- Git

### Run Locally
```powershell
# Start all services
docker-compose up --build

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
```

## Deployment Instructions

See **DEPLOYMENT.md** for complete step-by-step deployment guide.

## API Endpoints
- `GET /health` - Health check
- `GET /api/metrics` - Get all metrics
- `POST /api/metrics` - Post new metric
- `GET /api/stats` - Get statistics

## Environment Variables
- `DB_HOST` - PostgreSQL host
- `DB_NAME` - Database name
- `DB_USER` - Database user
- `DB_PASSWORD` - Database password
- `REDIS_HOST` - Redis host
- `BACKEND_URL` - Backend API URL

## Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License
MIT License
