import 'dotenv/config'
import redis from './src/lib/redis'
import { getLeaderboard } from './src/services/leaderboard.service'

async function run() {
  try {
    const emojis = await getLeaderboard('emojis')
    console.log('Emojis Leaderboard:', emojis)

    const global = await getLeaderboard('global')
    console.log('Global Leaderboard:', global)
  } catch (e) {
    console.error(e)
  } finally {
    redis.quit()
  }
}

run()
