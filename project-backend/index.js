const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');

const app = express();
const prisma = new PrismaClient();
app.use(express.json());
app.use(cors());

app.get('/dashboard', async (req, res) => {
  const projects = await prisma.project.findMany({ include: { tasks: true } });
  res.json(projects);
});

app.post('/register', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const user = await prisma.user.create({ data: { email, password, role } });
    res.json(user);
  } catch (e) { res.status(400).json({ error: "User exists" }); }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (user && user.password === password) res.json(user);
  else res.status(401).json({ error: "Invalid login" });
});

app.post('/projects', async (req, res) => {
  const { name } = req.body;
  const project = await prisma.project.create({ data: { name, description: "" } });
  res.json(project);
});

app.post('/tasks', async (req, res) => {
  const { title, projectId, dueDate } = req.body;
  const task = await prisma.task.create({ 
    data: { title, projectId: parseInt(projectId), status: 'Pending', dueDate: new Date(dueDate) } 
  });
  res.json(task);
});

app.listen(3000, () => console.log('🚀 Backend running on port 3000'));