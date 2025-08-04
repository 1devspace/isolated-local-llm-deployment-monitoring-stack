---
sidebar_position: 5
---

# Troubleshooting Guide

This guide covers common issues and solutions for the Isolated Local LLM Deployment & Monitoring Stack.

## 🚨 Quick Diagnostics

### Health Check Script

Run this script to quickly diagnose common issues:

```bash
#!/bin/bash
# health-check.sh

echo "=== LLM Stack Health Check ==="

# Check Docker daemon
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker daemon not running"
    echo "Solution: Start Docker Desktop or run 'sudo systemctl start docker'"
    exit 1
else
    echo "✅ Docker daemon running"
fi

# Check networks
echo -e "\n🌐 Networks:"
for network in ollama-net monitor-net; do
    if docker network ls | grep -q "$network"; then
        echo "✅ $network exists"
    else
        echo "❌ $network missing - run: docker network create $network"
    fi
done

# Check containers
echo -e "\n📦 Containers:"
containers=("ollama" "open-webui" "prometheus" "grafana" "cadvisor" "node-exporter")
for container in "${containers[@]}"; do
    if docker ps | grep -q "$container"; then
        echo "✅ $container running"
    elif docker ps -a | grep -q "$container"; then
        echo "⚠️  $container exists but stopped"
        echo "   Run: docker start $container"
    else
        echo "❌ $container not found"
    fi
done

# Check ports
echo -e "\n🔌 Ports:"
ports=("11444:Ollama" "8081:WebUI" "9090:Prometheus" "4001:Grafana")
for port_info in "${ports[@]}"; do
    port=${port_info%:*}
    service=${port_info#*:}
    if netstat -tln | grep -q ":$port "; then
        echo "✅ Port $port ($service) listening"
    else
        echo "❌ Port $port ($service) not listening"
    fi
done

echo -e "\n=== Health Check Complete ==="
```

## 🔄 LLM Stack Issues

### Ollama Problems

#### **Issue**: Ollama container won't start

**Symptoms:**
```bash
docker logs ollama
# Error: failed to start server: bind: address already in use
```

**Solutions:**

1. **Check port conflicts:**
```bash
# Find what's using port 11444
lsof -i :11444
sudo fuser -k 11444/tcp  # Kill process using port

# Or use different port
docker run -d --name ollama -p 127.0.0.1:11445:11434 ollama/ollama
```

2. **Check Docker socket permissions:**
```bash
# Fix Docker permissions (Linux)
sudo usermod -aG docker $USER
newgrp docker

# Restart Docker service
sudo systemctl restart docker
```

3. **Clear container if corrupted:**
```bash
docker stop ollama
docker rm ollama
docker run -d --name ollama --network ollama-net -p 127.0.0.1:11444:11434 -v ollama-data:/root/.ollama ollama/ollama
```

#### **Issue**: Model download fails

**Symptoms:**
```bash
docker exec ollama ollama pull llama3
# Error: failed to download model
```

**Solutions:**

1. **Check internet connectivity:**
```bash
docker exec ollama ping -c 3 ollama.ai
```

2. **Check disk space:**
```bash
docker system df
df -h /var/lib/docker
```

3. **Manual download with verbose output:**
```bash
docker exec ollama ollama pull llama3 --verbose
```

4. **Clear corrupted download:**
```bash
docker exec ollama rm -rf /root/.ollama/models/llama3
docker exec ollama ollama pull llama3
```

#### **Issue**: Ollama API not responding

**Symptoms:**
```bash
curl http://localhost:11444/api/version
# curl: (7) Failed to connect to localhost port 11444
```

**Solutions:**

1. **Check container status:**
```bash
docker ps | grep ollama
docker logs ollama --tail 50
```

2. **Verify network configuration:**
```bash
docker inspect ollama | grep -A 10 "NetworkSettings"
```

3. **Test internal API:**
```bash
docker exec ollama curl http://localhost:11434/api/version
```

4. **Restart with debug logging:**
```bash
docker stop ollama
docker run -d --name ollama --network ollama-net -p 127.0.0.1:11444:11434 -v ollama-data:/root/.ollama -e OLLAMA_DEBUG=1 ollama/ollama
```

### Open WebUI Problems

#### **Issue**: WebUI can't connect to Ollama

**Symptoms:**
- WebUI loads but no models available
- "Connection error" in WebUI
- Models list is empty

**Solutions:**

1. **Check network connectivity:**
```bash
docker exec open-webui ping ollama
docker exec open-webui curl http://ollama:11434/api/version
```

2. **Verify environment variables:**
```bash
docker exec open-webui env | grep OLLAMA
# Should show: OLLAMA_BASE_URL=http://ollama:11434
```

