---
sidebar_position: 2
---

# LLM Deployment Guide

This guide covers deploying and configuring the LLM components: **Ollama** (the LLM runtime) and **Open WebUI** (the chat interface).

## 🔹 Step 1: Isolated Docker Network

Create a dedicated network for the LLM components to ensure isolation:

```bash
docker network create ollama-net
```

**Why isolation matters:**
- Keeps LLM containers separate from other services
- Enables secure internal communication
- Prevents unauthorized access to LLM services

## 🔹 Step 2: Deploy Ollama (LLM Backend)

Ollama serves as the backend that runs the actual language models:

```bash
docker run -d \
  --name ollama \
  --network ollama-net \
  -p 127.0.0.1:11444:11434 \
  -v ollama-data:/root/.ollama \
  ollama/ollama
```

### Configuration Details:

| Parameter | Purpose |
|-----------|---------|
| `--network ollama-net` | Isolated network for LLM services |
| `-p 127.0.0.1:11444:11434` | Expose API only to localhost (security) |
| `-v ollama-data:/root/.ollama` | Persistent storage for models |

### Verify Ollama is Running:

```bash
curl http://localhost:11444/api/version
```

Expected response:
```json
{"version":"0.1.x"}
```

## 🔹 Step 3: Download Language Models

### Download LLaMA 3 (Recommended)

```bash
docker exec -it ollama ollama pull llama3
```

### Available Models

| Model | Size | Best For | Command |
|-------|------|----------|---------|
| **LLaMA 3** | ~4.7GB | General conversations | `ollama pull llama3` |
| **Code Llama** | ~3.8GB | Code generation | `ollama pull codellama` |
| **Mistral** | ~4.1GB | Fast responses | `ollama pull mistral` |
| **Vicuna** | ~3.9GB | Instruction following | `ollama pull vicuna` |

### Custom Models

You can also use custom models or specific versions:

```bash
# Specific model versions
docker exec -it ollama ollama pull llama3:8b
docker exec -it ollama ollama pull llama3:70b  # Requires ~40GB RAM

# List downloaded models
docker exec -it ollama ollama list
```

## 🔹 Step 4: Deploy Open WebUI

The web interface that provides a ChatGPT-like experience:

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

### Configuration Details:

| Parameter | Purpose |
|-----------|---------|
| `--network ollama-net` | Same network as Ollama for communication |
| `-p 8081:8080` | Web interface accessible at localhost:8081 |
| `-e OLLAMA_BASE_URL=...` | Tells WebUI how to reach Ollama |
| `-v open-webui:/app/backend/data` | Persistent chat history and settings |
| `--restart always` | Auto-restart if container stops |

## 🎯 Access Your LLM

1. **Open your browser**: Navigate to [http://localhost:8081](http://localhost:8081)
2. **Create account**: Set up your first user account
3. **Select model**: Choose from your downloaded models
4. **Start chatting**: Begin your conversation with the LLM!

## ⚙️ Advanced Configuration

### Environment Variables

Customize Open WebUI behavior:

```bash
docker run -d \
  --name open-webui \
  --network ollama-net \
  -p 8081:8080 \
  -e OLLAMA_BASE_URL=http://ollama:11434 \
  -e WEBUI_NAME="My Local LLM" \
  -e DEFAULT_MODELS="llama3,codellama" \
  -v open-webui:/app/backend/data \
  --restart always \
  ghcr.io/open-webui/open-webui:main
```

### GPU Acceleration (NVIDIA)

If you have an NVIDIA GPU, enable GPU acceleration for faster inference:

```bash
# Ensure NVIDIA Container Toolkit is installed
# Then run Ollama with GPU support:

docker run -d \
  --name ollama \
  --network ollama-net \
  --gpus all \
  -p 127.0.0.1:11444:11434 \
  -v ollama-data:/root/.ollama \
  ollama/ollama
```

### Resource Limits

Prevent resource exhaustion by setting limits:

```bash
docker run -d \
  --name ollama \
  --network ollama-net \
  --memory="8g" \
  --cpus="4.0" \
  -p 127.0.0.1:11444:11434 \
  -v ollama-data:/root/.ollama \
  ollama/ollama
```

## 🔧 Management Commands

### Container Management

```bash
# Check container status
docker ps

# View logs
docker logs ollama
docker logs open-webui

# Restart containers
docker restart ollama open-webui

# Stop everything
docker stop ollama open-webui
```

### Model Management

```bash
# List available models online
docker exec -it ollama ollama list

# Remove a model
docker exec -it ollama ollama rm llama3

# Update a model
docker exec -it ollama ollama pull llama3
```

### Data Backup

```bash
# Backup model data
docker run --rm -v ollama-data:/data -v $(pwd):/backup alpine tar czf /backup/ollama-backup.tar.gz -C /data .

# Backup chat history
docker run --rm -v open-webui:/data -v $(pwd):/backup alpine tar czf /backup/webui-backup.tar.gz -C /data .
```

## 🚨 Troubleshooting

### Common Issues

**Ollama won't start:**
```bash
# Check if port is in use
lsof -i :11444

# Check Docker logs
docker logs ollama
```

**WebUI can't connect to Ollama:**
```bash
# Verify network connectivity
docker exec open-webui ping ollama

# Check environment variables
docker exec open-webui env | grep OLLAMA
```

**Model download fails:**
```bash
# Check available space
docker system df

# Try pulling manually
docker exec -it ollama ollama pull llama3 --verbose
```

### Performance Issues

**Slow response times:**
- Ensure adequate RAM (8GB+ for 7B models)
- Consider smaller models (llama3:7b vs llama3:70b)
- Enable GPU acceleration if available

**High memory usage:**
- Set Docker memory limits
- Use smaller models
- Clear unused models regularly

---

:::tip Pro Tip
Models are cached in the `ollama-data` volume. Once downloaded, they persist across container restarts and don't need to be downloaded again!
:::

Next: [Set up Monitoring →](./monitoring)