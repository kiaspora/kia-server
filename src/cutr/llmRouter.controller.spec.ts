import { LlmRouterController } from './llmRouter.controller';
import { LlmRouterService } from './llmRouter.service';

function createResponseMock() {
  return {
    setHeader: jest.fn(),
    status: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
  };
}

describe('LlmRouterController', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns OPTIONS preflight with trace id', async () => {
    const controller = new LlmRouterController({} as LlmRouterService);
    const req = {
      header: jest.fn().mockReturnValue('trace-options-001'),
    };
    const res = createResponseMock();

    await controller.options(req as any, res as any);

    expect(res.setHeader).toHaveBeenCalledWith('x-trace-id', 'trace-options-001');
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.set).toHaveBeenCalledWith(
      expect.objectContaining({ Allow: 'POST, OPTIONS' }),
    );
  });

  it('delegates multipart requests through parseMultipart and handle', async () => {
    const parseMultipart = jest.fn().mockResolvedValue({
      body: {
        provider: 'openai',
        stream: false,
        archetype: 'Analyst',
        messages: [{ role: 'user', content: 'Summarize the file' }],
      },
      attachments: [
        {
          filename: 'notes.md',
          mimeType: 'text/markdown',
          buffer: Buffer.from('# Notes'),
          size: 7,
        },
      ],
    });
    const handle = jest.fn().mockResolvedValue({
      content: 'summary',
      provider: 'openai',
    });
    const controller = new LlmRouterController({
      parseMultipart,
      handle,
    } as unknown as LlmRouterService);
    const req = {
      headers: {
        'content-type': 'multipart/form-data; boundary=abc123',
      },
      header: jest.fn().mockReturnValue('trace-multipart-001'),
    };
    const res = createResponseMock();

    await controller.llmRouter(req as any, res as any);

    expect(parseMultipart).toHaveBeenCalledWith(req, 'trace-multipart-001');
    expect(handle).toHaveBeenCalledWith(
      {
        provider: 'openai',
        stream: false,
        archetype: 'Analyst',
        messages: [{ role: 'user', content: 'Summarize the file' }],
      },
      'trace-multipart-001',
      [
        {
          filename: 'notes.md',
          mimeType: 'text/markdown',
          buffer: Buffer.from('# Notes'),
          size: 7,
        },
      ],
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('returns 415 for unsupported content types', async () => {
    const controller = new LlmRouterController({
      handle: jest.fn(),
    } as unknown as LlmRouterService);
    const req = {
      body: {},
      headers: {
        'content-type': 'text/plain',
      },
      header: jest.fn().mockReturnValue('trace-unsupported-001'),
    };
    const res = createResponseMock();

    await controller.llmRouter(req as any, res as any);

    expect(res.status).toHaveBeenCalledWith(415);
    expect(res.send).toHaveBeenCalledWith(
      expect.stringContaining('Unsupported media type'),
    );
  });
});
