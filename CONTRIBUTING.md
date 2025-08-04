# Contributing Guidelines

Thank you for your interest in contributing to the **Isolated Local LLM Deployment & Monitoring Stack** project! Your support and involvement help improve the project for everyone. Please read this guide to get started.

---

## How You Can Contribute

### 1. **Reporting Issues**

- If you encounter a bug or have a suggestion, please open an [Issue](https://github.com/1devspace/isolated-local-llm-deployment-monitoring-stack/issues).
- Describe the problem, steps to reproduce, expected/actual behavior, and environment details.

### 2. **Submitting Pull Requests**

- Fork the repository and create your own branch (`feature/your-feature` or `fix/your-bug`).
- Write clear, self-explanatory commit messages.
- Ensure changes have been tested (see below).
- Add or update documentation as needed.
- Open a Pull Request describing your proposed change and the motivation behind it.

### 3. **Code Style**

- Follow standard best practices for Docker, YAML, and shell scripting.
- Keep configurations minimal, readable, and well-commented.

### 4. **Best Practices**

- For changes involving Docker or network isolation, ensure services remain isolated by default.
- Changes should not introduce external network dependencies or compromise local security.
- All monitoring integrations should remain optional and easy to enable/disable.

### 5. **Testing Your Contribution**

- If you are updating a workflow or Docker setup, make sure to run all containers locally and verify functionality.
- Test the monitoring stack (Prometheus, Grafana, cAdvisor, Node Exporter) after modifications.
- Validate the integrity of example commands and configuration files.

### 6. **Docs & Examples**

- If you add or change features, please update `README.md` and/or provide example usage.
- Comment your code when non-obvious logic is introduced.

---

## Project Structure

- `.github/workflows/`: Automation workflows (deploy/teardown)
- `prometheus.yml`: Prometheus configuration
- `README.md`: Project overview and getting started guide

---

## Code of Conduct

Be respectful and constructive in all project interactions. Abusive or discriminatory behavior will not be tolerated.

---

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](./LICENSE).

---

## Credits

This project builds upon great open-source work including Ollama, Open WebUI, Prometheus, Grafana, cAdvisor, and Node Exporter.

---

**Thank you for helping to make local, secure, and private AI deployment possible for all!**
