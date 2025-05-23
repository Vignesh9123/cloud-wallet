import { Button } from "./ui/button"
import { Input } from "./ui/input"
import {toast} from "sonner"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/context/auth-context"

function Signin() {
  const navigate = useNavigate()
  const {login} = useAuth()
    const handleSubmit = async(e: React.FormEvent<HTMLFormElement>) => {
        try {
            e.preventDefault()
            const formData = new FormData(e.target as HTMLFormElement)
            const email = formData.get("email")?.toString().toLowerCase()
            if(!email){
                toast.error("Please enter an email")
                return
            }
            const password = formData.get("password")?.toString()
            if(!password){
                toast.error("Please enter a password")
                return
            }
            const response = await login(email, password)
            console.log(response)
            toast.success("Signed in Successfully")
            navigate("/dashboard")
        } catch (error : any) {
            console.log(error)
            toast.error(error.response.data.message || "Something went wrong")
        }
    }
  return (
    <div className='flex flex-col gap-5 items-center justify-center h-screen'>
    <h1>Sign In</h1>
    <form className='flex flex-col gap-5' onSubmit={handleSubmit}>
      <Input type="email" placeholder="Email" name="email" />
      <Input type="password" placeholder="Password" name="password" />
      <Button type="submit">Sign In</Button>
    </form>
    </div>
  )
}

export default Signin
