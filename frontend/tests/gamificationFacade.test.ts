import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock apiClient used inside gamificationFacade
vi.mock('../src/api/apiClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  }
}))

import apiClient from '../src/api/apiClient'
import { gamificationFacade } from '../src/services/gamificationFacade'

describe('gamificationFacade moderation and duplicate checks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    gamificationFacade.clearHistory()
    ;(apiClient.get as unknown as vi.Mock).mockImplementation((url: string) => {
      if (url.includes('/moderation/check')) {
        return Promise.resolve({ data: { approved: false } })
      }
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

  it('returns not_moderated when moderation check fails for moderated source', async () => {
    const res = await gamificationFacade.addXP({
      userId: 'u1',
      source: 'route_created',
      amount: 100,
      contentId: 'r1',
      contentType: 'route'
    })

    expect(res).toHaveProperty('success', false)
    expect(res).toHaveProperty('reason', 'not_moderated')
  })

  it('prevents duplicate actions for same contentId', async () => {
    // First call: mock moderation to be approved for this test
    ;(apiClient.get as unknown as vi.Mock).mockImplementation((url: string) => {
      if (url.includes('/moderation/check')) return Promise.resolve({ data: { approved: true } })
      if (url.includes('/gamification/level')) return Promise.resolve({ data: { level: 1, currentXP: 0, requiredXP: 100, totalXP: 0 } })
      if (url.includes('/gamification/multipliers')) return Promise.resolve({ data: {} })
      return Promise.resolve({ data: {} })
    })

    const p1 = await gamificationFacade.addXP({ userId: 'u2', source: 'route_created', amount: 50, contentId: 'r2', contentType: 'route' })
    expect(p1).toHaveProperty('success', true)

    // Second call with same user/source/contentId should be duplicate
    const p2 = await gamificationFacade.addXP({ userId: 'u2', source: 'route_created', amount: 50, contentId: 'r2', contentType: 'route' })
    expect(p2).toHaveProperty('success', false)
    expect(p2).toHaveProperty('reason', 'duplicate')
  })
})
