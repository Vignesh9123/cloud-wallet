import { Link } from "react-router-dom"
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { useAuth } from "@/context/auth-context"
function Dashboard() {
  const {user} = useAuth()
  return (
    <div className="flex flex-col justify-around gap-3 p-10">
      {JSON.stringify(user)}
      <Link to="/send-sol" >
      <Card>
        <CardHeader>
          <CardTitle>Send Solana</CardTitle>
          <CardDescription>Send Solana to a public key</CardDescription>
        </CardHeader>
      </Card>
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>Export Private Key</CardTitle>
          <CardDescription>Export your private key and add it to your wallet</CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}

export default Dashboard
