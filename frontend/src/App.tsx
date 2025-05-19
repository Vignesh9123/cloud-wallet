import { useState } from "react"


function App() {
  const [isDark, setIsDark] = useState(true)
  const onToggleClick = () => {
    document.getElementsByTagName("html")[0].classList.toggle("dark")
    setIsDark(!isDark)
  }

  return (
    <div className="">
      

      <button onClick={()=>onToggleClick()}>{isDark ? "Light" : "Dark"}</button>
    </div>
  )
}

export default App
