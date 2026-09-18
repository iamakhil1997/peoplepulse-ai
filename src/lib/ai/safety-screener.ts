// PEOPLEPULSE AI — Deterministic Critical Safety & Red-Flag Screener

export interface SafetyScreenResult {
  hasRedFlag: boolean;
  matchedCategories: string[];
  matchedKeywords: string[];
  recommendedSeverity: 'Critical' | 'High' | 'Normal';
  alertNotice?: string;
}

const RED_FLAG_RULES: Array<{
  category: string;
  severity: 'Critical' | 'High';
  regex: RegExp;
  alertNotice: string;
}> = [
  {
    category: 'Self-Harm & Suicide Risk',
    severity: 'Critical',
    regex: /\b(suicid|kill myself|end my life|self-harm|want to die|harm myself|end it all)\b/i,
    alertNotice: 'URGENT: Imminent life safety / self-harm signal detected. Immediate confidential HR intervention and wellness support protocol required.'
  },
  {
    category: 'Physical Violence & Weapons',
    severity: 'Critical',
    regex: /\b(physical assault|hit me|punched|threatened to kill|bring a gun|weapon|beat up|stab|physical violence)\b/i,
    alertNotice: 'CRITICAL SAFETY THREAT: Physical violence or weapon threat reported. Workplace safety and security protocol triggered.'
  },
  {
    category: 'Severe Sexual Harassment / Assault',
    severity: 'Critical',
    regex: /\b(sexual assault|unwanted touching|groped|coerced sex|sexual coercion|indecent exposure|quid pro quo)\b/i,
    alertNotice: 'CRITICAL COMPLIANCE: Severe sexual misconduct / harassment allegation. Immediate confidential legal & HR investigation required.'
  },
  {
    category: 'Illegal Retaliation & Whistleblower Suppression',
    severity: 'High',
    regex: /\b(retaliation|threatened to fire if i report|punished for reporting|blacklisted|silenced)\b/i,
    alertNotice: 'HIGH RISK: Unlawful retaliation / reporting suppression signal detected.'
  },
  {
    category: 'Severe Discrimination & Hostile Environment',
    severity: 'High',
    regex: /\b(racial slur|hate speech|discriminat\w+ against my (race|gender|religion|disability|pregnancy)|hostile environment)\b/i,
    alertNotice: 'HIGH RISK: Protected class discrimination / hostile workplace conduct signal.'
  }
];

/**
 * Screen text deterministically before LLM invocation.
 * This guarantees critical workplace safety signals are never missed.
 */
export function screenForCriticalSafetyFlags(text: string): SafetyScreenResult {
  if (!text || typeof text !== 'string') {
    return {
      hasRedFlag: false,
      matchedCategories: [],
      matchedKeywords: [],
      recommendedSeverity: 'Normal',
    };
  }

  const matchedCategories: string[] = [];
  const matchedKeywords: string[] = [];
  let highestSeverity: 'Critical' | 'High' | 'Normal' = 'Normal';
  const notices: string[] = [];

  for (const rule of RED_FLAG_RULES) {
    const match = text.match(rule.regex);
    if (match) {
      matchedCategories.push(rule.category);
      matchedKeywords.push(match[0]);
      notices.push(rule.alertNotice);
      if (rule.severity === 'Critical') {
        highestSeverity = 'Critical';
      } else if (highestSeverity !== 'Critical' && rule.severity === 'High') {
        highestSeverity = 'High';
      }
    }
  }

  return {
    hasRedFlag: matchedCategories.length > 0,
    matchedCategories,
    matchedKeywords,
    recommendedSeverity: highestSeverity,
    alertNotice: notices.length > 0 ? notices.join(' | ') : undefined,
  };
}
