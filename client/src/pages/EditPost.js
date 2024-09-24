import React, { useState, useEffect } from 'react';
import { Navigate, useParams } from 'react-router-dom'; // Import Navigate for redirection
import Editor from "../Editor";

export default function EditPost() {
    const { id } = useParams();
    const [title, setTitle] = useState('');
    const [file, setFile] = useState(null);
    const [summary, setSummary] = useState('');
    const [content, setContent] = useState('');
    const [redirect, setRedirect] = useState(false);

    useEffect(() => {
        fetch(`https://blog-app-five-red.vercel.app/post/${id}`)
            .then(response => response.json())
            .then(postInfo => {
                setTitle(postInfo.title);
                setSummary(postInfo.summary);
                setContent(postInfo.content);
            });
    }, [id]);

    async function updatePost(e) {
        e.preventDefault();
        const data = new FormData();
        data.set('title', title);
        data.set('summary', summary);
        data.set('content', content);
        data.set('id', id); // Send post ID to identify the post being updated
        if (file) {
            data.append('file', file);  // Appending the new file if uploaded
        }

        const response = await fetch('https://blog-app-five-red.vercel.app/post', {
            method: 'PUT',
            body: data,
            credentials: 'include',
        });

        if (response.ok) {
            setRedirect(true);
        } else {
            console.error('Failed to update post');
        }
    }

    if (redirect) {
        return <Navigate to={`/post/${id}`} />;
    }

    return (
        <form onSubmit={updatePost}>
            <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={e => setTitle(e.target.value)}
            />
            <input
                type="text"
                placeholder="Summary"
                value={summary}
                onChange={e => setSummary(e.target.value)}
            />
            <input
                type="file"
                onChange={e => setFile(e.target.files[0])} // Handling new file input
            />
            <Editor onChange={setContent} value={content}></Editor>
            <button style={{ marginTop: '5px' }}>Update Post</button>
        </form>
    );
}



// import React from "react"
// import { useState, useEffect } from 'react';
// import { Navigate, useParams } from 'react-router-dom'; // Import Navigate for redirection
// import Editor from "../Editor";


// export default function EditPost() {
//     const { id } = useParams();
//     const [title, setTitle] = useState('');
//     const [file, setFile] = useState(null);
//     const [summary, setSummary] = useState('');
//     const [content, setContent] = useState('');
//     const [redirect, setRedirect] = useState(false)

//     useEffect(() => {
//         fetch('https://blog-app-five-red.vercel.app/post/' + id)
//             .then(response => {
//                 response.json().then(postInfo => {
//                     setTitle(postInfo.title);
//                     setContent(postInfo.content);
//                     setSummary(postInfo.summary);
//                 });
//             });
//     }, []);

//     async function updatePost(ev) {
//         ev.preventDefault();
//         const data = new FormData();
//         data.set('title', title);
//         data.set('summary', summary);
//         data.set('content', content);
//         data.set('id', id);
//         if (file?.[0]) {
//             data.set('file', file?.[0]);

//         }
//         const response = await fetch('https://blog-app-five-red.vercel.app/post', {
//             method: 'PUT',
//             body: data,
//             credentials: 'include',
//         });
//         if (response.ok) {
//             setRedirect(true)

//         }
//     }
//     if (redirect) {
//         return <Navigate to={'/post/' + id} />
//     }



//     return (
//         <form onSubmit={updatePost}>
//             <input type="text"
//                 placeholder={'Title'}
//                 value={title}
//                 onChange={ev => setTitle(ev.target.value)} />
//             <input type="text"
//                 placeholder={'Summary'}
//                 value={summary}
//                 onChange={ev => setSummary(ev.target.value)} />
//             <input type="file"
//                 onChange={e => setFile(e.target.files[0])} />
//             <Editor onChange={setContent} value={content}></Editor>
//             <button style={{ marginTop: '5px' }}>Update Post</button>
//         </form>
//     );
// }