import { GoogleGenerativeAI } from '@google/generative-ai';

export const PUBLIC_HR_TOPICS = [
  {
    id: 'labour-codes',
    label: 'India labour codes: what changed?',
    question: 'What are India’s four central Labour Codes, and what should an employer verify before applying them?',
    context:
      'The Ministry of Labour and Employment announced that the Code on Wages, 2019; Industrial Relations Code, 2020; Code on Social Security, 2020; and Occupational Safety, Health and Working Conditions Code, 2020 took effect on 21 November 2025. Application to a particular employer or worker depends on definitions, establishment facts, appropriate government, applicable rules, notifications, amendments, and court decisions. Do not assume a single rule applies to every business or worker.',
    summary:
      'The four central Labour Codes took effect on 21 November 2025. Which provisions apply depends on the employer, establishment, worker category, applicable government rules, and later legal updates.',
    findings: [
      'Code on Wages, 2019',
      'Industrial Relations Code, 2020',
      'Code on Social Security, 2020',
      'Occupational Safety, Health and Working Conditions Code, 2020',
      'Check current central and state rules before applying a provision to a specific workplace.',
    ],
    sources: [
      {
        title: 'Ministry of Labour and Employment: Labour Codes effective 21 November 2025',
        url: 'https://labour.gov.in/sites/default/files/pib2209767.pdf',
      },
      {
        title: 'Ministry of Labour and Employment: Labour Codes and rules',
        url: 'https://www.labour.gov.in/offerings/schemes-and-services/details/labour-codes-2-ATO5YzMtQWa?archives=true',
      },
    ],
  },
  {
    id: 'grievance-committee',
    label: 'When is a statutory grievance committee required?',
    question: 'What does section 4 of India’s Industrial Relations Code say about grievance redressal committees?',
    context:
      'Section 4 of the Industrial Relations Code, 2020 provides that every industrial establishment employing twenty or more workers shall have one or more Grievance Redressal Committees for resolution of disputes arising out of individual grievances. It provides for equal employer and worker representation and adequate representation of women workers. Applicability depends on the statutory meanings of industrial establishment and worker and the facts and applicable rules. A statutory GRC is not the same as every internal feedback channel. POSH matters and urgent safety concerns need their appropriate specialized processes.',
    summary:
      'Section 4 provides for one or more Grievance Redressal Committees in an industrial establishment with 20 or more workers for qualifying individual grievances. Verify statutory definitions and applicable rules for the specific workplace.',
    findings: [
      'Industrial Relations Code, 2020, section 4',
      'Threshold stated in section 4: 20 or more workers in an industrial establishment',
      'Equal employer and worker representation is provided for.',
      'Check applicable rules and establishment facts; do not route POSH complaints or safety emergencies into a generic workflow by default.',
    ],
    sources: [
      {
        title: 'India Code: Industrial Relations Code, 2020 (section 4)',
        url: 'https://www.indiacode.nic.in/bitstream/123456789/22040/1/A2020-35.pdf',
      },
    ],
  },
  {
    id: 'posh-confidentiality',
    label: 'How should POSH information be handled?',
    question: 'What confidentiality safeguard does section 16 of India’s POSH Act establish?',
    context:
      'The Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act, 2013 establishes a dedicated complaint and inquiry framework. Section 16 restricts publication or making known the contents of a complaint, the identity and addresses of parties and witnesses, and information about inquiry proceedings and recommendations, subject to the Act. Keep allegations, evidence, identities, committee deliberations, and inquiry records restricted to authorized people. A general HR assistant must not investigate, assess credibility, make findings, or expose case details to an unrelated AI provider. Use the statutory committee process and qualified advice for a specific matter.',
    summary:
      'Section 16 restricts disclosure of complaint contents, party and witness identities, and inquiry information. Keep POSH materials within the proper authorized process; this demo is not a POSH case system.',
    findings: [
      'POSH Act, 2013, section 16',
      'The Act has a dedicated complaint and inquiry framework.',
      'Do not put allegations, evidence, names, or inquiry records into a general-purpose HR assistant.',
      'Use the statutory committee process for case handling.',
    ],
    sources: [
      {
        title: 'India Code: POSH Act, 2013',
        url: 'https://www.indiacode.nic.in/handle/123456789/17057',
      },
    ],
  },
  {
    id: 'privacy-and-ai',
    label: 'What should HR keep out of AI prompts?',
    question: 'What privacy safeguards should HR apply before using an AI assistant?',
    context:
      'Product safeguards: minimize personal data; do not send employee names, IDs, contact details, health details, payroll records, grievance narratives, POSH records, or investigation evidence to a general AI provider; use a reviewed redaction and data-handling process before any sensitive AI use; explain purpose and provider; use least-privilege access and retention/deletion controls; keep outputs advisory and human-reviewed. These are prudent product safeguards, not a complete statement of legal obligations. For legal obligations, check the current Digital Personal Data Protection Act, Rules, commencement notifications, and corrigenda from MeitY.',
    summary:
      'Keep identifiable employee and case information out of general AI prompts. Use minimization, reviewed redaction, access controls, and defined retention before processing sensitive HR data. This is product guidance, not a legal opinion.',
    findings: [
      'Do not include names, identifiers, health or payroll details, grievance text, or POSH/investigation records.',
      'Apply reviewed redaction before any sensitive AI processing.',
      'Use least-privilege access and clear retention and deletion rules.',
      'Check current official legal texts and effective dates for compliance decisions.',
    ],
    sources: [
      {
        title: 'MeitY: Digital Personal Data Protection Rules, 2025 and official documents',
        url: 'https://www.meity.gov.in/documents/act-and-policies/digital-personal-data-protection-rules-2025-gDOxUjMtQWa',
      },
      {
        title: 'MeitY: Digital Personal Data Protection Act, 2023',
        url: 'https://www.meity.gov.in/static/uploads/2024/06/2bf1f0e9f04e6fb4f8fef35e82c42aa5.pdf',
      },
    ],
  },
] as const;