3. **Check both containers are on same network:**
```bash
docker inspect ollama | grep ollama-net
docker inspect open-webui | grep ollama-net
```

4. **Recreate WebUI with correct settings:**
```bash
docker stop open-webui && docker rm open-webui
docker run -d \
  --name open-webui \
  --network ollama-net \
  -p 8081:8080 \
  -e OLLAMA_BASE_URL=http://ollama:11434 \
  -v open-webui:/app/backend/data \
  --restart always \
  ghcr.io/open-webui/open-webui:main
```

#### **Issue**: WebUI performance is slow

**Solutions:**

1. **Check system resources:**
```bash
docker stats ollama open-webui
```

2. **Increase memory limits:**
```bash
docker update --memory=4g ollama
docker update --memory=2g open-webui
```

3. **Use smaller models:**
```bash
docker exec ollama ollama pull llama3:7b  # Instead of 70b
```

## 📊 Monitoring Stack Issues

### Prometheus Problems

#### **Issue**: Prometheus can't scrape targets

**Symptoms:**
- Targets show as "DOWN" in Prometheus UI
- No metrics data in Grafana

**Solutions:**

1. **Check network connectivity:**
```bash
docker exec prometheus ping cadvisor
docker exec prometheus ping node-exporter
```

2. **Verify configuration:**
```bash
docker exec prometheus cat /etc/prometheus/prometheus.yml
```

3. **Check target endpoints:**
```bash
curl http://localhost:8082/metrics  # cAdvisor
curl http://localhost:9100/metrics  # Node Exporter
```

4. **Fix network connections:**
```bash
# Connect monitoring containers to monitor-net
docker network connect monitor-net prometheus
docker network connect monitor-net cadvisor
docker network connect monitor-net node-exporter
```

#### **Issue**: Prometheus data not persisting

**Solutions:**

1. **Check volume mount:**
```bash
docker inspect prometheus | grep -A 5 "Mounts"
```

2. **Fix permissions:**
```bash
docker exec prometheus ls -la /prometheus
sudo chown -R 65534:65534 /var/lib/docker/volumes/prometheus-data
```

### Grafana Problems

#### **Issue**: Can't login to Grafana

**Solutions:**

1. **Use default credentials:**
   - Username: `admin`
   - Password: `admin`

2. **Reset admin password:**
```bash
docker exec grafana grafana-cli admin reset-admin-password newpassword
```

3. **Check container logs:**
```bash
docker logs grafana --tail 50
```

#### **Issue**: Dashboards show no data

**Solutions:**

1. **Verify data source:**
   - Go to Configuration → Data Sources
   - Test Prometheus connection: `http://prometheus:9090`

2. **Check Prometheus connectivity:**
```bash
docker exec grafana curl http://prometheus:9090/api/v1/label/__name__/values
```

3. **Import dashboard correctly:**
   - Use dashboard ID: `1860` for Node Exporter
   - Select Prometheus data source during import

## 🖥️ System Issues

### Docker Problems

#### **Issue**: Docker out of disk space

**Solutions:**

1. **Check disk usage:**
```bash
docker system df
df -h /var/lib/docker
```

2. **Clean up Docker:**
```bash
# Remove unused containers, networks, images
docker system prune -a -f

# Remove unused volumes (CAREFUL!)
docker volume prune -f
```

3. **Move Docker root directory:**
```bash
sudo systemctl stop docker
sudo mv /var/lib/docker /new/path/docker
sudo ln -s /new/path/docker /var/lib/docker
sudo systemctl start docker
```

#### **Issue**: Permission denied errors

**Solutions:**

1. **Add user to docker group:**
```bash
sudo usermod -aG docker $USER
newgrp docker
```

2. **Fix volume permissions:**
```bash
sudo chown -R $USER:$USER /var/lib/docker/volumes/
```

### Performance Issues

#### **Issue**: High CPU/Memory usage

**Solutions:**

1. **Monitor resource usage:**
```bash
docker stats
htop
```

2. **Set resource limits:**
```bash
docker update --memory=4g --cpus=2 ollama
```

3. **Use smaller models:**
```bash
# Instead of llama3:70b, use:
docker exec ollama ollama pull llama3:7b
docker exec ollama ollama pull tinyllama  # Very small model
```

4. **Optimize Docker:**
```bash
# Limit container logs
docker run -d --log-opt max-size=10m --log-opt max-file=3 your-image
```

#### **Issue**: Network connectivity slow

**Solutions:**

1. **Check DNS resolution:**
```bash
docker exec ollama nslookup ollama.ai
```

2. **Use local DNS:**
```bash
# Add to /etc/docker/daemon.json
{
  "dns": ["8.8.8.8", "1.1.1.1"]
}
```

## 🔧 Recovery Procedures

### Complete Stack Reset

