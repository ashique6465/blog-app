import { useEffect, useState } from "react";
import Post from "../post";

export default function IndexPage() {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        fetch('https://blog-f0lyrd3kz-md-ashique-alis-projects.vercel.app/post')
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
