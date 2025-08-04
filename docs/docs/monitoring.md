---
sidebar_position: 3
---

# Monitoring Stack Setup

Add comprehensive monitoring to your LLM deployment with **Prometheus**, **Grafana**, **cAdvisor**, and **Node Exporter**. Get real-time insights into system performance, resource usage, and container metrics.

## 🎯 Monitoring Components

| Service | Purpose | Port | Dashboard |
|---------|---------|------|-----------|
| **Prometheus** | Metrics collection & alerting | 9090 | [localhost:9090](http://localhost:9090) |
| **Grafana** | Interactive dashboards | 4001 | [localhost:4001](http://localhost:4001) |
| **cAdvisor** | Container metrics | 8082 | [localhost:8082](http://localhost:8082) |
| **Node Exporter** | System metrics | 9100 | Raw metrics endpoint |

## 🔹 Step 1: Create Monitoring Network

Create a separate network for monitoring services:

```bash
docker network create monitor-net
```

This isolates monitoring from the LLM services while allowing metric collection.

## 🔹 Step 2: Configure Prometheus

### Create Configuration File

First, create the Prometheus configuration in your project root:

```yaml title="prometheus.yml"
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  # - "first_rules.yml"
  # - "second_rules.yml"

scrape_configs:
  # Prometheus monitoring itself
  - job_name: 'prometheus'
    static_configs:
      - targets: ['prometheus:9090']

  # Container metrics from cAdvisor
  - job_name: 'cadvisor'
    static_configs:
      - targets: ['cadvisor:8080']

  # Host system metrics from Node Exporter
  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']

  # Optional: Monitor your LLM services
  - job_name: 'ollama'
    static_configs:
      - targets: ['host.docker.internal:11444']
    metrics_path: /metrics
    scrape_interval: 30s
```

### Deploy Prometheus

```bash
docker run -d \
  --name prometheus \
  --network monitor-net \
  -p 9090:9090 \
  -v prometheus-data:/prometheus \
  -v $(pwd)/prometheus.yml:/etc/prometheus/prometheus.yml \
  --restart unless-stopped \
  prom/prometheus
```

**Configuration Details:**
- `-v prometheus-data:/prometheus`: Persistent storage for metrics
- `-v $(pwd)/prometheus.yml:/etc/prometheus/prometheus.yml`: Mount config file
- `--restart unless-stopped`: Auto-restart on failure

## 🔹 Step 3: Deploy cAdvisor

Monitor Docker containers and their resource usage:

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
  --restart unless-stopped \
  gcr.io/cadvisor/cadvisor:latest
```

**Key Mount Points:**
- `/:/rootfs:ro`: Read-only access to host filesystem
- `/var/run:/var/run:ro`: Docker socket access
- `/sys:/sys:ro`: System information
- `/var/lib/docker/:/var/lib/docker:ro`: Docker data directory

## 🔹 Step 4: Deploy Node Exporter

Collect host-level system metrics:

```bash
docker run -d \
  --name=node-exporter \
  --network monitor-net \
  --pid="host" \
  -p 9100:9100 \
  --restart unless-stopped \
  prom/node-exporter \
  --path.rootfs=/host \
  --collector.filesystem.ignored-mount-points='^/(sys|proc|dev|host|etc|rootfs/var/lib/docker/containers|rootfs/var/lib/docker/overlay2|rootfs/run/docker/netns|rootfs/var/lib/docker/aufs)($$|/)'
```

**Configuration Details:**
- `--pid="host"`: Use host's process namespace
- `--path.rootfs=/host`: Root filesystem path
- `--collector.filesystem.ignored-mount-points`: Ignore Docker internal mounts

## 🔹 Step 5: Deploy Grafana

Create beautiful dashboards for your metrics:

```bash
docker run -d \
  --name=grafana \
  --network monitor-net \
  -p 4001:3000 \
  -v grafana-data:/var/lib/grafana \
  -e GF_SECURITY_ADMIN_PASSWORD=admin \
  --restart unless-stopped \
  grafana/grafana
```

## 🎨 Configure Grafana Dashboards

### 1. Access Grafana

1. Open [http://localhost:4001](http://localhost:4001)
2. Login with `admin` / `admin`
3. Change the default password when prompted

### 2. Add Prometheus Data Source

1. Go to **Configuration** → **Data Sources**
2. Click **Add data source**
3. Select **Prometheus**
4. Set URL: `http://prometheus:9090`
5. Click **Save & Test**

### 3. Import Pre-built Dashboards

Import these popular dashboard IDs:

#### Node Exporter Dashboard
- **Dashboard ID**: `1860`
- **Name**: "Node Exporter Full"
- **Provides**: CPU, Memory, Disk, Network metrics

#### Docker Container Dashboard
- **Dashboard ID**: `193`
- **Name**: "Docker Monitoring"
- **Provides**: Container resource usage

#### Custom LLM Dashboard
Create a custom dashboard for LLM-specific metrics:

```json title="LLM Dashboard Panels"
{
  "dashboard": {
    "title": "LLM Stack Monitoring",
    "panels": [
      {
        "title": "Ollama Container CPU",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(container_cpu_usage_seconds_total{name=\"ollama\"}[5m]) * 100"
          }
        ]
      },
      {
        "title": "Ollama Container Memory",
        "type": "graph", 
        "targets": [
          {
            "expr": "container_memory_usage_bytes{name=\"ollama\"} / 1024 / 1024 / 1024"
          }
        ]
      }
    ]
  }
}
```

## 📊 Key Metrics to Monitor

### System Metrics
- **CPU Usage**: `100 - (avg(irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)`
- **Memory Usage**: `(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100`
- **Disk Usage**: `100 - ((node_filesystem_avail_bytes{mountpoint="/"} * 100) / node_filesystem_size_bytes{mountpoint="/"})`

### Container Metrics
- **Ollama CPU**: `rate(container_cpu_usage_seconds_total{name="ollama"}[5m]) * 100`
- **Ollama Memory**: `container_memory_usage_bytes{name="ollama"}`
- **WebUI Requests**: `rate(container_network_receive_bytes_total{name="open-webui"}[5m])`

### Custom Alerts

Set up alerts for critical conditions:

```yaml title="prometheus-alerts.yml"
groups:
  - name: llm-stack-alerts
    rules:
      - alert: HighCPUUsage
        expr: (100 - (avg(irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)) > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High CPU usage detected"
          
      - alert: LowMemory
        expr: (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100 > 90
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Low memory available"
          
      - alert: OllamaDown
        expr: up{job="ollama"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Ollama service is down"
```

## 🔧 Monitoring Commands

### Check Services Status

```bash
# Check all monitoring containers
docker ps --filter "network=monitor-net"

# View service logs
docker logs prometheus
docker logs grafana
docker logs cadvisor
docker logs node-exporter
```

### Prometheus Queries

Test these queries in Prometheus UI ([localhost:9090](http://localhost:9090)):

```promql
# CPU usage by container
rate(container_cpu_usage_seconds_total[5m]) * 100

# Memory usage by container
container_memory_usage_bytes / 1024 / 1024

# Network I/O by container
rate(container_network_receive_bytes_total[5m])
```

### Backup Monitoring Data

```bash
# Backup Prometheus data
docker run --rm -v prometheus-data:/data -v $(pwd):/backup alpine tar czf /backup/prometheus-backup.tar.gz -C /data .

# Backup Grafana data
docker run --rm -v grafana-data:/data -v $(pwd):/backup alpine tar czf /backup/grafana-backup.tar.gz -C /data .
```

## 🔗 Connect Monitoring to LLM Stack

To monitor the LLM containers from the monitoring stack:

```bash
# Connect monitoring network to LLM containers
docker network connect monitor-net ollama
docker network connect monitor-net open-webui
```

This allows Prometheus to scrape metrics from your LLM services.

## 🚨 Troubleshooting

### Common Issues

**Prometheus can't scrape targets:**
```bash
# Check network connectivity
docker exec prometheus ping cadvisor
docker exec prometheus ping node-exporter

# Verify config file
docker exec prometheus cat /etc/prometheus/prometheus.yml
```

**Grafana dashboards not loading:**
```bash
# Check data source connection
# Go to Grafana → Data Sources → Test connection

# Restart Grafana
docker restart grafana
```

**cAdvisor permission errors:**
```bash
# Ensure proper volume mounts
docker inspect cadvisor | grep -A 10 "Mounts"

# Check if running on supported system
uname -a
```

### Performance Optimization

**Reduce metrics retention:**
```bash
# Restart Prometheus with shorter retention
docker run -d \
  --name prometheus \
  --network monitor-net \
  -p 9090:9090 \
  -v prometheus-data:/prometheus \
  -v $(pwd)/prometheus.yml:/etc/prometheus/prometheus.yml \
  prom/prometheus \
  --storage.tsdb.retention.time=7d
```

**Optimize scrape intervals:**
- Increase `scrape_interval` to 30s or 60s for less critical metrics
- Use different intervals for different job types
- Disable unnecessary collectors in Node Exporter

---

:::tip Dashboard Tip
Start with the pre-built dashboards (ID 1860 for Node Exporter) and customize them based on your specific monitoring needs. This gives you a solid foundation to build upon!
:::

Next: [Security & Isolation →](./security)