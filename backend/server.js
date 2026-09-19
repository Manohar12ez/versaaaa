const express = require('express');
const cors = require('cors');
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

const app = express();
const port = process.env.PORT || 5000;
const projectRoot = path.resolve(__dirname, '..');
const dataDir = path.join(__dirname, 'data');
const dbPath = path.join(dataDir, 'db.json');

const defaultDb = {
  profile: {
    name: 'Manohar.U',
    email: 'manoharmanumesh@gmail.com',
    tokenBalance: 120,
    skills: ['Java', 'Python', 'Web Development'],
    skillRequests: []
  },
  skills: [
    { id: 1, name: 'Java', category: 'Programming' },
    { id: 2, name: 'Python', category: 'Programming' },
    { id: 3, name: 'React', category: 'Web Development' },
    { id: 4, name: 'UI/UX Design', category: 'Design' },
    { id: 5, name: 'Cybersecurity', category: 'Security' },
    { id: 6, name: 'Web Development', category: 'Development' }
  ],
  sessions: [
    {
      id: 1,
      title: 'Java Foundations',
      with: 'Rahul',
      time: 'Tomorrow, 5:00 PM',
      status: 'scheduled',
      category: 'Programming',
      description: 'A friendly, hands-on room for anyone ready to make Java feel less intimidating.',
      participants: 8,
      capacity: 18,
      hostInitials: 'RK',
      meetLink: 'https://meet.google.com/atn-mzcp-ijf'
    },
    {
      id: 2,
      title: 'React Build Club',
      with: 'Arjun',
      time: 'Sunday, 3:00 PM',
      status: 'pending',
      category: 'Web Development',
      description: 'Bring a small idea and leave with a working component, plus a few new collaborators.',
      participants: 4,
      capacity: 12,
      hostInitials: 'AS'
    },
    {
      id: 3,
      title: 'Design Better Interfaces',
      with: 'Nisha',
      time: 'Tuesday, 7:30 PM',
      status: 'scheduled',
      category: 'Design',
      description: 'Swap practical UI feedback and learn how small decisions make products easier to use.',
      participants: 11,
      capacity: 20,
      hostInitials: 'NP'
    },
    {
      id: 4,
      title: 'Python for Real Life',
      with: 'Vikram',
      time: 'Wednesday, 6:00 PM',
      status: 'pending',
      category: 'Programming',
      description: 'Build a tiny automation together and discover how much busywork code can remove.',
      participants: 6,
      capacity: 15,
      hostInitials: 'VK'
    },
    {
      id: 5,
      title: 'Speak With Confidence',
      with: 'Meera',
      time: 'Friday, 5:30 PM',
      status: 'scheduled',
      category: 'Communication',
      description: 'A relaxed practice room for presentations, interviews, and telling your story clearly.',
      participants: 9,
      capacity: 16,
      hostInitials: 'MS'
    }
  ],
  users: []
};

function ensureDb() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify(defaultDb, null, 2));
    return structuredClone(defaultDb);
  }

  try {
    const raw = fs.readFileSync(dbPath, 'utf8');
    const parsed = JSON.parse(raw);
    return {
      ...defaultDb,
      ...parsed,
      profile: { ...defaultDb.profile, ...(parsed.profile || {}) },
      skills: parsed.skills || defaultDb.skills,
      sessions: parsed.sessions || defaultDb.sessions,
      users: parsed.users || []
    };
  } catch (error) {
    fs.writeFileSync(dbPath, JSON.stringify(defaultDb, null, 2));
    return structuredClone(defaultDb);
  }
}

const db = ensureDb();

function saveDb() {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'SkillSwap backend is running successfully'
  });
});

app.get('/api/profile', (req, res) => {
  res.json(db.profile);
});

app.get('/api/skills', (req, res) => {
  res.json(db.skills);
});

app.get('/api/sessions', (req, res) => {
  res.json(db.sessions);
});

app.post('/api/auth/signup', (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = db.users.find(user => user.email.toLowerCase() === normalizedEmail);

  if (existingUser) {
    return res.status(409).json({ message: 'User already exists with this email.' });
  }

  const newUser = {
    id: Date.now(),
    name: name.trim(),
    email: normalizedEmail,
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  saveDb();

  res.status(201).json({
    message: 'Signup successful',
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email
    }
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = db.users.find(item => item.email.toLowerCase() === normalizedEmail);

  if (!user || user.passwordHash !== hashPassword(password)) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  res.json({
    message: 'Login successful',
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    }
  });
});

app.post('/api/skills/request', (req, res) => {
  const { skill } = req.body;

  if (!skill) {
    return res.status(400).json({ message: 'Skill name is required.' });
  }

  const skillExists = db.skills.some(item => item.name.toLowerCase() === skill.toLowerCase());

  db.profile.skillRequests = db.profile.skillRequests || [];
  db.profile.skillRequests.push({
    skill,
    requestedAt: new Date().toISOString()
  });

  saveDb();

  res.json({
    message: `Skill request sent for ${skill}`,
    status: 'pending',
    found: skillExists
  });
});

app.post('/api/sessions/join', (req, res) => {
  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({ message: 'Session ID is required.' });
  }

  const target = db.sessions.find(session => session.id === Number(sessionId));

  if (!target) {
    return res.status(404).json({ message: 'Session not found.' });
  }

  const participants = Number(target.participants || 0);
  const capacity = Number(target.capacity || 20);

  if (participants >= capacity) {
    return res.status(409).json({ message: 'This room is full. Try another session.' });
  }

  target.participants = participants + 1;
  target.capacity = capacity;
  target.status = 'scheduled';
  saveDb();

  res.json({
    message: `Joined ${target.title} session successfully`,
    session: target
  });
});

app.post('/api/sessions/accept', (req, res) => {
  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({ message: 'Session ID is required.' });
  }

  const target = db.sessions.find(session => session.id === Number(sessionId));

  if (!target) {
    return res.status(404).json({ message: 'Session not found.' });
  }

  target.status = 'scheduled';
  saveDb();

  res.json({
    message: `Session accepted for ${target.title}`,
    session: target
  });
});

app.use(express.static(projectRoot));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next();
  }

  res.sendFile(path.join(projectRoot, 'index.html'));
});

app.listen(port, () => {
  console.log(`SkillSwap backend running at http://localhost:${port}`);
});
