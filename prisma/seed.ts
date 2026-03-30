import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const categories = [
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

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category
    })
  }

  console.log('Categories seeded successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })