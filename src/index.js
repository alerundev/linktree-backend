require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST'],
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Routes
app.use('/api/track', require('./routes/track'));
app.use('/api/admin', require('./routes/admin'));

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
