const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use((req, res, next) => {
    console.log(`Received ${req.method} request to ${req.path}`);
    next();
});

// CORS Headers
const corsOptions = {
    origin: ['http://localhost:3001', 'https://blog-app-848g.vercel.app'], // Include both local and production frontend URLs
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Origin,X-Requested-With,Content-Type,Accept,Authorization',
    credentials: true, // Allows sending cookies with requests
};
app.use(cors(corsOptions));

const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR);
}

const uploadMiddleware = multer({
    dest: 'uploads/',
    limits: {
        fileSize: 100 * 1024 * 1024, // 100 MB limit
    }
});

const salt = bcrypt.genSaltSync(10);
const jwtSecret = 'fvskfvbskjf'; // Rename `salt2` to `jwtSecret` for clarity

app.use(cookieParser());
app.use('/uploads', express.static(__dirname + "/uploads"));
app.use(express.json());

const PORT = process.env.PORT || 4000;

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || "mongodb+srv://vasileus45:gQJwPkJRQ2AgPfaE@cluster0.tn3bzsj.mongodb.net/", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});

// Models
const Users = mongoose.model('Users', new mongoose.Schema({
    username: { type: String, unique: true },
    password: String
}));

const Post = mongoose.model('Post', new mongoose.Schema({
    title: String,
    summary: String,
    content: String,
    cover: String,
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
    createdAt: { type: Date, default: Date.now }
}));

// Routes
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const userDoc = await Users.create({
            username,
            password: bcrypt.hashSync(password, salt)
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
            return res.status(404).json({ message: "User not found" });
        }
        const passOk = bcrypt.compareSync(password, userDoc.password);
        if (passOk) {
            jwt.sign({ username, id: userDoc._id }, jwtSecret, {}, (error, token) => {
                if (error) throw error;
                res.cookie('token', token, { httpOnly: true, sameSite: 'None', secure: true }).json({
                    id: userDoc._id,
                    username,
                });
            });
        } else {
            res.status(400).json('Wrong credentials!');
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

    jwt.verify(token, jwtSecret, {}, (error, info) => {
        if (error) {
            return res.status(401).json({ message: "Invalid token" });
        }
        res.json(info);
    });
});

app.post('/logout', (req, res) => {
    res.cookie('token', '', { httpOnly: true, sameSite: 'None', secure: true }).json('ok');
});

app.post('/post', uploadMiddleware.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            throw new Error('No file uploaded');
        }

        const { originalname, path } = req.file;
        const parts = originalname.split('.');
        const ext = parts[parts.length - 1];
        const newPath = path + '.' + ext;

        fs.renameSync(path, newPath);

        const { token } = req.cookies;
        jwt.verify(token, jwtSecret, {}, async (error, info) => {
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

app.put('/post', uploadMiddleware.single('file'), async (req, res) => {
    let newPath = null;
    if (req.file) {
        const { originalname, path } = req.file;
        const parts = originalname.split('.');
        const ext = parts[parts.length - 1];
        newPath = path + '.' + ext;

        fs.renameSync(path, newPath);
    }

    const { token } = req.cookies;
    jwt.verify(token, jwtSecret, {}, async (error, info) => {
        if (error) {
            return res.status(401).json({ message: "Invalid token" });
        }

        const { id, title, summary, content } = req.body;
        try {
            const existingPost = await Post.findById(id);
            if (!existingPost) {
                return res.status(404).json({ message: "Post not found" });
            }

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

            const updatedPost = await Post.findByIdAndUpdate(id, updateFields, { new: true });

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
});

app.get('/post/:id', async (req, res) => {
    const { id } = req.params;
    const postDoc = await Post.findById(id).populate('author', ["username"]);
    res.json(postDoc);
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build/index.html'));
});
