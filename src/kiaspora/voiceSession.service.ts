import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { AccessToken } from 'livekit-server-sdk';
import { RoomAgentDispatch, RoomConfiguration } from '@livekit/protocol';

export type VoiceSessionRequest = {
  passageId?: unknown;
  reference?: unknown;
  text?: unknown;
  voiceId?: unknown;
};

export type VoiceSessionResponse = {
  roomName: string;
  token: string;
  wsUrl: string;
  reference: string;
  server_time: string;
};

const AGENT_NAME = 'kiaspora-voice-agent';
const TOKEN_TTL_SECONDS = 60 * 10;

@Injectable()
export class VoiceSessionService {
  async createSession(body: VoiceSessionRequest): Promise<VoiceSessionResponse> {
    const passageId = this.requireString(body.passageId, 'passageId', 128);
    const reference = this.requireString(body.reference, 'reference', 256);
    const text = this.requireString(body.text, 'text', 12000);
    const voiceId = this.readOptionalString(body.voiceId, 'voiceId', 128);
    const { apiKey, apiSecret, wsUrl } = this.getLiveKitConfig();
    const roomName = this.buildRoomName(passageId);
    const identity = `feed-listener-${randomUUID()}`;

    const token = new AccessToken(apiKey, apiSecret, {
      identity,
      name: 'Kiaspora Listener',
      ttl: TOKEN_TTL_SECONDS,
    });

    token.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: false,
    });

    token.roomConfig = new RoomConfiguration({
      agents: [
        new RoomAgentDispatch({
          agentName: AGENT_NAME,
          metadata: JSON.stringify({
            mode: 'read_aloud',
            room: roomName,
            reference,
            text,
            ...(voiceId ? { voiceId } : {}),
          }),
        }),
      ],
    });

    return {
      roomName,
      token: await token.toJwt(),
      wsUrl,
      reference,
      server_time: new Date().toISOString(),
    };
  }

  private requireString(value: unknown, field: string, maxLength: number): string {
    if (typeof value !== 'string') {
      throw new BadRequestException(`"${field}" is required`);
    }

    const normalized = value.trim();
    if (!normalized) {
      throw new BadRequestException(`"${field}" is required`);
    }

    if (normalized.length > maxLength) {
      throw new BadRequestException(`"${field}" is too long`);
    }

    return normalized;
  }

  private readOptionalString(value: unknown, field: string, maxLength: number): string | undefined {
    if (value === null || value === undefined) return undefined;
    if (typeof value === 'string' && !value.trim()) return undefined;

    return this.requireString(value, field, maxLength);
  }

  private getLiveKitConfig() {
    const apiKey = process.env.LIVEKIT_API_KEY?.trim();
    const apiSecret = process.env.LIVEKIT_API_SECRET?.trim();
    const wsUrl = (process.env.LIVEKIT_URL || process.env.LIVEKIT_WS_URL || '').trim();

    if (!apiKey || !apiSecret || !wsUrl) {
      throw new InternalServerErrorException(
        'LiveKit configuration missing; set LIVEKIT_API_KEY, LIVEKIT_API_SECRET, and LIVEKIT_URL'
      );
    }

    return { apiKey, apiSecret, wsUrl };
  }

  private buildRoomName(passageId: string): string {
    const safePassageId = passageId
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80);
    const suffix = randomUUID().slice(0, 8);
    return `feed-${safePassageId || 'passage'}-${suffix}`;
  }
}
