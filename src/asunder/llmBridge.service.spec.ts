import { LlmBridgeService } from './llmBridge.service';

describe('LlmBridgeService', () => {
  const originalEnv = process.env;
  const originalFetch = global.fetch;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('uses request promptId over the env prompt ID', async () => {
    process.env.OPENAI_API_KEY = 'test-key';
    process.env.ASUNDER_LLM_PROMPT_ID = 'env-prompt';

    const fetchMock = jest.fn().mockResolvedValue(new Response('{}', { status: 200 }));
    global.fetch = fetchMock as typeof fetch;

    const service = new LlmBridgeService();

    await service.forward(
      {
        promptId: 'request-prompt',
        prompt: { version: 2 },
        input: 'hello',
      },
      'trace-1',
    );

    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    const upstreamBody = JSON.parse(String(options.body));

    expect(upstreamBody.prompt).toEqual({ id: 'request-prompt', version: '2' });
    expect(upstreamBody.promptId).toBeUndefined();
  });

  it('falls back to the env prompt ID when request promptId is omitted', async () => {
    process.env.OPENAI_API_KEY = 'test-key';
    process.env.ASUNDER_LLM_PROMPT_ID = 'env-prompt';

    const fetchMock = jest.fn().mockResolvedValue(new Response('{}', { status: 200 }));
    global.fetch = fetchMock as typeof fetch;

    const service = new LlmBridgeService();

    await service.forward(
      {
        prompt: {},
        input: 'hello',
      },
      'trace-2',
    );

    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    const upstreamBody = JSON.parse(String(options.body));

    expect(upstreamBody.prompt).toEqual({ id: 'env-prompt' });
  });

  it('rejects prompt-based requests when neither request nor env prompt ID is set', async () => {
    process.env.OPENAI_API_KEY = 'test-key';
    delete process.env.ASUNDER_LLM_PROMPT_ID;
    delete process.env.OPENAI_PROMPT_ID;
    delete process.env.OPENAI_ARCHETYPE_PROMP_ID;

    const service = new LlmBridgeService();

    await expect(
      service.forward(
        {
          prompt: {},
          input: 'hello',
        },
        'trace-3',
      ),
    ).rejects.toMatchObject({
      statusCode: 400,
      message: 'Missing prompt ID',
    });
  });
});
