const express = require('express');
const cors = require('cors');
const multer = require('multer');
const uploadMiddelware = multer({ dest: 'uploads/' })
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();
const Users = require('./models/User');
const mongoose = require('mongoose');

const salt = bcrypt.genSaltSync(10);
const salt2 = 'fvskfvbskjf';

const app = express();
app.use(cookieParser());

const PORT = process.env.PORT || 4000; // Use port from environment variable or default to 4000

app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));
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
    jwt.verify(token, salt2, {}, (error, info) => {
        if (error) throw (error);
        res.json(info)

    })
})

app.post("/logout", (req, res) => {
    res.cookie("token", "").json("ok");
})

app.post('/post', uploadMiddelware.single('file'), (req, res) => {
    res.json({ file: req.file });
})