import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mocks for apiClient used by gamificationFacade (default export)
vi.mock('../src/api/apiClient', () => {
  return {
    default: {
      get: vi.fn(),
      post: vi.fn(),
    },
  }
})

import apiClient from '../src/api/apiClient'
import { gamificationFacade } from '../src/services/gamificationFacade'

describe('Gamification API integration (mocked)', () => {
  const userId = 'user-42'

  beforeEach(() => {
    vi.clearAllMocks()
    // default mocks for level and multipliers
    ;(apiClient.get as unknown as vi.Mock).mockImplementation((url: string) => {
      if (url.includes('/gamification/level')) {
        return Promise.resolve({ data: { level: 1, currentXP: 10, requiredXP: 100, totalXP: 10 } })
      }
      if (url.includes('/gamification/multipliers')) {
        return Promise.resolve({ data: { multipliers: {} } })
      }
      return Promise.resolve({ data: {} })
    })
  })

  it('sends expected payload to POST /gamification/xp and returns success', async () => {
    const postMock = apiClient.post as unknown as vi.Mock
    postMock.mockResolvedValue({ data: { success: true, totalXP: 100 } })

    const res = await gamificationFacade.addXP({
      userId,
      source: 'gps_track_recorded',
      amount: 50,
      contentId: 'route-1',
      contentType: 'route',
      metadata: { distance: 1200 },
    })

    expect(postMock).toHaveBeenCalled()
    const [url, payload] = postMock.mock.calls[0]
    expect(url).toBe('/gamification/xp')
    expect(payload).toEqual(expect.objectContaining({ userId, source: 'gps_track_recorded', amount: 50 }))
    expect(payload.metadata).toEqual(expect.objectContaining({ distance: 1200 }))

    expect(res).toHaveProperty('success', true)
  })

  it('handles server error on POST gracefully', async () => {
    const postMock = apiClient.post as unknown as vi.Mock
    postMock.mockRejectedValue(new Error('server error'))

    const res = await gamificationFacade.addXP({
      userId,
      source: 'gps_track_recorded',
      amount: 10,
    })

    expect(res).toHaveProperty('success', false)
    expect(res).toHaveProperty('reason')
  })
})
