const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const uploadRoutes = require('./routes/upload');
const calculationRoutes = require('./routes/calculations');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err));


app.use(express.json());
app.use('/upload', uploadRoutes);
app.use('/api', calculationRoutes);

app.get("/", (req, res) => {
    return res.json({
        success: true,
        message: "Your server is up and running....."
    })
})


if (process.env.NODE_ENV !== 'test') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;