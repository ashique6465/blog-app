import { useState, useContext } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../userContext";
export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [redirect, setRedirect] = useState(false);
    const { setUserInfo } = useContext(UserContext);

    async function handelSubmit(ev) {
        ev.preventDefault();
        try {
            const response = await fetch('https://blog-app-five-red.vercel.app/login', {
                method: "POST",
                body: JSON.stringify({ username, password }),
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });
    
            if (response.ok) {
                const userInfo = await response.json(); // Parse JSON once
                setUserInfo(userInfo);
                setRedirect(true);
            } else {
                alert('Wrong Credentials');
            }
        } catch (error) {
            console.error("Error:", error);
        }
    }
    

    if (redirect) {
        return <Navigate to={'/'} />;
    }

    return (
        <form className="login" onSubmit={handelSubmit}>
            <h1>Login</h1>
            <input type="text" placeholder="username" value={username} onChange={ev => setUsername(ev.target.value)} />
            <input type="password" placeholder="password" value={password} onChange={ev => setPassword(ev.target.value)} />
            <button>Login</button>
        </form>
    );
}
