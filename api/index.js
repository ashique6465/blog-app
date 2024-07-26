const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();

app.use((req, res, next) => {
    console.log(`Received ${req.method} request to ${req.path}`);
    next();
});

const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR);
}
const uploadMiddelware = multer({
    dest: 'uploads/',
    limits: {
        fileSize: 100 * 1024 * 1024,
    }
})
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();
const Users = require('./models/User');
const Post = require('./models/Post')
const mongoose = require('mongoose');

const salt = bcrypt.genSaltSync(10);
const salt2 = 'fvskfvbskjf';

app.use(cookieParser());
app.use('/uploads', express.static(__dirname + "/uploads"))

const PORT = process.env.PORT || 4000; // Use port from environment variable or default to 4000

app.use(cors({ credentials: true, origin: 'https://blog-app-t37j-64cbx9b23-md-ashique-alis-projects.vercel.app' }));
app.use(express.json());

mongoose.connect("mongodb+srv://vasileus45:gQJwPkJRQ2AgPfaE@cluster0.tn3bzsj.mongodb.net/");

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const userDoc = await Users.create({
            username, password: bcrypt.hashSync(password, salt)
        });
        res.json(userDoc);
    } catch (e) {
        console.log(e);
        res.status(400).json(e);
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const userDoc = await Users.findOne({ username });
        if (!userDoc) {
            // User not found
            return res.status(404).json({ message: "User not found" });
        }
        console.log("Stored hashed password:", userDoc.password);
        console.log("Plain password:", password);
        const passOk = bcrypt.compareSync(password, userDoc.password);
        console.log("passOk:", passOk);
        if (passOk) {
            jwt.sign({ username, id: userDoc._id }, salt2, {}, (error, token) => {
                if (error)
                    throw (error);
                res.cookie('token', token).json({
                    id: userDoc._id,
                    username,
                });
            })
        } else {
            res.status(400).json('Wrong credentials!!!');
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


app.get('/profile', (req, res) => {
    const { token } = req.cookies;
    if (!token) {
        return res.status(401).json({ message: "Authentication required" });
    }

    jwt.verify(token, salt2, {}, (error, info) => {
        if (error) {
            return res.status(401).json({ message: "Invalid token" });
        }
        res.json(info);
    });
});
app.post("/logout", (req, res) => {
    res.cookie("token", "").json("ok");
})


app.post('/post', uploadMiddelware.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            throw new Error('No file uploaded');
        }

        console.log("Reached /post route");
        console.log("File size:", req.file.size);

        if (req.file.size > 100 * 1024 * 1024) {
            throw new Error('File size exceeds the limit');
        }

        const { originalname, path } = req.file;
        const parts = originalname.split('.');
        const ext = parts[parts.length - 1];
        const newPath = path + '.' + ext;

        fs.renameSync(path, newPath);

        const { token } = req.cookies;
        jwt.verify(token, salt2, {}, async (error, info) => {
            if (error) {
                return res.status(401).json({ message: "Invalid token" });
            }

            const { title, summary, content } = req.body;
            const post = await Post.create({
                title,
                summary,
                content,
                cover: newPath,
                author: info.id,
            });

            res.json(post);
        });
    } catch (error) {
        if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'File size exceeds the limit (100MB)' });
        } else {
            console.error('Error creating post:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
});


app.put('/post', uploadMiddelware.single('file'), async (req, res) => {
    // Handling file upload
    let newPath = null;
    if (req.file) {
        const { originalname, path } = req.file;
        const parts = originalname.split('.');
        const ext = parts[parts.length - 1];
        newPath = path + '.' + ext;

        fs.renameSync(path, newPath);
    }

    // Authenticating user
    const { token } = req.cookies;
    jwt.verify(token, salt2, {}, async (error, info) => {
        if (error) {
            return res.status(401).json({ message: "Invalid token" });
        }

        // Handling post update
        const { id, title, summary, content } = req.body;
        try {
            // Retrieve the existing post data
            const existingPost = await Post.findById(id);

            if (!existingPost) {
                return res.status(404).json({ message: "Post not found" });
            }

            // Check if the current user is the author of the post
            const isAuthor = String(existingPost.author) === String(info.id);
            if (!isAuthor) {
                return res.status(403).json({ message: "You are not the author of this post" });
            }

            let updateFields = {
                title,
                summary,
                content,
                cover: newPath ? newPath : existingPost.cover,
            };

            // Update the post with the new fields
            const updatedPost = await Post.findByIdAndUpdate(id, updateFields, { new: true });

            // If a new image is uploaded, append it to the content of the post
            if (newPath) {
                updatedPost.content += `<img src="${newPath}" alt="Updated Image"/>`;
            }

            res.json(updatedPost);
        } catch (error) {
            console.error('Error updating post:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    });
});



app.get('/post', async (req, res) => {
    res.json(await Post.find()
        .populate('author', ['username'])
        .sort({ createdAt: -1 })
        .limit(20)
    );
})

app.get('/post/:id', async (req, res) => {
    const { id } = req.params;
    const postDoc = await Post.findById(id).populate('author', ["username"]);
    res.json(postDoc);
})
