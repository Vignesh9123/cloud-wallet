import { useState } from "react"
import { Connection, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js"
import axios from "axios"

function App() {
  const [isDark, setIsDark] = useState(true)
  const onToggleClick = () => {
    document.getElementsByTagName("html")[0].classList.toggle("dark")
    setIsDark(!isDark)
  }

  const sendTxnToBackend = async ()=>{
    const connection = new Connection("https://api.devnet.solana.com")
    const {blockhash} = await connection.getLatestBlockhash()
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: new PublicKey("9Qj3Su5uijFa6NPqHHRrRiFfJ8oKTZMjHqDQQ7oeJkwN"),
        toPubkey: new PublicKey("6GrHdFDmyR2ozzcbckH37XZufrVKkDhgSEofcyVnjubX"),
        lamports: LAMPORTS_PER_SOL
      })
    )
    transaction.recentBlockhash = blockhash
    transaction.feePayer =  new PublicKey("9Qj3Su5uijFa6NPqHHRrRiFfJ8oKTZMjHqDQQ7oeJkwN")
    const serializedTxn = transaction.serialize({
      requireAllSignatures: false,
      verifySignatures: false
    })
    await axios.post("http://localhost:3000/sign-txn", {serializedTxn})
  }

  return (
    <div className="">
      <button onClick={()=>onToggleClick()}>{isDark ? "Light" : "Dark"}</button>
      <div>
        <button onClick={() => {
          sendTxnToBackend()       
        }}>
          Send Transaction
        </button>
      </div>
    </div>
  )
}

export default App
