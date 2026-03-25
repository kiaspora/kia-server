import { LlmRouterService } from './llmRouter.service';

describe('LlmRouterService', () => {
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

  it('calls OpenAI responses API with input messages and extracts output_text', async () => {
    process.env.OPENAI_ARCHETYPE_API_KEY = 'test-key';
    process.env.OPENAI_MODEL = 'gpt-4.1-mini';

    const fetchMock = jest.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          output_text: 'Maple',
          usage: { input_tokens: 10, output_tokens: 2 },
          id: 'resp_123',
        }),
        { status: 200 },
      ),
    );
    global.fetch = fetchMock as typeof fetch;

    const service = new LlmRouterService();
    const result = await service.handle(
      {
        provider: 'openai',
        stream: false,
        archetype: 'Analyst',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: "What's a name you like?" },
        ],
      },
      'postman-trace-001',
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.openai.com/v1/responses');

    const upstreamBody = JSON.parse(String(options.body));
    expect(upstreamBody).toMatchObject({
      model: 'gpt-4.1-mini',
      stream: false,
      input: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: "What's a name you like?" },
      ],
      temperature: 0.7,
    });
    expect(upstreamBody.messages).toBeUndefined();

    expect(result).toEqual({
      content: 'Maple',
      provider: 'openai',
      latency_ms: expect.any(Number),
      raw_provider_meta: {
        model: 'gpt-4.1-mini',
        usage: { input_tokens: 10, output_tokens: 2 },
        id: 'resp_123',
        promptId: undefined,
        promptVersion: undefined,
      },
    });
  });

  it('omits temperature for gpt-5 models', async () => {
    process.env.OPENAI_ARCHETYPE_API_KEY = 'test-key';
    process.env.OPENAI_MODEL = 'gpt-5-mini';

    const fetchMock = jest
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ output_text: 'Oak' }), { status: 200 }));
    global.fetch = fetchMock as typeof fetch;

    const service = new LlmRouterService();
    await service.handle(
      {
        provider: 'openai',
        stream: false,
        archetype: 'Analyst',
        messages: [{ role: 'user', content: 'test' }],
      },
      'trace-gpt5',
    );

    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    const upstreamBody = JSON.parse(String(options.body));
    expect(upstreamBody.temperature).toBeUndefined();
    expect(upstreamBody.input).toEqual([{ role: 'user', content: 'test' }]);
  });
});
