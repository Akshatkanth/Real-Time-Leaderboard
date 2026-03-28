//classic way of writing auth in js,
//i am comparing this to auth.service.ts in src/services
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

async function registerUser(input) {
  const { username, email, password } = input;

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { username }]
    }
  });

  if (existingUser) {
    throw new Error('User with this email or username already exists');
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
  });

  return user;
}

async function loginUser(input) {
  const { email, password } = input;

  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }

  const payload = {
    userId: user.id,
    email: user.email
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email
    }
  };
}

module.exports = {
  registerUser,
  loginUser
};