import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../src/api/apiClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  }
}))

import apiClient from '../src/api/apiClient'
import { gamificationFacade } from '../src/services/gamificationFacade'
import { getXPSourceConfig } from '../src/config/xpSources'

describe('gamificationFacade edge cases: cooldown, dailyLimit, levelUp', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    gamificationFacade.clearHistory()
    ;(apiClient.get as unknown as vi.Mock).mockImplementation((url: string) => {
      if (url.includes('/gamification/level')) {
        return Promise.resolve({ data: { level: 1, currentXP: 0, requiredXP: 100, totalXP: 0 } })
      }
      if (url.includes('/gamification/multipliers')) {
        return Promise.resolve({ data: {} })
      }
      return Promise.resolve({ data: {} })
    })
    ;(apiClient.post as unknown as vi.Mock).mockResolvedValue({ data: { success: true } })
  })

  it('enforces cooldown between same actions', async () => {
    const user = 'cooldown-user'
    const source = 'gps_track_recorded' as const

    const res1 = await gamificationFacade.addXP({ userId: user, source, amount: 10 })
    expect(res1.success).toBe(true)

    // immediate second attempt should be blocked by cooldown
    const res2 = await gamificationFacade.addXP({ userId: user, source, amount: 10 })
    expect(res2.success).toBe(false)
    expect(res2.reason).toBe('cooldown')
  })

  it('enforces dailyLimit after repeated actions', async () => {
    const user = 'limit-user'
    const source = 'gps_track_recorded' as const
    const cfg = getXPSourceConfig(source)
    const limit = cfg.dailyLimit || 5

    // perform `limit` successful actions; after each call, move lastActionTime backwards to avoid cooldown
    for (let i = 0; i < limit; i++) {
      const r = await gamificationFacade.addXP({ userId: user, source, amount: 10 })
      expect(r.success).toBe(true)
      // make last action time appear older than cooldown so next call is allowed
      const userMap = (gamificationFacade as any).lastActionTime.get(user)
      if (userMap) {
        const cooldown = (cfg.cooldown || 0) * 1000
        userMap.set(source, Date.now() - cooldown - 1000)
      }
    }

    // next attempt should exceed daily limit
    const over = await gamificationFacade.addXP({ userId: user, source, amount: 10 })
    expect(over.success).toBe(false)
    expect(over.reason).toBe('limit_exceeded')
  })

  it('returns levelUp when XP pushes user over requiredXP', async () => {
    const user = 'levelup-user'
    const source = 'gps_track_recorded' as const

    // mock current user level close to threshold
    ;(apiClient.get as unknown as vi.Mock).mockImplementation((url: string) => {
      if (url.includes('/gamification/level')) {
        return Promise.resolve({ data: { level: 2, currentXP: 95, requiredXP: 100, totalXP: 195 } })
      }
      if (url.includes('/gamification/multipliers')) {
        return Promise.resolve({ data: {} })
      }
      return Promise.resolve({ data: {} })
    })

    const res = await gamificationFacade.addXP({ userId: user, source, amount: 10 })
    expect(res.success).toBe(true)
    expect(res.levelUp).toBe(true)
    expect(res.newLevel).toBeGreaterThanOrEqual(3)
  })
})
