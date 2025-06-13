# Raycast AI LiteLLM Proxy

Connect any LiteLLM model to Raycast AI instantly. No Raycast Pro required.

> **Built on**: [raycast-ai-openrouter-proxy](https://github.com/miikkaylisiurunen/raycast-ai-openrouter-proxy) by [@miikkaylisiurunen](https://github.com/miikkaylisiurunen) — Thank you for the foundation!

## Quick Start (2 minutes)

**Prerequisites**: Docker + running LiteLLM server

1. **Setup**:
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

3. **Start**:
   ```bash
   docker compose up -d
   ```

4. **Connect Raycast**:
   - Raycast Settings → Extensions → AI
   - Set **Ollama Host**: `localhost:11435`
   - Enable **Ollama** and **AI Extensions**

**Done!** Your LiteLLM models now appear in Raycast AI.

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Only see fallback models | Check `docker compose logs` - connection issue |
| 401 Unauthorized | Verify `API_KEY` in `.env` |
| Connection refused | Use your IP: `BASE_URL=http://192.168.1.X:4000/v1` |
| Missing models | `docker compose restart` |

**Health check**: `http://localhost:11435/health`

## Optional Configuration

Add to `.env` if needed:

```bash
PORT=3000                        # Proxy port (default: 3000)
MODEL_REFRESH_INTERVAL=300000    # Model refresh (default: 5 min)
```

## What You Get

- **All LiteLLM models** in Raycast automatically
- **Vision models** work with image inputs
- **Tool calling** and AI Extensions supported
- **Zero maintenance** - models auto-update every 5 minutes
- **Production ready** - memory leak fixes, error recovery

---

**Credits**: Built on [@miikkaylisiurunen](https://github.com/miikkaylisiurunen)'s excellent [raycast-ai-openrouter-proxy](https://github.com/miikkaylisiurunen/raycast-ai-openrouter-proxy). Enhanced for LiteLLM with performance and reliability improvements.