export type PublicHRTopicId = (typeof PUBLIC_HR_TOPICS)[number]['id'];

const PUBLIC_SOURCE_DISCLAIMER =
  'General information from selected public sources, not legal advice. Verify current law, applicable state rules, and workplace facts with qualified counsel. This answer is not based on employee or grievance records.';

export async function answerPublicHRTopic(topicId: string) {
  const topic = PUBLIC_HR_TOPICS.find((item) => item.id === topicId);
  if (!topic) return null;

  let answer = topic.summary;
  let model = 'curated-public-source-fallback';
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const modelClient = genAI.getGenerativeModel({
        model: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
        generationConfig: { temperature: 0.1, maxOutputTokens: 500 },
      });
      const result = await modelClient.generateContent(`You are an HR information assistant. Answer the selected general question using ONLY the public-source notes below. Do not invent law, applicability, dates, deadlines, or procedures. State uncertainty and ask the reader to verify current official sources when the notes do not establish an answer. Never make a finding about a person or recommend an employment decision. Do not ask for employee or case information. Keep the answer concise and end with a reminder that it is general information, not legal advice.\n\nQUESTION: ${topic.question}\n\nPUBLIC-SOURCE NOTES:\n${topic.context}`);
      const generated = result.response.text().trim();
      if (generated) {
        answer = generated;
        model = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
      }
    } catch (error) {
      console.error('[Public HR knowledge generation failed]', error instanceof Error ? error.name : 'unknown');
    }
  }

  return {
    topicId: topic.id,
    question: topic.question,
    answer,
    keyFindings: [...topic.findings],
    sources: [...topic.sources],
    disclaimer: PUBLIC_SOURCE_DISCLAIMER,
    model,
  };
}
