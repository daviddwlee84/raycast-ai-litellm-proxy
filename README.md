# Raycast AI LiteLLM Proxy

Connect your LiteLLM instance to Raycast AI. Use any model supported by LiteLLM with your own API keys.

**Benefits**: No Raycast Pro required, dynamic model discovery, works with AI Chat, Commands, and Quick AI

> **Forked from**: [raycast-ai-openrouter-proxy](https://github.com/miikkaylisiurunen/raycast-ai-openrouter-proxy) by [@miikkaylisiurunen](https://github.com/miikkaylisiurunen) — Enhanced for LiteLLM with zero-maintenance model detection

## Quick Start

**Prerequisites**: Docker, running LiteLLM server, Raycast

1. **Clone and configure**:

   ```bash
   git clone https://github.com/d-cu/raycast-ai-litellm-proxy.git
   cd raycast-ai-litellm-proxy
   cp .env.example .env
   ```

2. **Edit `.env`**:

   ```bash
   API_KEY=your-litellm-generated-key-here
   BASE_URL=http://host.docker.internal:4000/v1
   ```

3. **Start proxy**:

   ```bash
   docker compose up -d
   ```

4. **Configure Raycast**:
   - Settings → Extensions → AI
   - Set **Ollama Host** to: `localhost:11435`
   - Enable **Ollama** and **AI Extensions**

Your LiteLLM models will now appear in Raycast.

## Configuration

All settings are optional except `API_KEY` and `BASE_URL`:

```bash
API_KEY=your-litellm-generated-key-here
BASE_URL=http://host.docker.internal:4000/v1
PORT=3000                        # Proxy port (default: 3000)
MODEL_REFRESH_INTERVAL=300000    # Model cache refresh in ms (default: 5 minutes)
PING_INTERVAL=10000              # Streaming keep-alive in ms (default: 10 seconds)
```

## Troubleshooting

- **Only seeing "GPT-3.5 Turbo"?** Check `docker compose logs` - likely connection issue
- **401 Unauthorized?** Verify your `API_KEY` in `.env`
- **Connection refused?** Use your IP instead: `BASE_URL=http://192.168.1.X:4000/v1`
- **Models missing capabilities?** Restart proxy: `docker compose restart`
- **Health check**: Visit `http://localhost:11435/health` to verify proxy status
- **After changes**: Run `docker compose restart`

## Features

**Supported:**

- Dynamic model discovery from LiteLLM
- Accurate context lengths and capabilities
- Vision models (automatically detected)
- Tool calling and AI Extensions
- Streaming responses
- Health monitoring endpoint

**Not Supported:**

- Thinking process display
- Some remote tools like `@web`

## Development

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run lint      # Check code style
npm run format    # Format code
npm run typecheck # Type checking
```

## Attribution

This project builds on [raycast-ai-openrouter-proxy](https://github.com/miikkaylisiurunen/raycast-ai-openrouter-proxy) by [@miikkaylisiurunen](https://github.com/miikkaylisiurunen).

**Key Enhancements:**

- Smart model detection using LiteLLM's `/model/info` endpoint
- Zero maintenance with automatic model updates
- Health monitoring and enhanced error handling
- Configurable refresh intervals and connection settings

Thank you [@miikkaylisiurunen](https://github.com/miikkaylisiurunen) for the solid foundation!
