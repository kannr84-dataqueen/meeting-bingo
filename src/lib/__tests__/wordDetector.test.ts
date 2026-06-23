import { describe, it, expect } from 'vitest'
import {
  escapeRegex,
  normalizeText,
  detectWords,
  detectWordsWithAliases,
} from '../wordDetector'

describe('escapeRegex', () => {
  it('escapes special regex characters so the result is safe to use in new RegExp()', () => {
    const escaped = escapeRegex('C++')
    expect(() => new RegExp(`\\b${escaped}\\b`)).not.toThrow()
    expect(escaped).toBe('C\\+\\+')
  })
})

describe('normalizeText', () => {
  it('lowercases input', () => {
    expect(normalizeText('SYNERGY')).toBe('synergy')
  })

  it('normalizes curly apostrophes to straight', () => {
    expect(normalizeText('it’s')).toBe("it's")
  })
})

describe('detectWords', () => {
  const cardWords = ['pivot', 'circle back', 'synergy', 'retro', 'sprint']

  it('matches a single word in transcript', () => {
    expect(detectWords("let's pivot here", cardWords, [])).toContain('pivot')
  })

  it('matches a multi-word phrase', () => {
    expect(detectWords('we need to circle back on this', cardWords, [])).toContain('circle back')
  })

  it('is case-insensitive', () => {
    expect(detectWords('SYNERGY is important', cardWords, [])).toContain('synergy')
  })

  it('does not match a partial word (retro should not match retrospective)', () => {
    expect(detectWords('retrospective', cardWords, [])).not.toContain('retro')
  })

  it('skips words in alreadyFilled', () => {
    expect(detectWords('pivot and sprint', cardWords, ['pivot'])).not.toContain('pivot')
    expect(detectWords('pivot and sprint', cardWords, ['pivot'])).toContain('sprint')
  })

  it('returns all matched words from transcript', () => {
    const matches = detectWords('synergy pivot sprint', cardWords, [])
    expect(matches).toContain('synergy')
    expect(matches).toContain('pivot')
    expect(matches).toContain('sprint')
  })

  it('returns empty array for empty transcript', () => {
    expect(detectWords('', cardWords, [])).toHaveLength(0)
  })
})

describe('detectWordsWithAliases', () => {
  const cardWords = ['CI/CD', 'MVP', 'API', 'KPI', 'sprint']

  it('matches CI/CD via alias "continuous integration"', () => {
    expect(detectWordsWithAliases('we do continuous integration here', cardWords, [])).toContain('CI/CD')
  })

  it('matches MVP via alias "minimum viable product"', () => {
    expect(detectWordsWithAliases('ship the minimum viable product', cardWords, [])).toContain('MVP')
  })

  it('does not duplicate a word matched by both direct and alias', () => {
    const results = detectWordsWithAliases('sprint', cardWords, [])
    const count = results.filter((w) => w === 'sprint').length
    expect(count).toBe(1)
  })

  it('still respects alreadyFilled for alias matches', () => {
    expect(detectWordsWithAliases('continuous integration', cardWords, ['CI/CD'])).not.toContain('CI/CD')
  })
})
