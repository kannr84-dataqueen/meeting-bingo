export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[‘’]/g, "'") // curly single quotes → straight
    .replace(/[“”]/g, '"') // curly double quotes → straight
}

export const WORD_ALIASES: Record<string, string[]> = {
  'CI/CD': ['ci cd', 'ci slash cd', 'continuous integration', 'continuous deployment', 'continuous delivery'],
  'MVP': ['minimum viable product', 'mvp'],
  'API': ['a p i', 'application programming interface'],
  'KPI': ['k p i', 'key performance indicator'],
  'SDK': ['s d k', 'software development kit'],
  'CDN': ['c d n', 'content delivery network'],
  'REST': ['restful', 'representational state transfer'],
  'GraphQL': ['graph ql', 'graphql'],
  'DevOps': ['dev ops'],
  'SLA': ['s l a', 'service level agreement'],
}

function isPhrase(word: string): boolean {
  return word.includes(' ') || word.includes('-')
}

function matchesTranscript(normalized: string, normalizedWord: string): boolean {
  if (isPhrase(normalizedWord)) {
    return normalized.includes(normalizedWord)
  }
  const pattern = new RegExp(`\\b${escapeRegex(normalizedWord)}\\b`)
  return pattern.test(normalized)
}

export function detectWords(
  transcript: string,
  cardWords: string[],
  alreadyFilled: string[]
): string[] {
  const normalizedTranscript = normalizeText(transcript)
  const alreadySet = new Set(alreadyFilled.map((w) => w.toLowerCase()))
  const matched: string[] = []

  for (const word of cardWords) {
    if (alreadySet.has(word.toLowerCase())) continue
    const normalizedWord = normalizeText(word)
    if (matchesTranscript(normalizedTranscript, normalizedWord)) {
      matched.push(word)
    }
  }

  return matched
}

export function detectWordsWithAliases(
  transcript: string,
  cardWords: string[],
  alreadyFilled: string[]
): string[] {
  const direct = detectWords(transcript, cardWords, alreadyFilled)
  const matchedSet = new Set(direct.map((w) => w.toLowerCase()))

  const normalizedTranscript = normalizeText(transcript)
  const alreadySet = new Set(alreadyFilled.map((w) => w.toLowerCase()))

  for (const word of cardWords) {
    if (alreadySet.has(word.toLowerCase())) continue
    if (matchedSet.has(word.toLowerCase())) continue

    const aliases = WORD_ALIASES[word]
    if (!aliases) continue

    for (const alias of aliases) {
      if (matchesTranscript(normalizedTranscript, normalizeText(alias))) {
        direct.push(word)
        matchedSet.add(word.toLowerCase())
        break
      }
    }
  }

  return direct
}
