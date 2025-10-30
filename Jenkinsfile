pipeline {
    agent any
    
    environment {
        DOCKER_HUB_CREDS = credentials('dockerhub-credentials')
        DOCKER_HUB_USER = 'YOUR_DOCKERHUB_USERNAME'
        KUBECONFIG = credentials('kubeconfig')
    }
    
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/YOUR_USERNAME/YOUR_REPO.git'
            }
        }
        
        stage('Build Docker Images') {
            parallel {
                stage('Build Backend') {
                    steps {
                        script {
                            dir('backend') {
                                bat "docker build -t %DOCKER_HUB_USER%/monitoring-backend:%BUILD_NUMBER% ."
                                bat "docker tag %DOCKER_HUB_USER%/monitoring-backend:%BUILD_NUMBER% %DOCKER_HUB_USER%/monitoring-backend:latest"
                            }
                        }
                    }
                }
                stage('Build Frontend') {
                    steps {
                        script {
                            dir('frontend') {
                                bat "docker build -t %DOCKER_HUB_USER%/monitoring-frontend:%BUILD_NUMBER% ."
                                bat "docker tag %DOCKER_HUB_USER%/monitoring-frontend:%BUILD_NUMBER% %DOCKER_HUB_USER%/monitoring-frontend:latest"
                            }
                        }
                    }
                }
                stage('Build Collector') {
                    steps {
                        script {
                            dir('metrics-collector') {
                                bat "docker build -t %DOCKER_HUB_USER%/monitoring-collector:%BUILD_NUMBER% ."
                                bat "docker tag %DOCKER_HUB_USER%/monitoring-collector:%BUILD_NUMBER% %DOCKER_HUB_USER%/monitoring-collector:latest"
                            }
                        }
                    }
                }
            }
        }
        
        stage('Push to Docker Hub') {
            steps {
                script {
                    bat "echo %DOCKER_HUB_CREDS_PSW% | docker login -u %DOCKER_HUB_CREDS_USR% --password-stdin"
                    bat "docker push %DOCKER_HUB_USER%/monitoring-backend:%BUILD_NUMBER%"
                    bat "docker push %DOCKER_HUB_USER%/monitoring-backend:latest"
                    bat "docker push %DOCKER_HUB_USER%/monitoring-frontend:%BUILD_NUMBER%"
                    bat "docker push %DOCKER_HUB_USER%/monitoring-frontend:latest"
                    bat "docker push %DOCKER_HUB_USER%/monitoring-collector:%BUILD_NUMBER%"
                    bat "docker push %DOCKER_HUB_USER%/monitoring-collector:latest"
                }
            }
        }
        
        stage('Deploy to Kubernetes') {
            steps {
                script {
                    bat "kubectl apply -f k8s/namespace.yaml"
                    bat "kubectl apply -f k8s/"
                    bat "kubectl rollout status deployment/backend -n monitoring-app"
                    bat "kubectl rollout status deployment/frontend -n monitoring-app"
                }
            }
        }
        
        stage('Verify Deployment') {
            steps {
                script {
                    bat "kubectl get pods -n monitoring-app"
                    bat "kubectl get services -n monitoring-app"
                }
            }
        }
    }
    
    post {
        success {
            echo 'Deployment successful!'
        }
        failure {
            echo 'Deployment failed!'
        }
    }
}
