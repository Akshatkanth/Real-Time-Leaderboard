import prisma from '../lib/prisma'
import redis from '../lib/redis'

interface TextScores {
  total_characters: number
  uppercase: number
  emojis: number
  special_characters: number
}

const CATEGORY_DEFINITIONS: Array<{
  name: keyof TextScores
  description: string
}> = [
  {
    name: 'total_characters',
    description: 'Total number of characters in the submitted text'
  },
  {
    name: 'uppercase',
    description: 'Total number of uppercase letters in the submitted text'
  },
  {
    name: 'emojis',
    description: 'Total number of emojis in the submitted text'
  },
  {
    name: 'special_characters',
    description: 'Total number of special characters in the submitted text'
  }
]

const ensureCategories = async () => {
  await Promise.all(
    CATEGORY_DEFINITIONS.map((category) =>
      prisma.category.upsert({
        where: { name: category.name },
        update: {},
        create: category
      })
    )
  )
}

const analyzeText = (text: string): TextScores => {
  const emojiRegex = /\p{Emoji_Presentation}|\p{Extended_Pictographic}/gu
  const specialCharRegex = /[^a-zA-Z0-9\s\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu

  const total_characters = text.length
  const uppercase = (text.match(/[A-Z]/g) || []).length
  const emojis = (text.match(emojiRegex) || []).length
  const special_characters = (text.match(specialCharRegex) || []).length

  return { total_characters, uppercase, emojis, special_characters }
}

export const submitScore = async (userId: string, text: string) => {
  const scores = analyzeText(text)

  await ensureCategories()

  const categories = await prisma.category.findMany()

  const scoreData = categories.map(category => ({
    userId,
    categoryId: category.id,
    value: scores[category.name as keyof TextScores]
  }))

  await prisma.score.createMany({
    data: scoreData
  })

  for (const category of categories) {
    const score = scores[category.name as keyof TextScores]
    await redis.zincrby(`leaderboard:${category.name}`, score, userId)
  }

  const globalScore = Object.values(scores).reduce((sum, s) => sum + s, 0)
  await redis.zincrby('leaderboard:global', globalScore, userId) //accumulation

  return scores
}