import express from 'express';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import path from 'path';

// Simple in-memory user store (email -> { id, email, passwordHash })
interface UserRec { id: string; email: string; passwordHash: string }
const users = new Map<string, UserRec>();

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const PORT = Number(process.env.PORT) || 3000;

const app = express();
app.use(express.json());

// Basic CORS (vite dev server origin) - adjust for production
app.use((req, res, next) => {
  const origin = req.headers.origin || 'http://localhost:5173';
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Vary', 'Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

function issueToken(user: UserRec) {
  return jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
}

app.post('/api/auth/register', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
  if (typeof email !== 'string' || typeof password !== 'string') return res.status(400).json({ message: 'Invalid payload' });
  if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
  if (users.has(email.toLowerCase())) return res.status(400).json({ message: 'Email already registered' });

  const passwordHash = await bcrypt.hash(password, 10);
  const user: UserRec = { id: crypto.randomUUID(), email: email.toLowerCase(), passwordHash };
  users.set(user.email, user);
  const token = issueToken(user);
  res.status(201).json({ email: user.email, userId: user.id, token });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
  const user = users.get(String(email).toLowerCase());
  if (!user) return res.status(401).json({ message: 'Invalid email or password' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: 'Invalid email or password' });
  const token = issueToken(user);
  res.json({ email: user.email, userId: user.id, token });
});

// Auth middleware
function authenticate(req: any, res: any, next: any) {
  const hdr = req.headers.authorization || '';
  const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Missing token' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    (req as any).user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

app.get('/api/auth/me', authenticate, (req, res) => {
  const decoded = (req as any).user;
  res.json({ email: decoded.email, userId: decoded.sub });
});

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Auth mock server running on http://localhost:${PORT}`);
});
