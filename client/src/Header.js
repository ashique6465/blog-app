import { Link, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "./userContext";

export default function Header() {
  const { setUserInfo, userInfo } = useContext(UserContext);
  const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
    // Fetch the profile with proper credentials handling
    fetch('https://blog-app-eight-black.vercel.app/profile', {
      credentials: 'include',
    })
      .then(response => {
        // Check if the response is OK (status code 200-299)
        if (response.ok) {
          return response.json();
        } else {
          throw new Error(`Error fetching profile: ${response.statusText}`);
        }
      })
      .then(userInfo => {
        setUserInfo(userInfo); // Set user info on success
      })
      .catch(error => {
        console.error("Failed to fetch user profile:", error);
        // Optionally, handle the error (e.g., show a message to the user)
      });
  }, []);

  function logout() {
    fetch('https://blog-app-eight-black.vercel.app/logout', {
      credentials: 'include',
      method: 'POST',
    })
      .then(response => {
        if (response.ok) {
          setUserInfo(null); // Clear user info in context
          navigate('/login'); // Redirect to login page
        } else {
          throw new Error("Logout failed");
        }
      })
      .catch(error => {
        console.error("Logout error:", error);
        // Optionally, handle the error (e.g., show a message to the user)
      });
  }

  const username = userInfo?.username;

  return (
    <header>
      <Link to="/" className="logo">MyBlog</Link>
      <nav>
        {username && (
          <>
            <Link to="/create">Create new post</Link>
            <a onClick={logout} style={{ cursor: 'pointer' }}>Logout ({username})</a>
          </>
        )}
        {!username && (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
}
