# Raycast AI LiteLLM Proxy

Connect your LiteLLM instance to Raycast AI. Use any model from OpenAI, Anthropic, Google, OpenRouter, and more with your own API keys.

✨ **Benefits**: No Raycast Pro required • Dynamic model discovery with accurate metadata • Automatic capability detection • Works with AI Chat, Commands, and Quick AI

> **🔗 Forked from**: [raycast-ai-openrouter-proxy](https://github.com/miikkaylisiurunen/raycast-ai-openrouter-proxy) by [@miikkaylisiurunen](https://github.com/miikkaylisiurunen) — Enhanced for LiteLLM with zero-maintenance model detection

## Setup

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
   PORT=3000  # Optional: proxy port (default: 3000)
   MODEL_REFRESH_INTERVAL=300000  # Optional: model cache refresh (default: 5 minutes)
   PING_INTERVAL=10000  # Optional: streaming keep-alive (default: 10 seconds)
   ```

3. **Start proxy**:
   ```bash
   docker compose up -d
   ```

4. **Configure Raycast**:
   - Settings → Extensions → AI
   - Set **Ollama Host** to: `localhost:11435`
   - Enable **Ollama** and **AI Extensions**

Your LiteLLM models will now appear in Raycast!

## Troubleshooting

- **Only seeing "GPT-3.5 Turbo"?** Check `docker compose logs` - likely connection issue
- **401 Unauthorized?** Verify your `API_KEY` in `.env`
- **Connection refused?** Use your IP instead: `BASE_URL=http://192.168.1.X:4000/v1`
- **Models missing capabilities?** Restart proxy: `docker compose restart` (models refresh every 5 minutes)
- **Health check**: Visit `http://localhost:11435/health` to verify proxy status
- **After changes**: Run `docker compose restart`

## Features

### Supported:
- **Dynamic Model Discovery**: Automatically detects all LiteLLM models
- **Accurate Metadata**: Context lengths and capabilities from LiteLLM's authoritative data
- **Vision Models**: GPT-4V, Claude-3, Gemini Pro (auto-detected from LiteLLM)
- **Tool Calling**: AI Extensions, MCP servers, function calling
- **Streaming Responses**: Real-time chat with configurable keep-alive
- **Health Monitoring**: `/health` endpoint for status checks
- **Hot Reloading**: New models appear automatically (5-minute refresh)

### Not Supported:
- Thinking process display (models work, just no UI)
- Some remote tools like `@web` (use MCP alternatives)

## Configuration

### Automatic Model Detection
The proxy uses LiteLLM's `/model/info` endpoint to automatically detect:
- **Context lengths**: Exact values from LiteLLM (no hardcoded guesses)
- **Capabilities**: Vision and tool support from model metadata
- **Provider info**: Automatic provider-based capability enhancement

### Smart Caching
- Models refresh every 5 minutes (configurable via `MODEL_REFRESH_INTERVAL`)
- Graceful fallbacks if LiteLLM is temporarily unavailable
- Maintains cached models during brief outages

### Zero Maintenance
- **New models**: Automatically detected when added to LiteLLM
- **Capability updates**: Existing models get new features without code changes
- **No hardcoded patterns**: All metadata comes from LiteLLM's authoritative source

## FAQ

**Need Raycast Pro?** No, that's the point!

**Deploy remotely?** Not recommended - no authentication implemented.

**Need Ollama installed?** No, this proxy mimics Ollama's API.

**Add/remove models?** Update your LiteLLM config and restart it. Models refresh automatically within 5 minutes.

**Model capabilities wrong?** The proxy uses LiteLLM's authoritative data. If LiteLLM reports incorrect capabilities, that's an upstream issue.

## Attribution

This project builds on the excellent foundation of [raycast-ai-openrouter-proxy](https://github.com/miikkaylisiurunen/raycast-ai-openrouter-proxy) by [@miikkaylisiurunen](https://github.com/miikkaylisiurunen). 

**Key Enhancements:**
- **Smart Model Detection**: Uses LiteLLM's `/model/info` endpoint for accurate metadata
- **Zero Maintenance**: Eliminates hardcoded model patterns and manual updates  
- **Health Monitoring**: Added `/health` endpoint for troubleshooting
- **Enhanced Configuration**: Configurable refresh intervals and connection settings
- **Robust Error Handling**: Multiple fallback layers for reliability

🙏 Thank you [@miikkaylisiurunen](https://github.com/miikkaylisiurunen) for the solid foundation!