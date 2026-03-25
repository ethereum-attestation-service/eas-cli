import { describe, it, expect } from 'vitest';
import { resolveInput } from '../stdin.js';

describe('resolveInput', () => {
  it('returns value as-is when not "-"', async () => {
    const result = await resolveInput('some data');
    expect(result).toBe('some data');
  });

  it('returns JSON string as-is when not "-"', async () => {
    const json = '[{"name":"score","type":"uint256","value":"100"}]';
    const result = await resolveInput(json);
    expect(result).toBe(json);
  });
});
