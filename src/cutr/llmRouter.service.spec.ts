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
          usage: {
            input_tokens: 10,
            output_tokens: 2,
            total_tokens: 12,
            input_tokens_details: { cached_tokens: 1 },
            output_tokens_details: { reasoning_tokens: 7 },
          },
          id: 'resp_123',
        }),
        { status: 200, headers: { 'x-request-id': 'req_openai_123' } },
      ),
    );
    global.fetch = fetchMock as typeof fetch;

    const service = new LlmRouterService();
    const result = await service.handle(
      {
        provider: 'openai',
        stream: false,
        archetype: 'Analyst',
        routing: { priority: 'quality' },
        telemetry: { request_id: 'client-req-1' },
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
      archetype: 'Analyst',
      provider: 'openai',
      model: 'gpt-4.1-mini',
      latency_ms: expect.any(Number),
      usage: {
        input_tokens: 10,
        output_tokens: 2,
        total_tokens: 12,
        reasoning_tokens: 7,
        cached_input_tokens: 1,
        cache_hit_tokens: null,
        cache_miss_tokens: null,
      },
      performance: {
        queue_time_ms: null,
        prompt_time_ms: null,
        completion_time_ms: null,
        total_time_ms: null,
      },
      routing: {
        selected_provider: 'openai',
        fallback_used: false,
        fallback_from: null,
        priority: 'quality',
      },
      telemetry: {
        request_id: 'client-req-1',
        response_id: 'resp_123',
        timestamp: expect.any(String),
      },
      raw_provider_meta: {
        id: 'resp_123',
        usage: {
          input_tokens: 10,
          output_tokens: 2,
          total_tokens: 12,
          input_tokens_details: { cached_tokens: 1 },
          output_tokens_details: { reasoning_tokens: 7 },
        },
        raw: {
          output_text: 'Maple',
          usage: {
            input_tokens: 10,
            output_tokens: 2,
            total_tokens: 12,
            input_tokens_details: { cached_tokens: 1 },
            output_tokens_details: { reasoning_tokens: 7 },
          },
          id: 'resp_123',
        },
      },
    });
  });

  it('normalizes DeepSeek usage into the universal schema', async () => {
    process.env.DEEPSEEK_API_KEY = 'test-key';
    process.env.DEEPSEEK_MODEL = 'deepseek-chat';

    const fetchMock = jest.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 'deepseek_123',
          choices: [{ message: { content: 'Deep answer' } }],
          usage: {
            prompt_tokens: 14,
            completion_tokens: 483,
            total_tokens: 497,
            prompt_tokens_details: { cached_tokens: 0 },
            prompt_cache_hit_tokens: 0,
            prompt_cache_miss_tokens: 14,
          },
        }),
        { status: 200, headers: { 'x-request-id': 'req_deepseek_123' } },
      ),
    );
    global.fetch = fetchMock as typeof fetch;

    const service = new LlmRouterService();
    const result = await service.handle(
      {
        provider: 'deepseek',
        stream: false,
        archetype: 'Reviewer',
        routing: { priority: 'latency' },
        messages: [{ role: 'user', content: 'Review this' }],
      },
      'trace-deepseek',
    );

    expect(result).toEqual({
      content: 'Deep answer',
      archetype: 'Reviewer',
      provider: 'deepseek',
      model: 'deepseek-chat',
      latency_ms: expect.any(Number),
      usage: {
        input_tokens: 14,
        output_tokens: 483,
        total_tokens: 497,
        reasoning_tokens: null,
        cached_input_tokens: 0,
        cache_hit_tokens: 0,
        cache_miss_tokens: 14,
      },
      performance: {
        queue_time_ms: null,
        prompt_time_ms: null,
        completion_time_ms: null,
        total_time_ms: null,
      },
      routing: {
        selected_provider: 'deepseek',
        fallback_used: false,
        fallback_from: null,
        priority: 'latency',
      },
      telemetry: {
        request_id: 'req_deepseek_123',
        response_id: 'deepseek_123',
        timestamp: expect.any(String),
      },
      raw_provider_meta: {
        id: 'deepseek_123',
        usage: {
          prompt_tokens: 14,
          completion_tokens: 483,
          total_tokens: 497,
          prompt_tokens_details: { cached_tokens: 0 },
          prompt_cache_hit_tokens: 0,
          prompt_cache_miss_tokens: 14,
        },
        raw: {
          id: 'deepseek_123',
          choices: [{ message: { content: 'Deep answer' } }],
          usage: {
            prompt_tokens: 14,
            completion_tokens: 483,
            total_tokens: 497,
            prompt_tokens_details: { cached_tokens: 0 },
            prompt_cache_hit_tokens: 0,
            prompt_cache_miss_tokens: 14,
          },
        },
      },
    });
  });

  it('normalizes Groq usage and timing into the universal schema', async () => {
    process.env.GROQ_API_KEY = 'test-key';
    process.env.GROQ_MODEL = 'llama-3.1-8b-instant';

    const fetchMock = jest.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 'chatcmpl-groq-123',
          choices: [{ message: { content: 'Groq answer' } }],
          usage: {
            queue_time: 0.046404372,
            prompt_tokens: 47,
            prompt_time: 0.002259788,
            completion_tokens: 202,
            completion_time: 0.330711866,
            total_tokens: 249,
            total_time: 0.332971654,
          },
        }),
        { status: 200 },
      ),
    );
    global.fetch = fetchMock as typeof fetch;

    const service = new LlmRouterService();
    const result = await service.handle(
      {
        provider: 'groq',
        stream: false,
        archetype: 'Builder',
        messages: [{ role: 'user', content: 'Build this' }],
      },
      'trace-groq',
    );

    expect(result).toMatchObject({
      content: 'Groq answer',
      archetype: 'Builder',
      provider: 'groq',
      model: 'llama-3.1-8b-instant',
      latency_ms: expect.any(Number),
      usage: {
        input_tokens: 47,
        output_tokens: 202,
        total_tokens: 249,
        reasoning_tokens: null,
        cached_input_tokens: null,
        cache_hit_tokens: null,
        cache_miss_tokens: null,
      },
      performance: {
        queue_time_ms: 46.404372,
        prompt_time_ms: 2.259788,
        completion_time_ms: expect.any(Number),
        total_time_ms: 332.971654,
      },
      routing: {
        selected_provider: 'groq',
        fallback_used: false,
        fallback_from: null,
        priority: null,
      },
      telemetry: {
        request_id: null,
        response_id: 'chatcmpl-groq-123',
        timestamp: expect.any(String),
      },
      raw_provider_meta: {
        id: 'chatcmpl-groq-123',
        usage: {
          queue_time: 0.046404372,
          prompt_tokens: 47,
          prompt_time: 0.002259788,
          completion_tokens: 202,
          completion_time: 0.330711866,
          total_tokens: 249,
          total_time: 0.332971654,
        },
        raw: {
          id: 'chatcmpl-groq-123',
          choices: [{ message: { content: 'Groq answer' } }],
          usage: {
            queue_time: 0.046404372,
            prompt_tokens: 47,
            prompt_time: 0.002259788,
            completion_tokens: 202,
            completion_time: 0.330711866,
            total_tokens: 249,
            total_time: 0.332971654,
          },
        },
      },
    });
    expect(result.performance.completion_time_ms).toBeCloseTo(330.711866, 6);
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

  it('uses a request model override and preserves parsed object content', async () => {
    process.env.OPENAI_ARCHETYPE_API_KEY = 'test-key';
    process.env.OPENAI_MODEL = 'gpt-4.1-mini';

    const fetchMock = jest.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          output_text: '{"winner":"Ada","confidence":0.92}',
          id: 'resp_json_123',
          usage: {},
        }),
        { status: 200 },
      ),
    );
    global.fetch = fetchMock as typeof fetch;

    const service = new LlmRouterService();
    const result = await service.handle(
      {
        provider: 'openai',
        model: 'gpt-5-mini',
        stream: false,
        archetype: 'Analyst',
        messages: [{ role: 'user', content: 'Return JSON' }],
      },
      'trace-json',
    );

    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    const upstreamBody = JSON.parse(String(options.body));
    expect(upstreamBody.model).toBe('gpt-5-mini');
    expect(result.content).toEqual({ winner: 'Ada', confidence: 0.92 });
  });

  it('maps json attachments into OpenAI input_file items', async () => {
    process.env.OPENAI_ARCHETYPE_API_KEY = 'test-key';
    process.env.OPENAI_MODEL = 'gpt-4.1-mini';

    const fetchMock = jest
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ output_text: 'JSON ok' }), { status: 200 }));
    global.fetch = fetchMock as typeof fetch;

    const service = new LlmRouterService();
    await service.handle(
      {
        provider: 'openai',
        stream: false,
        archetype: 'Analyst',
        messages: [{ role: 'user', content: 'Summarize the attachment' }],
        attachments: [
          {
            name: 'payload.json',
            file_data: 'data:application/json;base64,eyJoZWxsbyI6IndvcmxkIn0=',
          },
        ],
      },
      'trace-attach-json',
    );

    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    const upstreamBody = JSON.parse(String(options.body));
    expect(upstreamBody.input).toEqual([
      {
        role: 'user',
        content: [
          { type: 'input_text', text: 'Summarize the attachment' },
          {
            type: 'input_file',
            filename: 'payload.json',
            file_data: 'data:application/json;base64,eyJoZWxsbyI6IndvcmxkIn0=',
          },
        ],
      },
    ]);
  });

  it('maps markdown attachments into OpenAI input_file items', async () => {
    process.env.OPENAI_ARCHETYPE_API_KEY = 'test-key';

    const fetchMock = jest
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ output_text: 'MD ok' }), { status: 200 }));
    global.fetch = fetchMock as typeof fetch;

    const service = new LlmRouterService();
    await service.handle(
      {
        provider: 'openai',
        stream: false,
        archetype: 'Analyst',
        messages: [{ role: 'user', content: 'Read the markdown file' }],
        attachments: [
          {
            name: 'notes.md',
            file_data: 'data:text/markdown;base64,IyBIZWxsbw==',
          },
        ],
      },
      'trace-attach-md',
    );

    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    const upstreamBody = JSON.parse(String(options.body));
    expect(upstreamBody.input[0].content[1]).toEqual({
      type: 'input_file',
      filename: 'notes.md',
      file_data: 'data:text/markdown;base64,IyBIZWxsbw==',
    });
  });

  it('maps text attachments into OpenAI input_file items', async () => {
    process.env.OPENAI_ARCHETYPE_API_KEY = 'test-key';

    const fetchMock = jest
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ output_text: 'TXT ok' }), { status: 200 }));
    global.fetch = fetchMock as typeof fetch;

    const service = new LlmRouterService();
    await service.handle(
      {
        provider: 'openai',
        stream: false,
        archetype: 'Analyst',
        messages: [{ role: 'user', content: 'Read the text file' }],
        attachments: [
          {
            name: 'notes.txt',
            file_data: 'data:text/plain;base64,SGVsbG8=',
          },
        ],
      },
      'trace-attach-txt',
    );

    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    const upstreamBody = JSON.parse(String(options.body));
    expect(upstreamBody.input[0].content[1]).toEqual({
      type: 'input_file',
      filename: 'notes.txt',
      file_data: 'data:text/plain;base64,SGVsbG8=',
    });
  });

  it('maps xml attachments into OpenAI input_file items', async () => {
    process.env.OPENAI_ARCHETYPE_API_KEY = 'test-key';

    const fetchMock = jest
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ output_text: 'XML ok' }), { status: 200 }));
    global.fetch = fetchMock as typeof fetch;

    const service = new LlmRouterService();
    await service.handle(
      {
        provider: 'openai',
        stream: false,
        archetype: 'Analyst',
        messages: [{ role: 'user', content: 'Read the xml file' }],
        attachments: [
          {
            name: 'feed.xml',
            file_data: 'data:application/xml;base64,PHJvb3Q+PC9yb290Pg==',
          },
        ],
      },
      'trace-attach-xml',
    );

    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    const upstreamBody = JSON.parse(String(options.body));
    expect(upstreamBody.input[0].content[1]).toEqual({
      type: 'input_file',
      filename: 'feed.xml',
      file_data: 'data:application/xml;base64,PHJvb3Q+PC9yb290Pg==',
    });
  });

  it('maps pdf attachments into OpenAI input_file items', async () => {
    process.env.OPENAI_ARCHETYPE_API_KEY = 'test-key';

    const fetchMock = jest
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ output_text: 'PDF ok' }), { status: 200 }));
    global.fetch = fetchMock as typeof fetch;

    const service = new LlmRouterService();
    await service.handle(
      {
        provider: 'openai',
        stream: false,
        archetype: 'Analyst',
        messages: [{ role: 'user', content: 'Read the pdf file' }],
        attachments: [
          {
            name: 'report.pdf',
            file_data: 'data:application/pdf;base64,aGVsbG8=',
          },
        ],
      },
      'trace-attach-pdf',
    );

    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    const upstreamBody = JSON.parse(String(options.body));
    expect(upstreamBody.input[0].content[1]).toEqual({
      type: 'input_file',
      filename: 'report.pdf',
      file_data: 'data:application/pdf;base64,aGVsbG8=',
    });
  });

  it('rejects malformed attachment data URLs', async () => {
    process.env.OPENAI_ARCHETYPE_API_KEY = 'test-key';

    const service = new LlmRouterService();

    await expect(
      service.handle(
        {
          provider: 'openai',
          stream: false,
          archetype: 'Analyst',
          messages: [{ role: 'user', content: 'Explain the attachment' }],
          attachments: [{ name: 'notes.txt', file_data: 'hello' }],
        },
        'trace-invalid-data-url',
      ),
    ).rejects.toMatchObject({
      status: 400,
      message:
        'attachments.file_data must be a valid data URL like data:text/plain;base64,SGVsbG8=',
    });
  });

  it('rejects unsupported attachment MIME types', async () => {
    process.env.OPENAI_ARCHETYPE_API_KEY = 'test-key';

    const service = new LlmRouterService();

    await expect(
      service.handle(
        {
          provider: 'openai',
          stream: false,
          archetype: 'Analyst',
          messages: [{ role: 'user', content: 'Explain the attachment' }],
          attachments: [
            {
              name: 'notes.csv',
              file_data: 'data:text/csv;base64,YWJjLGRlZg==',
            },
          ],
        },
        'trace-invalid-mime',
      ),
    ).rejects.toMatchObject({
      status: 400,
      message: 'Unsupported attachment MIME type: text/csv',
    });
  });

  it('rejects DeepSeek attachment requests before calling upstream', async () => {
    process.env.DEEPSEEK_API_KEY = 'test-key';

    const fetchMock = jest.fn();
    global.fetch = fetchMock as typeof fetch;

    const service = new LlmRouterService();

    await expect(
      service.handle(
        {
          provider: 'deepseek',
          stream: false,
          archetype: 'Reviewer',
          messages: [{ role: 'user', content: 'Review this file' }],
          attachments: [
            {
              name: 'notes.txt',
              file_data: 'data:text/plain;base64,SGVsbG8=',
            },
          ],
        },
        'trace-deepseek-attachment',
      ),
    ).rejects.toMatchObject({
      status: 400,
      code: 'ATTACHMENTS_UNSUPPORTED_FOR_PROVIDER',
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects Groq attachment requests before calling upstream', async () => {
    process.env.GROQ_API_KEY = 'test-key';

    const fetchMock = jest.fn();
    global.fetch = fetchMock as typeof fetch;

    const service = new LlmRouterService();

    await expect(
      service.handle(
        {
          provider: 'groq',
          stream: false,
          archetype: 'Builder',
          messages: [{ role: 'user', content: 'Build from this file' }],
          attachments: [
            {
              name: 'notes.txt',
              file_data: 'data:text/plain;base64,SGVsbG8=',
            },
          ],
        },
        'trace-groq-attachment',
      ),
    ).rejects.toMatchObject({
      status: 400,
      code: 'ATTACHMENTS_UNSUPPORTED_FOR_PROVIDER',
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
