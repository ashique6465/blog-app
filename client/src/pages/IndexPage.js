import { useEffect, useState } from "react";
import Post from "../post";

export default function IndexPage() {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        fetch('https://blog-app-five-red.vercel.app/post')
            .then(response => response.json())
            .then(posts => {
                setPosts(posts);
            })
            .catch(error => {
                console.error('Failed to fetch posts:', error);
            });
    }, []);

    return (
        <>
            {posts.map(post => (
                <Post key={post._id} {...post} />
            ))}
        </>
    );
}
