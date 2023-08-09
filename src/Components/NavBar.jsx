import React, { useState } from 'react'
import css from "../css/NavBar.module.css"
import { Outlet, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from 'react-redux';
import { logOut } from '../Redux/Reducers/UserReducer';
import { userSelector } from '../Redux/Selectors';
import { useEffect } from 'react';

export default function NavBar() {

    const [menu, setMenu] = useState(false);
    const [pageName, setPageName] = useState("Daily View");

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const userUID = useSelector(userSelector);

    useEffect(() => {
        const currentURL = window.location.href;
        const parts = currentURL.split('/'); // Split the URL by '/'
        const lastPart = parts.pop(); // Get the last part after the last '/'
        setPageName(lastPart);
    })

    const handleDailyView = () => {
        navigate('/')
    }
    const handleWeeklyView = () => {
        navigate('/weeklyView')
    }
    const handleLogOut = async () => {

        await dispatch(logOut())

        navigate("/signIn")
    }
    const handleAddBtn = () => {
        navigate("/addHabit")
    }

    const backBtn = () => {
        navigate(-1)
    }
    return (<>
        <div className={css.container}>
            <div onMouseEnter={() => setMenu(true)}
                onMouseLeave={() => setMenu(false)}
                style={{ height: menu ? "130px" : "40px" }}
                className={css.menu}>
                <div ><i className="bi bi-list"></i></div>
                {menu && <div className={css.menuOn}>
                    <div onClick={() => handleDailyView()}><i className="bi bi-calendar-day"></i> Daily</div>
                    <div onClick={() => handleWeeklyView()}><i className="bi bi-calendar3"></i> Weekly</div>
                    {userUID
                        ? <div onClick={() => handleLogOut()}><i className="bi bi-box-arrow-left"></i> LogOut</div>
                        : <div onClick={() => navigate("/signIn")}><i className="bi bi-box-arrow-in-right"></i> SignIn</div>}
                </div>}
            </div>
            <div className={css.pageName}>
                <h3>{pageName &&
                    pageName === "weeklyView" ? "Weekly View"
                    : pageName === "signIn" ? "SignIn Page"
                        : pageName === "signUp" ? "SignUp Page"
                            : pageName === "addHabit" ? "Add New Habit"
                                : "Daily View"
                }</h3>
            </div>

            {
                pageName === "addHabit"
                    ? <div onClick={() => backBtn()} className={css.add}>
                        <i style={{color:"red"}} className="bi bi-x-lg"></i>
                    </div>

                    : <div onClick={() => handleAddBtn()} className={css.add}>
                        <i style={{color:"cyan"}} className="bi bi-plus-lg"></i>
                    </div>
            }

        </div>
        <Outlet />
    </>)
}
