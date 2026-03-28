//The controller's job is simple — handle the HTTP request, call the service, 
// send back the response. 
// It should have no business logic inside it. Just receive, delegate, respond.

import {Request, Response} from 'express'
import { registerUser, loginUser } from '../services/auth.service'
import { RegisterInput, LoginInput } from '../types'

export const register = async (req:Request, res:Response) => {
    try{
        const input: RegisterInput = req.body
        const user = await registerUser(input)
        res.status(201).json({
            message:'User registered successfully',
            data: user
        })
    }catch(error:any){
        res.status(400).json({
            message:error.message
        })
    }
}

export const login = async(req:Request, res:Response) => {
    try {
        const input: LoginInput = req.body;
        const result = await loginUser(input)
        res.status(200).json({
            message:'Login successful',
            data:result
        })
    } catch (error:any) {
        res.status(400).json({
            message:error.message
        })
    }
}