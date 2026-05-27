import redis from '../lib/redis'
import prisma from '../lib/prisma'

const VALID_CATEGORIES = [
  'total_characters',
  'uppercase',
  'emojis',
  'special_characters',
  'global'
]

const CATEGORY_NAMES = [
  'total_characters',
  'uppercase',
  'emojis',
  'special_characters'
] as const

const ensureCategories = async () => {
  await Promise.all(
    CATEGORY_NAMES.map((name) =>
      prisma.category.upsert({
        where: { name },
        update: {},
        create: {
          name,
          description: `Total number of ${name.replace(/_/g, ' ')} in the submitted text`
        }
      })
    )
  )
}

export const rebuildLeaderboards = async () => {
  await ensureCategories()

  const categories = await prisma.category.findMany()
  const categoryById = new Map(categories.map((category) => [category.id, category.name]))

  await redis.del(...VALID_CATEGORIES.map((category) => `leaderboard:${category}`))

  const categoryScores = await prisma.score.groupBy({
    by: ['categoryId', 'userId'],
    _sum: { value: true }
  })

  const categoryEntries = categoryScores.filter((entry) => {
    const categoryName = categoryById.get(entry.categoryId)
    return !!categoryName && categoryName !== 'global'
  })

  await Promise.all(
    categoryEntries.map(async (entry) => {
      const categoryName = categoryById.get(entry.categoryId)
      if (!categoryName) {
        return
      }

      const score = entry._sum.value || 0
      await redis.zincrby(`leaderboard:${categoryName}`, score, entry.userId)
    })
  )

  const globalScores = await prisma.score.groupBy({
    by: ['userId'],
    _sum: { value: true }
  })

  await Promise.all(
    globalScores.map(async (entry) => {
      const score = entry._sum.value || 0
      await redis.zincrby('leaderboard:global', score, entry.userId)
    })
  )
}

export const getLeaderboard = async (category: string) => {
  if (!VALID_CATEGORIES.includes(category)) {
    throw new Error(`Invalid category. Valid categories are: ${VALID_CATEGORIES.join(', ')}`)
  }

  const key = `leaderboard:${category}`
  const results = await redis.zrevrange(key, 0, 9, 'WITHSCORES')

  const leaderboard = []
  for (let i = 0; i < results.length; i += 2) {
    const userId = results[i]
    const score = parseInt(results[i + 1])

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { username: true }
    })

    leaderboard.push({
      rank: i / 2 + 1,
      username: user?.username || 'Unknown',
      score
    })
  }

  return leaderboard
}

export const getUserRank = async (userId: string, category: string) => {
  if (!VALID_CATEGORIES.includes(category)) {
    throw new Error(`Invalid category. Valid categories are: ${VALID_CATEGORIES.join(', ')}`)
  }

  const key = `leaderboard:${category}`

  const rank = await redis.zrevrank(key, userId)
  const score = await redis.zscore(key, userId)

  if (rank === null || score === null) {
    throw new Error('You have not submitted any scores yet')
  }

  return {
    rank: rank + 1,
    score: parseInt(score),
    category
  }
}

export const getReport = async (period: string) => {
  const periodMap: Record<string, number> = {
    '7d': 7,
    '30d': 30,
    '1y': 365
  }

  const days = periodMap[period]
  if (!days) {
    throw new Error('Invalid period. Use: 7d, 30d, or 1y')
  }

  const since = new Date()
  since.setDate(since.getDate() - days)

  const categories = await prisma.category.findMany()

  const report = await Promise.all(
    categories.map(async (category) => {
      const topPlayers = await prisma.score.groupBy({
        by: ['userId'],
        where: {
          categoryId: category.id,
          createdAt: { gte: since }
        },
        _sum: { value: true },
        orderBy: { _sum: { value: 'desc' } },
        take: 5
      })

      const enriched = await Promise.all(
        topPlayers.map(async (entry, index) => {
          const user = await prisma.user.findUnique({
            where: { id: entry.userId },
            select: { username: true }
          })
          return {
            rank: index + 1,
            username: user?.username || 'Unknown',
            score: entry._sum.value || 0
          }
        })
      )

      return {
        category: category.name,
        period,
        topPlayers: enriched
      }
    })
  )

  return report
}