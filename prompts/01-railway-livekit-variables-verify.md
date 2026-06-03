Manual test it in this order.

**1. Start `kia-server`**

In `/Users/novelbamboo/Desktop/github/kia-server`:

```bash
API_BEARER_TOKEN=your_token \
LIVEKIT_API_KEY=your_key \
LIVEKIT_API_SECRET=your_secret \
LIVEKIT_URL=wss://your-livekit-cloud-url \
pnpm run start:dev
```

Smoke test `/voice/session`:

```bash
curl -i -X POST http://localhost:3000/voice/session \
  -H "Authorization: Bearer your_token" \
  -H "Content-Type: application/json" \
  -d '{
    "passageId": "genesis-1-1",
    "reference": "Genesis 1:1",
    "text": "In the beginning God created the heaven and the earth."
  }'
```

Expected: `200` JSON with `roomName`, `token`, `wsUrl`, `reference`.

**2. Start `kiaspora-voice-agent`**

In `/Users/novelbamboo/Desktop/github/kiaspora-voice-agent`, make sure `.env.local` has matching LiveKit values:

```bash
LIVEKIT_API_KEY=...
LIVEKIT_API_SECRET=...
LIVEKIT_URL=wss://...
```

Then run:

```bash
npm run dev
```

Expected: agent starts and waits for dispatches as `kiaspora-voice-agent`.

**3. Run `kiaspora-voice-mvp` mobile**

Because LiveKit native deps/plugin were added, rebuild native app, not just Metro.

Android emulator:

```bash
cd /Users/novelbamboo/Desktop/github/kiaspora-voice-mvp/mobile

EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:3000 \
EXPO_PUBLIC_API_BEARER_TOKEN=your_token \
npm run android
```

iOS simulator:

```bash
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000 \
EXPO_PUBLIC_API_BEARER_TOKEN=your_token \
npm run ios
```

Physical device: use your machine LAN IP instead of localhost, e.g. `http://192.168.1.20:3000`.

**4. End-to-end test**

In the app:

1. Open the KVM feed.
2. Tap `Listen` on a feed item.
3. Confirm the button changes to `Joining`, then `Stop`.
4. Confirm server logs show `POST /voice/session`.
5. Confirm the voice-agent terminal receives the dispatch metadata.
6. Confirm audio plays the reference and passage only.
7. Confirm it does not greet, ask questions, or explain.
8. Tap `Stop` and confirm playback disconnects immediately.
9. Tap `Listen` again on another item and confirm a new room/session starts.

**Expected pass condition**

`Feed item → Listen → /voice/session → LiveKit room join → narrator reads passage → session ends/stop works`.

Known caveat: server-wide `tsc` still has an unrelated existing failure in `generate-review.dto.spec.ts`; mobile typecheck and voice-agent build passed.