import { Connection, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js"
import axios from "axios"
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import Home from "./components/Home"
import { ThemeProvider } from "./context/theme-context"
import Signup from "./components/Signup"
import Signin from "./components/Signin"
import { Toaster } from "sonner"
import Dashboard from "./components/Dashboard"
import SendSolPage from "./components/SendSolPage"
function App() {


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
    <ThemeProvider>
      <Router>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/sign-up" element={<Signup />} />
      <Route path="/sign-in" element={<Signin />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/send-sol" element={<SendSolPage />} />
    </Routes>
   </Router>
   <Toaster />
    </ThemeProvider>
  )
}

export default App
