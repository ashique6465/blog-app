// const express = require('express');
// const cors = require('cors');
// const mongoose = require('mongoose');
// const User = require('./models/User');
// const Post = require('./models/Post');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const cookieParser = require('cookie-parser');
// const multer = require('multer');
// const cloudinary = require('cloudinary').v2;
// const { CloudinaryStorage } = require('multer-storage-cloudinary');

// // Direct Cloudinary configuration
// cloudinary.config({
//   cloud_name: "dkcayxxxb", // Your Cloudinary cloud name
//   api_key: "747647554167144", // Your Cloudinary API key
//   api_secret: "BnV1a9eybWGNGsLeUiBPL3qnF2s", // Your Cloudinary API secret
// });

// // Cloudinary storage setup for Multer
// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: 'uploads',  // Folder name in your Cloudinary account
//     format: async (req, file) => 'jpg',  // Supported formats like jpg, png, etc.
//     public_id: (req, file) => Date.now().toString(),  // Unique identifier for each file
//   },
// });

// const upload = multer({ storage });

// // Directly provided MongoDB URI, PORT, and secret key
// const MONGODB_URI = 'mongodb+srv://ertugal37:wEoXe1U5tQUz5vRO@cluster0.4iv3f6r.mongodb.net/test?retryWrites=true&w=majority';
// const PORT = 4000;
// const SECRET_KEY = 'asdfe45we45w345wegw345werjktjwertkj';
// const CLIENT_URL = 'http://localhost:3000';

// const salt = bcrypt.genSaltSync(10);
// const secret = SECRET_KEY;

// const app = express();

// const allowedOrigins = [CLIENT_URL, 'http://https://blog-app-eight-black.vercel.app'];

// app.use(cors({
//   credentials: true,
//   origin: function (origin, callback) {
//     if (!origin || allowedOrigins.indexOf(origin) !== -1) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   optionsSuccessStatus: 200,
// }));

// app.use(express.json());
// app.use(cookieParser());

// mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log('Connected to MongoDB'))
//   .catch(err => {
//     console.error('Failed to connect to MongoDB', err);
//     process.exit(1);
//   });

// const verifyToken = (req, res, next) => {
//   const { token } = req.cookies;
//   if (!token) return res.status(401).json({ error: 'Unauthorized' });

//   jwt.verify(token, secret, {}, (err, info) => {
//     if (err) return res.status(401).json({ error: 'Invalid token' });
//     req.user = info;
//     next();
//   });
// };

// // Register route
// app.post('/register', async (req, res) => {
//   const { username, password } = req.body;
//   try {
//     const existingUser = await User.findOne({ username });
//     if (existingUser) {
//       return res.status(400).json({ error: 'Username already exists' });
//     }
//     const userDoc = await User.create({
//       username,
//       password: bcrypt.hashSync(password, salt),
//     });
//     res.json({ id: userDoc._id, username: userDoc.username });
//   } catch (e) {
//     console.error('Registration error:', e);
//     res.status(500).json({ error: 'Error during registration' });
//   }
// });

// // Login route
// app.post('/login', async (req, res) => {
//   const { username, password } = req.body;
//   try {
//     const userDoc = await User.findOne({ username });
//     if (!userDoc) return res.status(400).json({ error: 'User not found' });

//     const passOk = bcrypt.compareSync(password, userDoc.password);
//     if (passOk) {
//       jwt.sign({ username, id: userDoc._id }, secret, {}, (err, token) => {
//         if (err) {
//           console.error('JWT sign error:', err);
//           return res.status(500).json({ error: 'Error creating token' });
//         }
//         res.cookie('token', token, { 
//           httpOnly: true, 
//           secure: process.env.NODE_ENV === 'production', 
//           sameSite: 'none',
//         }).json({
//           id: userDoc._id,
//           username,
//         });
//       });
//     } else {
//       res.status(400).json({ error: 'Wrong credentials' });
//     }
//   } catch (e) {
//     console.error('Login error:', e);
//     res.status(500).json({ error: 'Server error during login' });
//   }
// });

// // Profile route
// app.get('/profile', verifyToken, (req, res) => {
//   res.json(req.user);
// });

// // Logout route
// app.post('/logout', (req, res) => {
//   res.cookie('token', '', { 
//     httpOnly: true, 
//     expires: new Date(0), 
//     secure: process.env.NODE_ENV === 'production', 
//     sameSite: 'none',
//   }).json({ message: 'Logged out successfully' });
// });

// // Create post route with Cloudinary image upload
// app.post('/post', verifyToken, upload.single('file'), async (req, res) => {
//   if (!req.file) {
//     return res.status(400).json({ error: 'No file uploaded' });
//   }

//   const { title, summary, content } = req.body;
//   try {
//     const postDoc = await Post.create({
//       title,
//       summary,
//       content,
//       cover: req.file.path,  // Cloudinary URL
//       author: req.user.id,
//     });
//     res.json(postDoc);
//   } catch (e) {
//     console.error('Post creation error:', e);
//     res.status(500).json({ error: 'Error creating post' });
//   }
// });

// // Update post route with optional Cloudinary image upload
// app.put('/post', verifyToken, upload.single('file'), async (req, res) => {
//   let newCoverUrl = null;

//   if (req.file) {
//     newCoverUrl = req.file.path;  // Cloudinary URL for the new image
//   }

//   const { id, title, summary, content } = req.body;
//   try {
//     const postDoc = await Post.findById(id);
//     if (!postDoc) return res.status(404).json({ error: 'Post not found' });

//     const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(req.user.id);
//     if (!isAuthor) return res.status(403).json({ error: 'You are not the author' });

//     postDoc.title = title;
//     postDoc.summary = summary;
//     postDoc.content = content;
//     if (newCoverUrl) {
//       postDoc.cover = newCoverUrl;
//     }

//     await postDoc.save();
//     res.json(postDoc);
//   } catch (e) {
//     console.error('Post update error:', e);
//     res.status(500).json({ error: 'Error updating post' });
//   }
// });

// // Fetch all posts
// app.get('/post', async (req, res) => {
//   try {
//     const posts = await Post.find()
//       .populate('author', ['username'])
//       .sort({ createdAt: -1 })
//       .limit(20);
//     res.json(posts);
//   } catch (e) {
//     console.error('Fetch posts error:', e);
//     res.status(500).json({ error: 'Error fetching posts' });
//   }
// });

// // Fetch a single post
// app.get('/post/:id', async (req, res) => {
//   const { id } = req.params;
//   try {
//     const postDoc = await Post.findById(id).populate('author', ['username']);
//     if (!postDoc) return res.status(404).json({ error: 'Post not found' });
//     res.json(postDoc);
//   } catch (e) {
//     console.error('Fetch single post error:', e);
//     res.status(500).json({ error: 'Error fetching post' });
//   }
// });

// // Global error handler
// app.use((err, req, res, next) => {
//   console.error('Global error handler:', err.stack);
//   res.status(500).json({ error: 'Something went wrong!' });
// });

// // Start the server
// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });

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
const path = require('path'); // Node.js path module

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
const allowedOrigins = ['http://localhost:3000']; // Add allowed origins

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
