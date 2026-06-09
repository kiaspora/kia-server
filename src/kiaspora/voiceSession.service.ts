import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { AccessToken } from 'livekit-server-sdk';
import { RoomAgentDispatch, RoomConfiguration } from '@livekit/protocol';

export type VoiceSessionRequest = {
  mode?: unknown;
  passageId?: unknown;
  reference?: unknown;
  text?: unknown;
  voiceId?: unknown;
  initialPassage?: unknown;
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
type VoiceSessionMode = 'read_aloud' | 'autoplay';

type VoiceSessionPassage = {
  passageId: string;
  reference: string;
  text: string;
};

type NormalizedVoiceSessionRequest =
  | {
      mode: 'read_aloud';
      passage: VoiceSessionPassage;
      voiceId?: string;
    }
  | {
      mode: 'autoplay';
      initialPassage: VoiceSessionPassage;
      voiceId?: string;
    };

@Injectable()
export class VoiceSessionService {
  async createSession(body: VoiceSessionRequest): Promise<VoiceSessionResponse> {
    const request = this.normalizeRequest(body);
    const { apiKey, apiSecret, wsUrl } = this.getLiveKitConfig();
    const roomName = this.buildRoomName(this.getPrimaryPassage(request).passageId);
    const identity = `feed-listener-${randomUUID()}`;
    const reference = this.getPrimaryPassage(request).reference;

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
      canPublishData: request.mode === 'autoplay',
    });

    token.roomConfig = new RoomConfiguration({
      agents: [
        new RoomAgentDispatch({
          agentName: AGENT_NAME,
          metadata: JSON.stringify(this.buildAgentMetadata(request, roomName)),
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

  private normalizeRequest(body: VoiceSessionRequest): NormalizedVoiceSessionRequest {
    const mode = this.readMode(body.mode);
    const voiceId = this.readOptionalString(body.voiceId, 'voiceId', 128);

    if (mode === 'autoplay') {
      const initialPassage = this.readPassage(body.initialPassage, 'initialPassage');
      return {
        mode,
        initialPassage,
        ...(voiceId ? { voiceId } : {}),
      };
    }

    return {
      mode,
      passage: {
        passageId: this.requireString(body.passageId, 'passageId', 128),
        reference: this.requireString(body.reference, 'reference', 256),
        text: this.requireString(body.text, 'text', 12000),
      },
      ...(voiceId ? { voiceId } : {}),
    };
  }

  private readMode(value: unknown): VoiceSessionMode {
    if (value === null || value === undefined || value === 'single' || value === 'read_aloud') {
      return 'read_aloud';
    }

    if (value === 'autoplay') {
      return 'autoplay';
    }

    throw new BadRequestException('"mode" must be "single", "read_aloud", or "autoplay"');
  }

  private readPassage(value: unknown, field: string): VoiceSessionPassage {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      throw new BadRequestException(`"${field}" is required`);
    }

    const passage = value as Record<string, unknown>;
    return {
      passageId: this.requireString(passage.passageId, `${field}.passageId`, 128),
      reference: this.requireString(passage.reference, `${field}.reference`, 256),
      text: this.requireString(passage.text, `${field}.text`, 12000),
    };
  }

  private getPrimaryPassage(request: NormalizedVoiceSessionRequest): VoiceSessionPassage {
    return request.mode === 'autoplay' ? request.initialPassage : request.passage;
  }

  private buildAgentMetadata(
    request: NormalizedVoiceSessionRequest,
    roomName: string
  ): Record<string, unknown> {
    if (request.mode === 'autoplay') {
      return {
        mode: 'autoplay',
        room: roomName,
        initialPassage: request.initialPassage,
        ...(request.voiceId ? { voiceId: request.voiceId } : {}),
      };
    }

    return {
      mode: 'read_aloud',
      room: roomName,
      passageId: request.passage.passageId,
      reference: request.passage.reference,
      text: request.passage.text,
      ...(request.voiceId ? { voiceId: request.voiceId } : {}),
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
