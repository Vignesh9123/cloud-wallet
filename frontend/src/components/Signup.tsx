import React from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { toast } from 'sonner'
import { useAuth } from '@/context/auth-context'
function Signup() {

  const {signup} = useAuth()
    const handleSubmit = async(e: React.FormEvent<HTMLFormElement>) => {
        try {
            e.preventDefault()
            const formData = new FormData(e.target as HTMLFormElement)
            const email = formData.get("email")?.toString().toLowerCase()
            const password = formData.get("password")?.toString()

            if(!email){
                toast.error("Please enter an email")
                return
            }
            if(!password){
                toast.error("Please enter a password")
                return
            }
            const response = await signup(email, password)

            console.log(response)
            toast.success("Signed up Successfully")
        }
        catch(error : any) {
            console.log(error)
            toast.error(error.response.data.message || "Something went wrong")
        }
        
    }
  return (
    <div className='flex flex-col gap-5 items-center justify-center h-screen'>
      <h1>Sign Up</h1>
      <form className='flex flex-col gap-5' onSubmit={handleSubmit}>
        <Input type="email" placeholder="Email" name="email" />
        <Input type="password" placeholder="Password" name="password" />
        <Button type="submit">Sign Up</Button>
      </form>
    </div>
  )
}

export default Signup
