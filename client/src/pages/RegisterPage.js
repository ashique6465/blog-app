import { useState } from "react";

export default function RegisterPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    async function register(ev) {
        ev.preventDefault();
        try {
            const response = await fetch('https://blog-app-blond-eta.vercel.app/register', {
                method: 'POST',
                body: JSON.stringify({
                    username,
                    password
                }),
                headers: { 'Content-type': 'application/json' }
            });
            if (!response.ok) {
                throw new Error('Registration failed');
            }
            setSuccess(true);
        } catch (error) {
            setError(error.message);
        }
    }

    return (
        <form className="register" onSubmit={register}>
            <h1>Register</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>Registration successful!</p>}
            <input
                type="text"
                placeholder="username"
                value={username}
                onChange={ev => setUsername(ev.target.value)}
            />
            <input
                type="password"
                placeholder="password"
                value={password}
                onChange={ev => setPassword(ev.target.value)}
            />
            <button>Register</button>
        </form>
    );
}
