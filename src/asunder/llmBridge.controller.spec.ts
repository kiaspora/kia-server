import { LlmBridgeController } from './llmBridge.controller';
import { LlmBridgeService } from './llmBridge.service';

function createResponseMock() {
  return {
    setHeader: jest.fn(),
    status: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
  };
}

describe('LlmBridgeController', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  it('maps openPrompt requests onto llm bridge payloads using OPENAI_ACTIVE_MODEL', async () => {
    process.env.OPENAI_ACTIVE_MODEL = 'gpt-5';

    const forward = jest.fn().mockResolvedValue(
      new Response('{}', {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );
    const controller = new LlmBridgeController({
      forward,
    } as unknown as LlmBridgeService);
    const req = {
      body: {
        promptId: 'prompt-123',
        promptVersion: 4,
        input: 'hello',
        stream: false,
      },
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer test',
      },
      header: jest.fn().mockReturnValue('trace-open-prompt'),
    };
    const res = createResponseMock();

    await controller.openPrompt(req as any, res as any);

    expect(forward).toHaveBeenCalledWith(
      {
        model: 'gpt-5',
        promptId: 'prompt-123',
        promptVersion: 4,
        input: 'hello',
        stream: false,
      },
      'trace-open-prompt',
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('accepts prompytVersion as an alias for promptVersion', async () => {
    process.env.OPENAI_ACTIVE_MODEL = 'gpt-5-mini';

    const forward = jest.fn().mockResolvedValue(
      new Response('{}', {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );
    const controller = new LlmBridgeController({
      forward,
    } as unknown as LlmBridgeService);
    const req = {
      body: {
        promptId: 'prompt-xyz',
        prompytVersion: 2,
        input: 'hello alias',
        stream: false,
      },
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer test',
      },
      header: jest.fn().mockReturnValue('trace-open-prompt-alias'),
    };
    const res = createResponseMock();

    await controller.openPrompt(req as any, res as any);

    expect(forward).toHaveBeenCalledWith(
      {
        model: 'gpt-5-mini',
        promptId: 'prompt-xyz',
        promptVersion: 2,
        input: 'hello alias',
        stream: false,
      },
      'trace-open-prompt-alias',
    );
  });

  it('returns a local error when OPENAI_ACTIVE_MODEL is missing', async () => {
    delete process.env.OPENAI_ACTIVE_MODEL;

    const forward = jest.fn();
    const controller = new LlmBridgeController({
      forward,
    } as unknown as LlmBridgeService);
    const req = {
      body: {
        promptId: 'prompt-xyz',
        promptVersion: 2,
        input: 'hello alias',
        stream: false,
      },
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer test',
      },
      header: jest.fn().mockReturnValue('trace-open-prompt-missing-model'),
    };
    const res = createResponseMock();

    await controller.openPrompt(req as any, res as any);

    expect(forward).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(
      expect.stringContaining('OPENAI_ACTIVE_MODEL missing'),
    );
  });
});
