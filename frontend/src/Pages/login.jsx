import { Link, useNavigate } from "react-router-dom"
import NavHeader from "../components/navbar"
import "./auth.css"
import Footer from "../components/Footer"
import React from "react"
import API_BASE_URL from "../api";

export default function Login() {
  const navigate = useNavigate()
  const [username, setusername] = React.useState("")
  const [password, setpassword] = React.useState("")
  const [servererror, setservererror] = React.useState("")

  async function handleLogin(e){
    e.preventDefault();
    setservererror("");

    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);
     
    const response = await fetch(`${API_BASE_URL}/login`,{
      method : "POST",
      headers:{
        "Content-Body" : "application/x-www-form-urlencoded"
      },body: formData
    });
    const data = await response.json()
    
    if (response.ok){
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("role", data.role);
      setusername("")
      setpassword("")
      navigate("/")
      window.location.reload()
    } else {
      setservererror(data.detail)
    }
  }
  
  return (
    <>
      <NavHeader />
      <div className="auth">
        <form onSubmit={handleLogin}>
          <h1 className="login-h1">Login</h1>
          <label className="labels" htmlFor="username">Username</label>
          <input type="text" id="username" placeholder="Enter the required username" value={username} onChange={(e)=> setusername(e.target.value)}/>
          <label className="labels" htmlFor="password">Password</label>
          <input type="password" id="password" placeholder="Enter the required password" value={password} onChange={(e)=> setpassword(e.target.value)}/>
          {servererror && (<p className="server-error">{servererror}</p>)}
          <button className="login-btn">Submit</button>
        </form>
        <p>
          Don't have an account?{" "} <Link to="/register">Register</Link>
        </p>
      </div>
      <Footer />
    </>
  )
}