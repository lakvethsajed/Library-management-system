import { Link, useNavigate } from "react-router-dom";
import NavHeader from "../components/navbar";
import "./auth.css"
import Footer from "../components/Footer"
import React from "react"
import API_BASE_URL from "../api";

export default function Register() {
  const navigate = useNavigate()
  const [name, setname] = React.useState("")
  const [username, setusername] = React.useState("")
  const [email, setemail] = React.useState("")
  const [password, setpassword] = React.useState("")
  const [usernameError, setusernameError] = React.useState("")
  const [passwordError, setpasswordError] = React.useState("")
  const [serverError, setserverError] = React.useState("")

  async function handleRegister(e) {
    e.preventDefault()
    setserverError("")
    if (username.length < 3) {
      setusernameError("Username must contain at least 3 characters")
      return
    }
    if (username.length > 20) {
      setusernameError("Username must not exceed 20 characters")
      return
    }
    if (!/^[A-Za-z0-9_]+$/.test(username)) {
      setusernameError("Username can contain only letters, numbers and underscore")
      return
    }
    setusernameError("")

    if (password.length < 8) {
      setpasswordError("Password must contain at least 8 characters")
      return
    }
    if (!/[A-Z]/.test(password)) {
      setpasswordError("Password must contain at least one uppercase letter")
      return
    }
    if (!/[a-z]/.test(password)) {
      setpasswordError("Password must contain at least one lowercase letter")
      return
    }
    if (!/[0-9]/.test(password)) {
      setpasswordError("Password must contain at least one number")
      return
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      setpasswordError("Password must contain at least one special character")
      return
    }
    setpasswordError("")
    const userData = {
      name: name,
      username: username,
      email: email,
      password: password
    }
      
      const response = await fetch(`${API_BASE_URL}/users/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(userData)
    })

    const data = await response.json()

    if (response.ok) {

      setname("")
      setusername("")
      setemail("")
      setpassword("")

      navigate("/login")

    } else if (response.status === 409) {

    setserverError(data.detail)

}
  }

  return (
    <>
      <NavHeader />

      <div className="auth">
        <form onSubmit={handleRegister}>
          <h1>Create Your Account</h1>
          <label>Name</label>
          <input type="text" placeholder="Enter your name" name="Name" value={name} onChange={(e) => setname(e.target.value)}/>
          <label htmlFor="username">Username</label>
          <input type="text" placeholder="Enter your username"id="username" value={username} onChange={(e) => {setusername(e.target.value)}}/>
          <label htmlFor="email">E-mail</label>
          <input type="email" placeholder="Enter your E-mail" id="email" value={email} onChange={(e) => setemail(e.target.value)}/>
          <label htmlFor="password">Password</label>
          <input type="password" placeholder="Enter your password" id="password" value={password}
            onChange={(e) => {
              const value = e.target.value
              setpassword(value)
              if (value.length < 8) {
                setpasswordError("Password must contain at least 8 characters")
              } else if (!/[A-Z]/.test(value)) {
                setpasswordError("Password must contain at least one uppercase letter")
              } else if (!/[a-z]/.test(value)) {
                setpasswordError("Password must contain at least one lowercase letter")
              } else if (!/[0-9]/.test(value)) {
                setpasswordError("Password must contain at least one number")
              } else if (!/[^A-Za-z0-9]/.test(value)) {
                setpasswordError("Password must contain at least one special character")
              } else {
                setpasswordError("")
              }

            }}
          />

          {passwordError && <p className="password-error">{passwordError}</p>}

          {serverError && <p className="server-error">{serverError}</p>}

          <button type="submit">Create Account</button>
        </form>
        <p>Already have an account?{" "}<Link to="/login">Login</Link></p>
      </div>
      <Footer />

    </>
  );
}