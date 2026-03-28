import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../lib/prisma'
import { RegisterInput, LoginInput, JwtPayload} from '../types'

export const registerUser = async (input:RegisterInput) => {
    const {username, email, password} = input;

    const existingUser = await prisma.user.findFirst({
        where:{
            OR:[{email}, {username}]
        }
    })

    if(existingUser){
        throw new Error('User with this email or username already exists')
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            username, 
            email,
            password: hashedPassword
        },
        select: {
            id: true,
            username: true,
            email: true,
            createdAt: true
        }
    })

    return user
}

export const loginUser = async (input: LoginInput) => {
  const { email, password } = input

  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user) {
    throw new Error('Invalid credentials')
  }

  const isPasswordValid = await bcrypt.compare(password, user.password)

  if (!isPasswordValid) {
    throw new Error('Invalid credentials')
  }

  const payload: JwtPayload = {
    userId: user.id,
    email: user.email
  }

  const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: '7d'
  })

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email
    }
  }
}