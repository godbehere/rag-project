import { parseTXT } from '../src/parsers/txtParser';
import fs from 'fs';
describe('parseTXT', () => {
  it('should read text from a file', async () => {
    const testPath = './test/test.txt';
    fs.writeFileSync(testPath, 'hello world');
    const text = await parseTXT(testPath);
    expect(text).toBe('hello world');
    fs.unlinkSync(testPath);
  });
});
