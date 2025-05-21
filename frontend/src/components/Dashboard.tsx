import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card"

function Dashboard() {
  return (
    <div className="flex flex-col justify-around gap-3 p-10">
      <Card>
        <CardHeader>
          <CardTitle>Send Solana</CardTitle>
          <CardDescription>Send Solana to a public key</CardDescription>
        </CardHeader>
      </Card>
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
