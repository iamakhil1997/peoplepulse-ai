import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { answerPublicHRTopic, PUBLIC_HR_TOPICS } from '../src/lib/ai/public-hr-knowledge';

describe('Fixed-topic public HR knowledge assistant', () => {
  beforeEach(() => {
    vi.stubEnv('GEMINI_API_KEY', '');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns a curated answer with official sources when Gemini is not configured', async () => {
    const result = await answerPublicHRTopic('labour-codes');

    expect(result?.topicId).toBe('labour-codes');
    expect(result?.answer).toBeTruthy();
    expect(result?.sources.length).toBeGreaterThan(0);
    expect(result?.disclaimer).toContain('not legal advice');
    expect(result?.model).toBe('curated-public-source-fallback');
  });

  it('rejects arbitrary topic IDs instead of answering free-text prompts', async () => {
    expect(await answerPublicHRTopic('tell me about an employee grievance')).toBeNull();
    expect(PUBLIC_HR_TOPICS.map((topic) => topic.id)).toEqual([
      'labour-codes',
      'grievance-committee',
      'posh-confidentiality',
      'privacy-and-ai',
    ]);
  });
});
