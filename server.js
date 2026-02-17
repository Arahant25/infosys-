const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const SECRET_KEY = 'your-secret-key'; // Change this in production

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname))); // Serve static files

// Helper to read/write JSON files
const readData = (file) => {
  if (fs.existsSync(file)) {
    return JSON.parse(fs.readFileSync(file));
  }
  return [];
};

const writeData = (file, data) => {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
};

// User registration
app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  const users = readData('users.json');
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ id: Date.now(), name, email, password: hashedPassword });
  writeData('users.json', users);
  res.json({ message: 'User registered successfully' });
});

// User login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const users = readData('users.json');
  const user = users.find(u => u.email === email);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY);
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

// Submit admission inquiry
app.post('/submit-admission', (req, res) => {
  const { name, mobile, course } = req.body;
  const inquiries = readData('inquiries.json');
  inquiries.push({ id: Date.now(), type: 'admission', name, mobile, course });
  writeData('inquiries.json', inquiries);
  res.json({ message: 'Admission inquiry submitted' });
});

// Submit contact inquiry
app.post('/submit-contact', (req, res) => {
  const { name, email, message } = req.body;
  const inquiries = readData('inquiries.json');
  inquiries.push({ id: Date.now(), type: 'contact', name, email, message });
  writeData('inquiries.json', inquiries);
  res.json({ message: 'Contact inquiry submitted' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
