import { useEffect, useState } from "react";
import Post from "../post";

export default function IndexPage() {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        fetch('https://blog-app-five-red.vercel.app/post')
            .then(response => response.json())
            .then(posts => {
                setPosts(posts);
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
