import express from 'express'
import { User } from './models/user.model'
import {Connection, Keypair, Transaction} from '@solana/web3.js'
import mongoose from 'mongoose'
import bs58 from 'bs58'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import cors from 'cors'
import crypto from 'crypto'
import cookieParser from 'cookie-parser'
const app = express()

dotenv.config()

app.use(express.json())
app.use(cors())
app.use(cookieParser())


const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; 
const KEY = Buffer.from("", 'hex');
const usersToPrivateKeys = new Map<string, string>()




const connectToDb = async()=>{
    try {
        await mongoose.connect("mongodb://localhost:27017/bonkbot")
    } catch (error) {
        console.log("Error while connecting to DB", error)
        process.exit(0)
    }
}

function deriveKeyFromPassword(password: Uint8Array, salt: Buffer) : Promise<Buffer>{
    return new Promise((resolve, reject) => {
      crypto.scrypt(password, salt, 32, { N: 2 ** 14, r: 8, p: 1 }, (err, key) => {
        if (err) reject(err);
        else resolve(key); // 32-byte AES key
      });
    });
  }
  
async function encryptWithPassword(text: string, password: string) {
    const salt = crypto.randomBytes(16); // Store this!
    const key = await deriveKeyFromPassword(new TextEncoder().encode(password), salt);
  
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
  
    const tag = cipher.getAuthTag().toString("hex");
  
    return {
      salt: salt.toString("hex"),
      iv: iv.toString("hex"),
      content: encrypted,
      tag,
    };
  }


  async function decryptWithPassword({ salt: salt, iv, content, tag }:{salt: string, iv: string, content: string, tag: string}, password: string) {
    const key = await deriveKeyFromPassword(new TextEncoder().encode(password),  Buffer.from(salt, "hex"));
  
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(iv, "hex"));
    decipher.setAuthTag(Buffer.from(tag, "hex"));
  
    let decrypted = decipher.update(content, "hex", "utf8");
    decrypted += decipher.final("utf8");
  
    return decrypted;
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
        console.log("KeyPair", {
            publicKey: newAccount.publicKey,
            secretKey: secretKeyInBase58
        })
        const encryptedPrivateKey = await encryptWithPassword(secretKeyInBase58, password)
        const user = await User.create({
            email,
            password: hashedPassword,
            privateKey: JSON.stringify(encryptedPrivateKey),
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
            if(!usersToPrivateKeys.has(user.email)){
                const privateKey = JSON.parse(user.privateKey!)
                const decryptedPrivateKey = await decryptWithPassword(privateKey, password)
                usersToPrivateKeys.set(user.email, decryptedPrivateKey)
            }
            const token = jwt.sign({_id:user._id}, process.env.JWT_SECRET!, {expiresIn:"1h"})
            res
            .cookie("token", token, {
                httpOnly: true,
                secure: true,
                sameSite: "none"
            })
            .status(200).json({
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

app.get("/check-auth", async(req, res)=>{
    try {
        const token = req.headers.authorization?.split(" ")[1] || req.cookies.token
        if(!token){
            res.status(401).json({
                message:"Unauthorized"
            })
            return
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET!)
        const userId = (decoded as {_id: string})._id

        const user = await User.findById(userId)
        if(!user){
            res.status(404).json({
                message:"User not found"
            })
            return
        }
        res.status(200).json({
            message:"Authorized",
            user:{
                email: user.email,
                id: user._id,
            },
            publicKey: user.publicKey
        })
    } catch (error) {
        console.log("Error while checking auth", error)
        res.status(500).json({
            message:"Internal Server error"
        })
    }
})

app.post("/sign-txn", async(req, res)=>{
    const {serializedTxn} = req.body
    const token = req.headers.authorization?.split(" ")[1]
        if(!token){
            res.status(401).json({
                message:"Unauthorized"
            })
            return
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET!)
        const userId = (decoded as {_id: string})._id

        const user = await User.findById(userId)
        if(!user){
            res.status(404).json({
                message:"User not found"
            })
            return
        }

        // const isPasswordCorrect = await bcrypt.compare(password, user.password)
        // if(!isPasswordCorrect){
        //     res.status(401).json({
        //         message:"Invalid password"
        //     })
        //     return
        // }
       const decryptedPrivateKey = usersToPrivateKeys.get(user.email)
       if(!decryptedPrivateKey){
        res.status(404).json({
            message:"Send password broo, I need to get your private key :)"
        })
        return
       }
    const connection = new Connection("https://api.devnet.solana.com")
    const transaction = Transaction.from(Buffer.from(serializedTxn, "base64"))
    const signer = Keypair.fromSecretKey(bs58.decode(decryptedPrivateKey!)) // TODO:user.privateKey 
    const signature = await connection.sendTransaction(transaction,[signer],{
        skipPreflight: true,
        maxRetries: 3
    })
    res.status(200).json({
        message:"Transaction signed successfully",
        signature
    })
})


app.get("/signout", async(req, res)=>{
    try {
        const token = req.headers.authorization?.split(" ")[1]
        if(!token){
            res.status(401).json({
                message:"Unauthorized"
            })
            return
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET!)
        const userId = (decoded as {_id: string})._id

        const user = await User.findById(userId)
        if(!user){
            res.status(404).json({
                message:"User not found"
            })
            return
        }
        if(usersToPrivateKeys.has(user.email)){
            usersToPrivateKeys.delete(user.email)
        }
        res
        .clearCookie("token", {
            httpOnly: true,
            secure: true,
            sameSite: "none"
        })
        .status(200).json({
            message:"User signed out successfully"
        })
    } catch (error) {
        console.log("Error while signing out", error)
        res.status(500).json({
            message:"Internal Server error"
        })
    }
})
app.listen(3000, async()=>{
    await connectToDb()
    console.log("Server running on port 3000")
})