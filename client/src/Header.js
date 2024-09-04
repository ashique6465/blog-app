import { Link } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { UserContext } from './userContext';

export default function Header() {
    const { setUserInfo, userInfo } = useContext(UserContext);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("https://blog-app-five-red.vercel.app/profile", {
            credentials: "include",
        })
            .then(response => response.json())
            .then(userInfo => {
                setUserInfo(userInfo);
                setLoading(false);
            })
            .catch(error => {
                console.error('Failed to fetch user info:', error);
                setLoading(false);
            });
    }, [setUserInfo]);

    function logout() {
        fetch("https://blog-app-five-red.vercel.app/logout", {
            credentials: "include",
            method: "POST",
        })
        .then(() => {
            setUserInfo(null);
        })
        .catch(error => {
            console.error('Failed to logout:', error);
        });
    }

    const username = userInfo?.username;

    if (loading) {
        return <header>Loading...</header>;
    }

    return (
        <header>
            <Link to="" className="logo">My Blog</Link>
            <nav>
                {username ? (
                    <>
                        <Link to='/create'>Create New Post</Link>
                        <a onClick={logout} href="#">Logout</a>
                    </>
                ) : (
                    <>
                        <Link to="/login">Login</Link>
                        <Link to="/register">Register</Link>
                    </>
                )}
            </nav>
        </header>
    );
}
