import { BadRequestException } from '@nestjs/common';
import { VoiceSessionService } from './voiceSession.service';

describe('VoiceSessionService', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      LIVEKIT_API_KEY: 'devkey',
      LIVEKIT_API_SECRET: 'devsecret',
      LIVEKIT_URL: 'wss://livekit.example',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('dispatches legacy read-aloud metadata by default', async () => {
    const service = new VoiceSessionService();

    const response = await service.createSession({
      passageId: 'genesis-1-1',
      reference: 'Genesis 1:1',
      text: 'In the beginning.',
      voiceId: 'rime_masonry',
    });

    const payload = decodeJwtPayload(response.token);
    const metadata = readDispatchMetadata(payload);

    expect(metadata).toMatchObject({
      mode: 'read_aloud',
      passageId: 'genesis-1-1',
      reference: 'Genesis 1:1',
      text: 'In the beginning.',
      voiceId: 'rime_masonry',
    });
    expect(payload.video?.canPublishData).toBe(false);
  });

  it('dispatches autoplay metadata and allows client data messages', async () => {
    const service = new VoiceSessionService();

    const response = await service.createSession({
      mode: 'autoplay',
      initialPassage: {
        passageId: 'psalm-1-1',
        reference: 'Psalm 1:1',
        text: 'Blessed is the man.',
      },
      voiceId: 'rime_masonry',
    });

    const payload = decodeJwtPayload(response.token);
    const metadata = readDispatchMetadata(payload);

    expect(response.reference).toBe('Psalm 1:1');
    expect(metadata).toMatchObject({
      mode: 'autoplay',
      initialPassage: {
        passageId: 'psalm-1-1',
        reference: 'Psalm 1:1',
        text: 'Blessed is the man.',
      },
      voiceId: 'rime_masonry',
    });
    expect(payload.video?.canPublishData).toBe(true);
  });

  it('rejects autoplay without an initial passage', async () => {
    const service = new VoiceSessionService();

    await expect(
      service.createSession({
        mode: 'autoplay',
      })
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});

function decodeJwtPayload(token: string): Record<string, any> {
  const payload = token.split('.')[1];
  return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as Record<string, any>;
}

function readDispatchMetadata(payload: Record<string, any>): Record<string, any> {
  const metadata = payload.roomConfig?.agents?.[0]?.metadata;
  return JSON.parse(metadata) as Record<string, any>;
}
