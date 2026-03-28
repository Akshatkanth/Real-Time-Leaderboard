export interface RegisterInput { //describing shape of the object using interface keyword
  username: string
  email: string
  password: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface JwtPayload {
  userId: string
  email: string
}

//i can export the whole folder