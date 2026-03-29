import { inferMimeFromFilename } from './attachment.util';

describe('attachment.util', () => {
  it('infers the expected MIME types for supported extensions', () => {
    expect(inferMimeFromFilename('payload.json')).toBe('application/json');
    expect(inferMimeFromFilename('notes.md')).toBe('text/markdown');
    expect(inferMimeFromFilename('notes.txt')).toBe('text/plain');
    expect(inferMimeFromFilename('feed.xml')).toBe('application/xml');
    expect(inferMimeFromFilename('report.pdf')).toBe('application/pdf');
  });
});
