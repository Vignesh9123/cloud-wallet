import { PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from "@solana/web3.js"
import { Connection } from "@solana/web3.js"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import axios from "axios"
import { toast } from "sonner"
import { useAuth } from "@/context/auth-context"

function SendSolPage() {
  const {user} = useAuth()
    const sendTxnToBackend = async (e: React.FormEvent<HTMLFormElement>)=>{
        e.preventDefault()
        try {
          const formData = new FormData(e.target as HTMLFormElement)
          const topubkey = formData.get("topubkey")?.toString()
          if(!topubkey){
              toast.error("Please enter a public key")
              return
          }
          const amount = formData.get("amount")?.toString()
          if(!amount){
              toast.error("Please enter an amount")
              return
          }
          const connection = new Connection("https://api.devnet.solana.com")
          const {blockhash} = await connection.getLatestBlockhash()
          const transaction = new Transaction().add(
            SystemProgram.transfer({
              fromPubkey: new PublicKey(user.publicKey), 
              toPubkey: new PublicKey(topubkey),
              lamports: parseFloat(amount) * LAMPORTS_PER_SOL
            })
          )
          transaction.recentBlockhash = blockhash
          transaction.feePayer =  new PublicKey(user.publicKey) 
          const serializedTxn = transaction.serialize({
            requireAllSignatures: false,
            verifySignatures: false
          })
          const response = await axios.post("http://localhost:3000/sign-txn", {serializedTxn}, {
            headers:{
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
          })
          console.log(response)
        } catch (error: any) {
          console.log(error)
          toast.error(error.response.data.message || "Something went wrong")
        }
      }
  return (
    <div className="flex flex-col gap-5 p-10 container mx-auto">
        <div className="fle flex-col gap-2">
        <h1 className="text-2xl font-bold">Send Solana</h1>
        <p className="text-sm dark:text-gray-300 text-gray-700">Send Solana to a public key</p>
        </div>
        <form className="flex flex-col gap-5" onSubmit={sendTxnToBackend}>

        <Input type="text" placeholder="Public Key of Recipient" name="topubkey" />
        <Input type="number" placeholder="Amount in SOL" name="amount" />
        <Button type="submit">Send Solana</Button>
        </form>
    </div>
  )
}

export default SendSolPage
