import { useNavigate } from "react-router-dom"
import css from "../css/SignIn.module.css"
import React, { useState } from 'react'
import { useDispatch } from "react-redux";
import { signIn } from "../Redux/Reducers/UserReducer";

export default function SignIn() {

  const [email, setEmail] = useState(localStorage.getItem("email") || "");
  const [password, setPassword] = useState(localStorage.getItem("password") || "");

  const navigate = useNavigate();
  const dispatch = useDispatch();


  const handleSingIn = async (e) => {
    e.preventDefault();
    await dispatch(signIn({ email, password }));
    const userUID = localStorage.getItem("userUID");
    if (userUID) {
      navigate('/')
    }
  }


  const handleSignUp = () => {
    navigate('/signUp');
  }

  return (
    <div className="habitsContainer">
      <div className={css.container}>
        <form action="">
         <input onChange={(e) => setEmail(e.target.value)} type="email" defaultValue={email} placeholder="Email" />
          <input onChange={(e) => setPassword(e.target.value)} type="password" defaultValue={password} placeholder="Password" />
          <button onClick={(e) => handleSingIn(e)}>Sign In</button>
          <div onClick={() => handleSignUp()} className={css.switch}>don't have account? SignUp here</div>
        </form>
      </div>
    </div>
  )
}
