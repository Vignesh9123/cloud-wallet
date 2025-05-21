import axios from "axios";
import { createContext, useContext, useState } from "react";


interface AuthContextProps {
    user: any, //TODO: Add user type
    login: (email: string, password: string) => Promise<any>,
    logout: () => Promise<any>,
    signup: (email: string, password: string) => Promise<any>
}
const AuthContext = createContext<AuthContextProps>({
    user: null,
    login: async() => {},
    logout: async() => {},
    signup: async() => {}
});

export default function AuthProvider({ children }: {children:React.ReactNode}) {
    const [user, setUser] = useState(null);

    const login = async(email: string, password: string) => {
        const response = await axios.post("http://localhost:3000/signin", { email, password })
        localStorage.setItem("token", response.data.token)
        setUser({...response.data.user, publicKey: response.data.publicKey})
        return response
    };

    const signup = async(email: string, password: string) => {
        const response = await axios.post("http://localhost:3000/signin", { email, password })
        return response
    }

    const logout = async() => {
        const response = await axios.get("http://localhost:3000/signout")
        localStorage.clear()
        setUser(null)
        return response
    }
    return(
        <AuthContext.Provider value={{ user, login, logout, signup }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)