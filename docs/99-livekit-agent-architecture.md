`kia-server` does **not** connect directly to `kiaspora-voice-agent`.

The connection path is:

```text
mobile app
→ kia-server /voice/session
→ kia-server mints LiveKit token with agent dispatch metadata
→ mobile joins LiveKit room
→ LiveKit dispatches kiaspora-voice-agent
→ agent joins same room
→ agent publishes TTS audio
→ mobile hears audio
```

**Local Dev**

If `kia-server` runs locally:

```text
mobile → http://localhost:3000 or http://10.0.2.2:3000
```

`kia-server` still talks to **LiveKit Cloud** using:

```env
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=
LIVEKIT_URL=wss://...
```

`kiaspora-voice-agent` can also run locally:

```bash
cd kiaspora-voice-agent
npm run dev
```

It connects outbound to the same LiveKit project using matching `.env.local` values.

So local dev is usually:

```text
local mobile app
→ local kia-server
→ LiveKit Cloud
→ local kiaspora-voice-agent worker
→ LiveKit Cloud room
→ mobile receives audio
```

No localhost URL between `kia-server` and the agent is needed.

**Railway Deployed Server**

If `kia-server` is deployed on Railway:

```text
mobile → https://your-railway-app.up.railway.app/voice/session
```

Railway `kia-server` uses Railway env vars:

```env
API_BEARER_TOKEN=
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=
LIVEKIT_URL=wss://...
```

Then the same LiveKit dispatch flow happens.

The agent may be either:

1. Running locally with the same LiveKit env values, or
2. Deployed to LiveKit Cloud as an agent worker.

In production, preferred flow is:

```text
mobile
→ Railway kia-server
→ LiveKit Cloud
→ deployed kiaspora-voice-agent
→ mobile audio
```

**Key Rule**

All participants must point at the **same LiveKit project**:

```text
kia-server LIVEKIT_URL/API key/secret
kiaspora-voice-agent LIVEKIT_URL/API key/secret
mobile wsUrl returned by /voice/session
```

And the agent name must match exactly:

```ts
agentName: 'kiaspora-voice-agent'
```

**Potential Gotcha**

If you have both a local agent and deployed agent registered with the same `agentName` against the same LiveKit project, dispatch may go to whichever worker LiveKit sees as available. For clean testing, run only one agent target at a time.