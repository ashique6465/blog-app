import { useEffect, useState } from "react";
import Post from "../post";

export default function IndexPage() {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null); // State to store errors if any

  useEffect(() => {
    // Fetch posts from the backend API
    fetch('https://blog-app-4-17rd.onrender.com/post')
      .then(response => {
        if (!response.ok) {
          throw new Error(`Error fetching posts: ${response.statusText}`);
        }
        return response.json();
      })
      .then(posts => {
        setPosts(posts); // Set posts if fetch is successful
      })
      .catch(error => {
        console.error("Failed to fetch posts:", error);
        setError("Failed to load posts. Please try again later."); // Set error state if fetch fails
      });
  }, []);

  return (
    <>
      {error && <p>{error}</p>} {/* Display error message if fetch fails */}
      {posts.length > 0 
        ? posts.map(post => <Post key={post.id} {...post} />) // Display posts if available
        : !error && <p>No posts available</p> /* Display message if there are no posts */
      }
    </>
  );
}





