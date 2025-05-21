import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import { ThemeProvider } from "./context/theme-context"
import Signup from "./components/Signup"
import Signin from "./components/Signin"
import { Toaster } from "sonner"
import Home from "./components/Home"
import Dashboard from "./components/Dashboard"
import SendSolPage from "./components/SendSolPage"
import AuthProvider from "./context/auth-context"
function App() {


  return (
    <ThemeProvider>
    <AuthProvider>
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
   </AuthProvider>
    </ThemeProvider>
  )
}

export default App
