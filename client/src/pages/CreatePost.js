
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom'; // Import Navigate for redirection
import 'react-quill/dist/quill.snow.css';
import Editor from '../Editor';

function CreatePost() {
    const [title, setTitle] = useState('');
    const [file, setFile] = useState(null);
    const [summary, setSummary] = useState('');
    const [content, setContent] = useState('');
    const [redirect, setRedirect] = useState(false);

    async function createNewPost(e) {
        e.preventDefault();
        try {
            const data = new FormData();
            data.set('title', title);
            data.set('summary', summary);
            data.set('content', content);
            if (file) {
                data.append('file', file);  // Appending the file for upload
            }

            const response = await fetch('http://localhost:4000/post', {
                method: 'POST',
                body: data,
                credentials: 'include', // Include credentials (cookies) for authentication
            });

            if (!response.ok) {
                throw new Error('Failed to create post');
            }

            setRedirect(true); // Redirect upon successful post creation
        } catch (error) {
            console.error('Error creating post:', error);
        }
    }

    if (redirect) {
        return <Navigate to="/" />;
    }

    return (
        <form onSubmit={createNewPost}>
            <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
            <input type="text" placeholder="Summary" value={summary} onChange={e => setSummary(e.target.value)} />
            <input type="file" onChange={e => setFile(e.target.files[0])} />
            <Editor value={content} onChange={setContent}></Editor>
            <button style={{ marginTop: '5px' }}>Create Post</button>
        </form>
    );
}

export default CreatePost;



