require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');

const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const jobOffersRouter = require('./routes/jobOffers');
const browseRoutes = require('./routes/browse');

const app = express();
const PORT = process.env.PORT || 30052;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/uploads', express.static('uploads'));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        maxAge: 24 * 60 * 60 * 1000,
    },
}));

app.get('/api', (req, res) => {
    res.json({ status: 'ok', message: 'LetoCroatia backend is running!' });
});

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/job-offers', jobOffersRouter);
app.use('/api/browse', browseRoutes);

// Deploy - serve React frontend
const reactBuildPath = path.join(__dirname, './dist');
app.use(express.static(reactBuildPath));
app.get('/*splat', (req, res) => {
    res.sendFile(path.join(reactBuildPath, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});