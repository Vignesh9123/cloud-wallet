import { Link } from "react-router-dom"
function Home() {
  return (
    <div>
        <Link to="/sign-up">Sign Up</Link>
        <Link to="/sign-in">Sign In</Link>
    </div>
  )
}

export default Home
