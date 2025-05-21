import { Button } from "./ui/button"
import { Input } from "./ui/input"

function SendSolPage() {
  return (
    <div className="flex flex-col gap-5 p-10 container mx-auto">
        <div className="fle flex-col gap-2">
        <h1 className="text-2xl font-bold">Send Solana</h1>
        <p className="text-sm dark:text-gray-300 text-gray-700">Send Solana to a public key</p>
        </div>
        <form className="flex flex-col gap-5" onSubmit={()=>{}}>

        <Input type="text" placeholder="Public Key of Recipient" name="topubkey" />
        <Input type="number" placeholder="Amount in SOL" name="amount" />
        <Button type="submit">Send Solana</Button>
        </form>
    </div>
  )
}

export default SendSolPage
