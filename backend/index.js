const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// CORS
app.use(cors());

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const jobRoutes = require("./routes/jobroutes");
const candidateRoutes = require('./routes/candidateroutes');

const applicationRoutes = require('./routes/applicationroutes');

// API routes
app.use("/api/jobs", jobRoutes);
app.use('/api/candidates', candidateRoutes);

app.use('/api/applications', applicationRoutes);

// Serve frontend
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/photo', express.static(path.join(__dirname, '..', 'photo')));

// Default page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'login.html'));
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

