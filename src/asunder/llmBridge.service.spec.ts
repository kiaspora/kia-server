import * as fs from 'node:fs/promises';
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

    const fetchMock = jest
      .fn()
      .mockResolvedValue(new Response('{}', { status: 200 }));
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

    const fetchMock = jest
      .fn()
      .mockResolvedValue(new Response('{}', { status: 200 }));
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

  it('maps top-level promptVersion onto prompt.version without requiring prompt object', async () => {
    process.env.OPENAI_API_KEY = 'test-key';

    const fetchMock = jest
      .fn()
      .mockResolvedValue(new Response('{}', { status: 200 }));
    global.fetch = fetchMock as typeof fetch;

    const service = new LlmBridgeService();

    await service.forward(
      {
        promptId: 'prompt-123',
        promptVersion: 3,
        input: 'hello',
      },
      'trace-prompt-version',
    );

    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    const upstreamBody = JSON.parse(String(options.body));

    expect(upstreamBody.prompt).toEqual({ id: 'prompt-123', version: '3' });
    expect(upstreamBody.promptVersion).toBeUndefined();
  });

  it('maps data-url attachments into input_file content items', async () => {
    process.env.OPENAI_API_KEY = 'test-key';
    process.env.ASUNDER_LLM_PROMPT_ID = 'env-prompt';

    const fetchMock = jest
      .fn()
      .mockResolvedValue(new Response('{}', { status: 200 }));
    global.fetch = fetchMock as typeof fetch;

    const service = new LlmBridgeService();

    await service.forward(
      {
        input: 'Summarize the attachment',
        attachments: [
          {
            name: 'report.pdf',
            file_data: 'data:application/pdf;base64,aGVsbG8=',
          },
        ],
      },
      'trace-attach',
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    const upstreamBody = JSON.parse(String(options.body));

    expect(upstreamBody.input).toEqual([
      {
        role: 'user',
        content: [
          { type: 'input_text', text: 'Summarize the attachment' },
          {
            type: 'input_file',
            filename: 'report.pdf',
            file_data: 'data:application/pdf;base64,aGVsbG8=',
          },
        ],
      },
    ]);
    expect(upstreamBody.tools).toBeUndefined();
  });

  it('adds attachments to user messages when messages payload is provided', async () => {
    process.env.OPENAI_API_KEY = 'test-key';
    process.env.ASUNDER_LLM_PROMPT_ID = 'env-prompt';

    const fetchMock = jest
      .fn()
      .mockResolvedValue(new Response('{}', { status: 200 }));
    global.fetch = fetchMock as typeof fetch;

    const service = new LlmBridgeService();

    await service.forward(
      {
        messages: [
          { role: 'system', content: 'You are helpful.' },
          { role: 'user', content: 'Explain the attached markdown' },
        ],
        attachments: [
          {
            name: 'notes.md',
            file_data: 'data:text/plain;base64,IyBIZWxsbw==',
          },
        ],
      },
      'trace-md',
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    const upstreamBody = JSON.parse(String(options.body));

    expect(upstreamBody.input).toEqual([
      {
        role: 'system',
        content: [{ type: 'input_text', text: 'You are helpful.' }],
      },
      {
        role: 'user',
        content: [
          { type: 'input_text', text: 'Explain the attached markdown' },
          {
            type: 'input_file',
            filename: 'notes.md',
            file_data: 'data:text/plain;base64,IyBIZWxsbw==',
          },
        ],
      },
    ]);
  });

  it('normalizes path attachments into data URLs', async () => {
    process.env.OPENAI_API_KEY = 'test-key';
    const fetchMock = jest
      .fn()
      .mockResolvedValue(new Response('{}', { status: 200 }));
    global.fetch = fetchMock as typeof fetch;
    const fixturePath = '/tmp/kia-server-llm-bridge-notes.md';
    await fs.writeFile(fixturePath, 'hello path');

    const service = new LlmBridgeService();

    await service.forward(
      {
        input: 'Summarize from path',
        attachments: [{ name: 'notes.md', path: fixturePath }],
      },
      'trace-path',
    );

    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    const upstreamBody = JSON.parse(String(options.body));
    expect(upstreamBody.input).toEqual([
      {
        role: 'user',
        content: [
          { type: 'input_text', text: 'Summarize from path' },
          {
            type: 'input_file',
            filename: 'notes.md',
            file_data: `data:text/plain;base64,${Buffer.from('hello path').toString('base64')}`,
          },
        ],
      },
    ]);
  });

  it('rejects malformed attachment data URLs', async () => {
    process.env.OPENAI_API_KEY = 'test-key';

    const service = new LlmBridgeService();

    await expect(
      service.forward(
        {
          input: 'Explain attached document',
          attachments: [
            {
              name: 'report.txt',
              file_data: 'hello',
            },
          ],
        },
        'trace-upload-fail',
      ),
    ).rejects.toMatchObject({
      statusCode: 400,
      message:
        'attachments.file_data must be a valid data URL like data:text/plain;base64,SGVsbG8=',
    });
  });

  it('rejects unsupported attachment MIME types', async () => {
    process.env.OPENAI_API_KEY = 'test-key';

    const service = new LlmBridgeService();

    await expect(
      service.forward(
        {
          input: 'Explain attached document',
          attachments: [
            {
              name: 'report.bin',
              file_data: 'data:application/octet-stream;base64,aGVsbG8=',
            },
          ],
        },
        'trace-unsupported-mime',
      ),
    ).rejects.toMatchObject({
      statusCode: 400,
      message: 'Unsupported attachment MIME type: application/octet-stream',
    });
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
