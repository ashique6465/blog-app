
const path = require('path'); 
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/User');
const Post = require('./models/Post');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const fs = require('fs');
// Node.js path module

// const __dirname = path.resolve()


// Direct configuration
const MONGODB_URI = 'mongodb+srv://ertugal37:wEoXe1U5tQUz5vRO@cluster0.4iv3f6r.mongodb.net/test?retryWrites=true&w=majority';
const PORT = 4000;
const SECRET_KEY = 'asdfe45we45w345wegw345werjktjwertkj';

// Constants
const salt = bcrypt.genSaltSync(10);
const secret = SECRET_KEY;

// Initialize app
const app = express();
const uploadMiddleware = multer({ dest: 'uploads/' });



// Middleware
// app.use(cors({ credentials: true, origin: 'https://blog-app-ozlp.vercel.app' }));
const allowedOrigins = ['https://dynamic-sable-8ca422.netlify.app']; // Add allowed origins

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow credentials (cookies)
  optionsSuccessStatus: 200, // Some browsers (e.g. Chrome) have issues with 204 responses for preflight requests
}));

// Respond to preflight requests for all routes
app.options('*', cors());


app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Failed to connect to MongoDB', err));

// Routes

// Register
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const userDoc = await User.create({
      username,
      password: bcrypt.hashSync(password, salt),
    });
    res.json(userDoc);
  } catch (e) {
    console.log(e);
    res.status(400).json(e);
  }
});

// Login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const userDoc = await User.findOne({ username });
  if (!userDoc) return res.status(400).json('User not found');

  const passOk = bcrypt.compareSync(password, userDoc.password);
  if (passOk) {
    jwt.sign({ username, id: userDoc._id }, secret, {}, (err, token) => {
      if (err) throw err;
      res.cookie('token', token).json({
        id: userDoc._id,
        username,
      });
    });
  } else {
    res.status(400).json('Wrong credentials');
  }
});

// Profile
app.get('/profile', (req, res) => {
  const { token } = req.cookies;
  jwt.verify(token, secret, {}, (err, info) => {
    if (err) return res.status(401).json('Unauthorized');
    res.json(info);
  });
});

// Logout
app.post('/logout', (req, res) => {
  res.cookie('token', '', { expires: new Date(0) }).json('ok');
});

// Create Post
app.post('/post', uploadMiddleware.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const { originalname, path: tempPath } = req.file;
  const ext = path.extname(originalname); // Use path.extname correctly
  const newPath = tempPath + ext;
  fs.renameSync(tempPath, newPath);

  const { token } = req.cookies;
  jwt.verify(token, secret, {}, async (err, info) => {
    if (err) return res.status(401).json('Unauthorized');

    const { title, summary, content } = req.body;
    try {
      const postDoc = await Post.create({
        title,
        summary,
        content,
        cover: newPath,
        author: info.id,
      });
      res.json(postDoc);
    } catch (e) {
      res.status(400).json(e);
    }
  });
});

// Update Post
app.put('/post', uploadMiddleware.single('file'), async (req, res) => {
  let newPath = null;

  // Handle optional file upload
  if (req.file) {
    const { originalname, path: tempPath } = req.file;
    const ext = path.extname(originalname);
    newPath = tempPath + ext;
    fs.renameSync(tempPath, newPath);
  }

  const { token } = req.cookies;
  jwt.verify(token, secret, {}, async (err, info) => {
    if (err) return res.status(401).json('Unauthorized');

    const { id, title, summary, content } = req.body;
    const postDoc = await Post.findById(id);
    if (!postDoc) return res.status(404).json('Post not found');

    const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
    if (!isAuthor) return res.status(403).json('You are not the author');

    // Update post fields
    postDoc.title = title;
    postDoc.summary = summary;
    postDoc.content = content;
    postDoc.cover = newPath ? newPath : postDoc.cover;

    await postDoc.save(); // Use save() to persist changes
    res.json(postDoc);
  });
});

// Get Posts
app.get('/post', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', ['username'])
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(posts);
  } catch (e) {
    res.status(400).json(e);
  }
});

// Get Single Post
app.get('/post/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const postDoc = await Post.findById(id).populate('author', ['username']);
    if (!postDoc) return res.status(404).json('Post not found');
    res.json(postDoc);
  } catch (e) {
    res.status(400).json(e);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
