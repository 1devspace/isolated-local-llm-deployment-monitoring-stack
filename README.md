# 🧠 Isolated Local LLM Deployment & Monitoring Stack

This repository provides a fully automated solution for deploying a **Large Language Model (LLM)** environment on a **local Mac server** using Docker, with strict network isolation and real-time monitoring.

---

## ✨ Stack Components

| Service       | Purpose                                |
|---------------|----------------------------------------|
| **Ollama**     | Run LLMs locally (e.g., LLaMA 3)       |
| **Open WebUI** | Chat interface for prompt-response     |
| **Prometheus** | Time-series metrics collection         |
| **Grafana**    | Visual dashboard for metrics           |
| **cAdvisor**   | Container-level resource monitoring    |
| **Node Exporter** | Host-level system metrics           |

---

## 🚀 Getting Started

### 1. Prerequisites

Install Docker:

```bash
brew install --cask docker
open /Applications/Docker.app
```

## 🧱 Step 1: Isolated LLM Environment

### 🔹 Create Isolated Docker Network

```bash
docker network create ollama-net
```

###🔹 Run Ollama (Local LLM Backend)

```bash
docker run -d \
  --name ollama \
  --network ollama-net \
  -p 127.0.0.1:11444:11434 \
  -v ollama-data:/root/.ollama \
  ollama/ollama
```

**Details:**

- `--network ollama-net`: Keeps the container isolated from unrelated containers by using a dedicated Docker network.
- `-p 127.0.0.1:11444:11434`: Exposes the Ollama API **only to your local machine**, preventing external access.
- `-v ollama-data:/root/.ollama`: Mounts a persistent Docker volume to store downloaded model files between container restarts.

###🔹 Load a Model (e.g., LLaMA 3)

```bash
docker exec -it ollama ollama pull llama3
```

###🔹 Run Open WebUI (Frontend Chat Interface)

```bash
docker run -d \
  --name open-webui \
  --network ollama-net \
  -p 8081:8080 \
  -e OLLAMA_BASE_URL=http://ollama:11434 \
  -v open-webui:/app/backend/data \
  --restart always \
  ghcr.io/open-webui/open-webui:main
```

- **Accessible at:** [http://localhost:8081](http://localhost:8081)

- The Web UI communicates with the Ollama container through the internal `ollama-net` Docker network.

## 📈 Step 2: Add Monitoring Stack

###🔹 Create Monitoring Network

```bash
docker network create monitor-net
```

###🔹 Prometheus Configuration

Create a file named prometheus.yml:

```bash
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['prometheus:9090']

  - job_name: 'cadvisor'
    static_configs:
      - targets: ['cadvisor:8080']

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']
```

###🔹 Deploy Prometheus

```bash
docker run -d \
  --name prometheus \
  --network monitor-net \
  -p 9090:9090 \
  -v prometheus-data:/prometheus \
  -v $(pwd)/prometheus.yml:/etc/prometheus/prometheus.yml \
  prom/prometheus
```

###🔹 Deploy cAdvisor

```bash
docker run -d \
  --name=cadvisor \
  --network monitor-net \
  --volume=/:/rootfs:ro \
  --volume=/var/run:/var/run:ro \
  --volume=/sys:/sys:ro \
  --volume=/var/lib/docker/:/var/lib/docker:ro \
  --publish=8082:8080 \
  --detach=true \
  --device=/dev/kmsg \
  gcr.io/cadvisor/cadvisor:latest
```

###🔹 Deploy Node Exporter

```bash
docker run -d \
  --name=node-exporter \
  --network monitor-net \
  -p 9100:9100 \
  prom/node-exporter
```

###🔹 Deploy Grafana

```bash
docker run -d \
  --name=grafana \
  --network monitor-net \
  -p 4001:3000 \
  -v grafana-data:/var/lib/grafana \
  grafana/grafana
```

**Visit:** [http://localhost:4001](http://localhost:4001)  
**Default login:** `admin / admin`

**Add Prometheus as a data source:**  
`http://prometheus:9090`

**Import Dashboard ID:** `1860` (Node Exporter Full)


## 🔒 Security & Isolation

- All ports are exposed **only on `localhost`**
- Ollama and WebUI are isolated using the dedicated Docker network `ollama-net`
- Monitoring stack uses a separate internal network `monitor-net`
- No external traffic or cloud dependency — ideal for offline, air-gapped environments

---

## ✅ Features

- 📦 One-command deploy (via GitHub Actions optional)
- 🔐 Air-gapped: models and data stay local
- 📊 Optional full system & container metrics
- ♻️ Easy to reset or rebuild using Docker volumes and networks

---

## 📁 Folder Structure

```txt
.
├── prometheus.yml
├── README.md
└── .github
    └── workflows
        └── deploy.yml  # (optional)
```

## 📄 License

**MIT** — free to use, adapt, and modify.

---

## 🙌 Credits

This project makes use of the following open-source tools:

- [**Ollama**](https://github.com/ollama/ollama) — Local LLM runtime
- [**Open WebUI**](https://github.com/open-webui/open-webui) — Frontend for LLM interactions
- [**Prometheus**](https://prometheus.io) — Metrics collection and alerting toolkit
- [**Grafana**](https://grafana.com) — Interactive dashboards and data visualization
- [**cAdvisor**](https://github.com/google/cadvisor) — Container resource usage and performance analysis
- [**Node Exporter**](https://github.com/prometheus/node_exporter) — Host-level system metrics exporter