If everything is broken, start fresh:

```bash
#!/bin/bash
# reset-stack.sh

echo "⚠️  This will remove all containers and data!"
read -p "Continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

# Stop all containers
docker stop ollama open-webui prometheus grafana cadvisor node-exporter

# Remove containers
docker rm ollama open-webui prometheus grafana cadvisor node-exporter

# Remove networks
docker network rm ollama-net monitor-net

# Remove volumes (optional - this deletes all data!)
read -p "Delete all data volumes? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker volume rm ollama-data open-webui prometheus-data grafana-data
fi

echo "✅ Stack reset complete. Re-run deployment commands."
```

### Backup and Restore

**Create backup:**
```bash
#!/bin/bash
# backup-stack.sh

mkdir -p backup/$(date +%Y%m%d_%H%M%S)
cd backup/$(date +%Y%m%d_%H%M%S)

# Export volumes
docker run --rm -v ollama-data:/data -v $(pwd):/backup alpine tar czf /backup/ollama-data.tar.gz -C /data .
docker run --rm -v open-webui:/data -v $(pwd):/backup alpine tar czf /backup/open-webui.tar.gz -C /data .
docker run --rm -v prometheus-data:/data -v $(pwd):/backup alpine tar czf /backup/prometheus-data.tar.gz -C /data .
docker run --rm -v grafana-data:/data -v $(pwd):/backup alpine tar czf /backup/grafana-data.tar.gz -C /data .

# Export configurations
docker exec prometheus cat /etc/prometheus/prometheus.yml > prometheus.yml
cp ../prometheus.yml .

echo "✅ Backup complete in backup/$(date +%Y%m%d_%H%M%S)/"
```

**Restore backup:**
```bash
#!/bin/bash
# restore-stack.sh

BACKUP_DIR=${1:-"backup/latest"}

if [ ! -d "$BACKUP_DIR" ]; then
    echo "❌ Backup directory not found: $BACKUP_DIR"
    exit 1
fi

cd "$BACKUP_DIR"

# Restore volumes
docker volume create ollama-data
docker volume create open-webui
docker volume create prometheus-data
docker volume create grafana-data

docker run --rm -v ollama-data:/data -v $(pwd):/backup alpine tar xzf /backup/ollama-data.tar.gz -C /data
docker run --rm -v open-webui:/data -v $(pwd):/backup alpine tar xzf /backup/open-webui.tar.gz -C /data
docker run --rm -v prometheus-data:/data -v $(pwd):/backup alpine tar xzf /backup/prometheus-data.tar.gz -C /data
docker run --rm -v grafana-data:/data -v $(pwd):/backup alpine tar xzf /backup/grafana-data.tar.gz -C /data

echo "✅ Restore complete. Start your containers."
```

## 📞 Getting Help

### Log Collection

Collect logs for troubleshooting:

```bash
#!/bin/bash
# collect-logs.sh

mkdir -p troubleshooting-$(date +%Y%m%d_%H%M%S)
cd troubleshooting-$(date +%Y%m%d_%H%M%S)

# System info
uname -a > system-info.txt
docker version > docker-version.txt
docker info > docker-info.txt

# Container logs
for container in ollama open-webui prometheus grafana cadvisor node-exporter; do
    if docker ps -a | grep -q "$container"; then
        docker logs "$container" > "${container}-logs.txt" 2>&1
        docker inspect "$container" > "${container}-inspect.json"
    fi
done

# Network info
docker network ls > networks.txt
netstat -tlnp > ports.txt

echo "✅ Logs collected in troubleshooting-$(date +%Y%m%d_%H%M%S)/"
```

### Community Support

- **GitHub Issues**: [Report bugs and request features](https://github.com/mohamedaminehamdi/Isolated-Local-LLM-Deployment-Monitoring-Stack/issues)
- **Discussions**: [Ask questions and share tips](https://github.com/mohamedaminehamdi/Isolated-Local-LLM-Deployment-Monitoring-Stack/discussions)
- **Documentation**: [Check the latest docs](https://mohamedaminehamdi.github.io/Isolated-Local-LLM-Deployment-Monitoring-Stack/)

When reporting issues, please include:
- System information (OS, Docker version)
- Complete error messages
- Steps to reproduce
- Container logs (use the log collection script above)

---

:::tip Debugging Tip
Start with the health check script at the top of this page. It catches 90% of common configuration issues and provides specific solutions for each problem found.
:::

Need more help? Check our [GitHub Issues](https://github.com/mohamedaminehamdi/Isolated-Local-LLM-Deployment-Monitoring-Stack/issues) or start a [Discussion](https://github.com/mohamedaminehamdi/Isolated-Local-LLM-Deployment-Monitoring-Stack/discussions).