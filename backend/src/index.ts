import express from 'express'
import { User } from './models/user.model'
import {Connection, Keypair, Transaction} from '@solana/web3.js'
import mongoose from 'mongoose'
import bs58 from 'bs58'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import cors from 'cors'
const app = express()

dotenv.config()

app.use(express.json())
app.use(cors())

const connectToDb = async()=>{
    try {
        
        await mongoose.connect("mongodb://localhost:27017/bonkbot")
    } catch (error) {
        console.log("Error while connecting to DB", error)
        process.exit(0)
    }
}


app.post("/signup", async(req, res)=>{
    console.log(req.body)
    try {
        const {email, password} = req.body
        const existingAccount = await User.findOne({email})
        if(existingAccount){
            res.status(400).json({
                message:"User already exists with this email"
            })
            return
        } 
        const newAccount = new Keypair()
        const secretKeyInBase58 = bs58.encode(newAccount.secretKey)
        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await User.create({
            email,
            password: hashedPassword,
            privateKey: secretKeyInBase58,
            publicKey: newAccount.publicKey
        })
    
        res.status(201).json({
            message: "User created successfully",
            publicKey: newAccount.publicKey
        })
        return
    } catch (error) {
        console.log("Error while adding the user", error)
        res.status(500).json({
            message:"Internal Server error"
        })
    }
})


app.post("/signin", async(req, res)=>{
    try {
        const {email, password} = req.body
        const user = await User.findOne({email})
        if(!user){
            res.status(404).json({
                message:"User not found"
            })
            return
        }
        const passwordCorrect = await bcrypt.compare(password, user.password)
        if(!passwordCorrect){
            res.status(401).json({
                message:"Invalid password"
            })
            return
        }
        else{
            const token = jwt.sign({_id:user._id}, process.env.JWT_SECRET!, {expiresIn:"1h"})
            res.status(200).json({
                message:"User signed in successfully",
                publicKey: user.publicKey,
                token,
                user:{
                    email: user.email,
                    _id: user._id
                }
            })
        }
    } catch (error) {
        console.log("Error while signing in", error)
        res.status(500).json({
            message:"Internal Server error"
        })
    }   
})

app.post("/sign-txn", async(req, res)=>{
    const {serializedTxn} = req.body
    const connection = new Connection("https://api.devnet.solana.com")
    const transaction = Transaction.from(Buffer.from(serializedTxn, "base64"))
    const signer = Keypair.fromSecretKey(bs58.decode(process.env.PRIVATE_KEY!)) // TODO:user.privateKey 
    const signature = await connection.sendTransaction(transaction,[signer],{
        skipPreflight: true,
        maxRetries: 3
    })
    res.status(200).json({
        message:"Transaction signed successfully",
        signature
    })
})
app.listen(3000, async()=>{
    await connectToDb()
    console.log("Server running on port 3000")
})