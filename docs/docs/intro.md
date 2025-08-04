---
sidebar_position: 1
---

# Getting Started

Welcome to the **Isolated Local LLM Deployment & Monitoring Stack**! This guide will help you deploy a complete Large Language Model (LLM) environment on your local machine with Docker, featuring strict network isolation and comprehensive monitoring.

## 🎯 What You'll Get

- **Ollama**: Local LLM runtime (supports LLaMA 3, Code Llama, and more)
- **Open WebUI**: Beautiful chat interface for interacting with your models
- **Prometheus**: Time-series metrics collection and alerting
- **Grafana**: Interactive dashboards and visualizations
- **cAdvisor**: Container-level resource monitoring
- **Node Exporter**: Host-level system metrics

## 📋 Prerequisites

Before you begin, ensure you have:

### Required Software

- **Docker Desktop**: The foundation of our containerized deployment
  ```bash
  brew install --cask docker
  open /Applications/Docker.app
  ```

### System Requirements

- **macOS**: 10.15 or later (Intel or Apple Silicon)
- **Memory**: At least 8GB RAM (16GB recommended for larger models)
- **Storage**: 20GB free space (models can be large)
- **Network**: No internet required after initial setup (air-gapped compatible)

## ⚡ Quick Start

Get your LLM environment running in under 5 minutes:

### 1. Clone the Repository

```bash
git clone https://github.com/mohamedaminehamdi/Isolated-Local-LLM-Deployment-Monitoring-Stack.git
cd Isolated-Local-LLM-Deployment-Monitoring-Stack
```

### 2. Deploy the LLM Stack

```bash
# Create isolated network
docker network create ollama-net

# Deploy Ollama (LLM backend)
docker run -d \
  --name ollama \
  --network ollama-net \
  -p 127.0.0.1:11444:11434 \
  -v ollama-data:/root/.ollama \
  ollama/ollama

# Load your first model (LLaMA 3)
docker exec -it ollama ollama pull llama3

# Deploy Open WebUI (chat interface)
docker run -d \
  --name open-webui \
  --network ollama-net \
  -p 8081:8080 \
  -e OLLAMA_BASE_URL=http://ollama:11434 \
  -v open-webui:/app/backend/data \
  --restart always \
  ghcr.io/open-webui/open-webui:main
```

### 3. Access Your LLM

🎉 **You're ready!** Open your browser and go to:

- **Chat Interface**: [http://localhost:8081](http://localhost:8081)
- **Create your first account** and start chatting with LLaMA 3

## 🔍 What's Next?

Now that you have the basic LLM stack running, explore these advanced features:

- [**LLM Deployment Guide**](./llm-deployment): Deploy additional models and configure advanced settings
- [**Monitoring Stack**](./monitoring): Add Prometheus, Grafana, and system monitoring
- [**Security & Isolation**](./security): Understand the network isolation and security features
- [**Troubleshooting**](./troubleshooting): Common issues and solutions

## 🛟 Need Help?

- 📖 Check our [Troubleshooting Guide](./troubleshooting)
- 🐛 [Report Issues](https://github.com/mohamedaminehamdi/Isolated-Local-LLM-Deployment-Monitoring-Stack/issues)
- 💬 [Discussions](https://github.com/mohamedaminehamdi/Isolated-Local-LLM-Deployment-Monitoring-Stack/discussions)

---

:::tip Success Tip
Keep your models and data persistent by using Docker volumes. This way, your conversations and downloaded models survive container restarts!
:::