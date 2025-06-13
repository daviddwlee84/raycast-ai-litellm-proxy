# Raycast AI LiteLLM Proxy

Use any LiteLLM model in Raycast AI without a subscription.

## Quick Start

**Prerequisites**: Docker + running LiteLLM server

1. **Clone and setup**:
   ```bash
   git clone https://github.com/d-cu/raycast-ai-litellm-proxy.git
   cd raycast-ai-litellm-proxy
   cp .env.example .env
   ```

2. **Configure** (edit `.env`):
   ```bash
   API_KEY=your-litellm-api-key
   BASE_URL=http://host.docker.internal:4000/v1
   ```
   
   > **Common fix**: If `host.docker.internal` doesn't work, use your IP:
   > ```bash
   > BASE_URL=http://192.168.1.X:4000/v1  # Replace X with your IP
   > ```

3. **Start and connect**:
   ```bash
   docker compose up -d
   ```
   
   In Raycast Settings → Extensions → AI:
   - Set **Ollama Host**: `localhost:11435`
   - Enable **Ollama** and **AI Extensions**

**Done!** Your models now appear in Raycast AI.

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Only see fallback models | Replace `host.docker.internal` with your IP in `.env` |
| Connection refused | Use `BASE_URL=http://192.168.1.X:4000/v1` |
| No models appear | Verify `API_KEY` and restart: `docker compose restart` |

## Configuration

Optional `.env` settings:

```bash
PORT=3000                        # Proxy port (default: 3000)
MODEL_REFRESH_INTERVAL=300000    # Model refresh interval (default: 5 min)
PING_INTERVAL=10000              # Connection keepalive (default: 10 sec)
```

---

> **Built on**: [@miikkaylisiurunen](https://github.com/miikkaylisiurunen)'s excellent [raycast-ai-openrouter-proxy](https://github.com/miikkaylisiurunen/raycast-ai-openrouter-proxy) — Thank you for the foundation! Enhanced for LiteLLM with performance and reliability improvements.