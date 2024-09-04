import { Link } from 'react-router-dom'
import { useContext, useEffect, useState } from 'react'
import { UserContext } from './userContext'

export default function Header() {
    const { setUserInfo, userInfo } = useContext(UserContext);
    useEffect(() => {
        fetch("https://blog-app-five-red.vercel.app/profile", {
            credentials: "include",
        })
            .then(response => {
                response.json().then(userInfo => {
                    setUserInfo(userInfo);
                });
            })
    }, [])
    function logout() {
        fetch("https://blog-app-five-red.vercel.app/logout", {
            credentials: "include",
            method: "POST",
        });
        setUserInfo(null);
    }

    const username = userInfo?.username;
    return (
        <header>
            <Link to="" className="logo">My Blog</Link>
            <nav>
                {username && (
                    <>
                        {/* <span>Hello,{username}</span> */}
                        <Link to='/create'>Create New Post</Link>
                        <a onClick={logout}>Logout</a>
                    </>
                )}
                {
                    !username && (<>
                        <Link to="/login">Login</Link>
                        <Link to="/register">Register</Link>
                    </>)
                }

            </nav>
        </header>
    )
}