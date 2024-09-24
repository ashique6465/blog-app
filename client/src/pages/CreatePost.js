import React, { useState } from 'react';
import { Navigate } from 'react-router-dom'; // Import Navigate for redirection
import ReactQuill from 'react-quill';
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
            if (file) {
                const reader = new FileReader();
                reader.onload = function () {
                    setContent(content + `<img src="${reader.result}" alt="Uploaded Image"/>`);
                };
                reader.readAsDataURL(file);
            }
            data.set('file', file);
            data.set('content', content);

            const response = await fetch('https://blog-app-five-red.vercel.app/post', {
                method: 'POST',
                body: data,
                credentials: 'include',
            });

            if (!response.ok) {
                // If post creation fails, set redirect to true and throw an error
                throw new Error('Failed to create post');
            }
            setRedirect(true);
            console.log(await response.json());
            // Optionally, reset form fields or perform other actions upon successful post creation
        } catch (error) {
            console.error('Error creating post:', error.message);
            // Handle the error here, e.g., display a message to the user
        }
    }

    // If redirect is true, navigate to '/'
    if (redirect) {
        return <Navigate to={'/'} />
    }

    return (
        <form onSubmit={createNewPost}>
            <input type="text" placeholder={'Title'} value={title} onChange={ev => setTitle(ev.target.value)} />
            <input type="text" placeholder={'Summary'} value={summary} onChange={ev => setSummary(ev.target.value)} />
            <input type="file" onChange={e => setFile(e.target.files[0])} />
            <Editor value={content} onChange={setContent}></Editor>
            <button style={{ marginTop: '5px' }}>Create Post</button>
        </form>
    );
}

export default CreatePost;
