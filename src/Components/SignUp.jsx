import { useNavigate, } from "react-router-dom";
import css from "../css/SignUp.module.css"
import React, { useState } from 'react'
import { useDispatch } from "react-redux";
import { tostify } from "../Tools/tostify";
import { signUp } from "../Redux/Reducers/UserReducer";

export default function SignUp() {

    const [email, setEmail] = useState(localStorage.getItem("email") ? localStorage.getItem("email") : "");
    const [password, setPassword] = useState();
    const [confirmPassword, setConfirmPassword] = useState();

    const navigate = useNavigate();
    const dispatch = useDispatch();



    const handleSignUp = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            console.log(password, confirmPassword)
            tostify("error", "Password and ConfirmPassword must be same");
            return;
        }

        await dispatch(signUp({ email, password }));
        const tempEmail = localStorage.getItem("email");
        //~ i am setting email value in localStorage, if signUp is successful,its value is same means navigate to signIn page
        if (tempEmail === email) {
            navigate('/signIn')
        }
    }



    const handleSignIn = () => {
        navigate('/signIn')
    }
    return (
        <div className="habitsContainer">
            <div className={css.container}>
                <form action="">
                    <input onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" required />
                    <input onChange={(e) => setPassword(e.target.value)} type="password" minLength={6} placeholder="Password" required />
                    <input onChange={(e) => setConfirmPassword(e.target.value)} type="password" minLength={6} placeholder="Confirm Password" required />
                    <button onClick={(e) => handleSignUp(e)} >SignUp</button>
                    <div onClick={() => handleSignIn()} className={css.switch}>have account? SignIn here</div>
                </form>
            </div>
        </div>
    )
}
