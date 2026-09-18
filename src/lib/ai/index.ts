// PEOPLEPULSE AI — AI Provider Factory

import { AIAssistantProvider } from './provider';
import { GeminiAIProvider } from './gemini-provider';
import { MockAIProvider } from './mock-provider';

let cachedProvider: AIAssistantProvider | null = null;

export function getAIProvider(): AIAssistantProvider {
  if (cachedProvider) {
    return cachedProvider;
  }

  const providerType = process.env.AI_PROVIDER || (process.env.GEMINI_API_KEY ? 'gemini' : 'mock');

  if (providerType === 'gemini' && process.env.GEMINI_API_KEY) {
    cachedProvider = new GeminiAIProvider(process.env.GEMINI_API_KEY);
  } else {
    cachedProvider = new MockAIProvider();
  }

  return cachedProvider;
}

export * from './provider';
export * from './safety-screener';
