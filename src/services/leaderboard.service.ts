import redis from '../lib/redis'
import prisma from '../lib/prisma'

const VALID_CATEGORIES = [
  'total_characters',
  'uppercase',
  'emojis',
  'special_characters',
  'global'
]

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