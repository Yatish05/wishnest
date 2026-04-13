import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

function AuthSuccess() {

  const navigate = useNavigate()

  useEffect(() => {

    console.log("AuthSuccess page loaded")

    const token = localStorage.getItem("token")

    console.log("Token from storage:", token)

    if (token) {

      console.log("Valid session found — redirecting to dashboard")

      navigate("/dashboard")

    } else {

      console.log("No session found — redirecting to login")

      navigate("/login")

    }

  }, [navigate])

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      Logging you in...
    </div>
  )
}

export default AuthSuccess
