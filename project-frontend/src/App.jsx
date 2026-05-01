import React, { useState, useEffect } from 'react';

function App() {
  const [user, setUser] = useState(null); // Starts at login page
  const [isRegistering, setIsRegistering] = useState(false); 
  const [projects, setProjects] = useState([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newProj, setNewProj] = useState('');

  const fetchAll = async () => {
    try {
      const res = await fetch('http://localhost:3000/dashboard');
      const data = await res.json();
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) { console.error("Backend offline"); }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    const path = isRegistering ? '/register' : '/login';
    const res = await fetch(`http://localhost:3000${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role: 'ADMIN' })
    });
    if (res.ok) {
      setUser({ email, role: 'ADMIN' });
      fetchAll();
    } else { alert("Auth failed - check terminal"); }
  };

  const createProj = async () => {
    if (!newProj) return;
    await fetch('http://localhost:3000/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newProj })
    });
    setNewProj('');
    fetchAll();
  };

  const createTask = async (pid) => {
    const title = prompt("Task Name?");
    const date = prompt("Due Date (YYYY-MM-DD)?", "2023-01-01");
    await fetch('http://localhost:3000/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, projectId: pid, dueDate: date })
    });
    fetchAll();
  };

  // Dashboard Stats
  const allTasks = projects.flatMap(p => p.tasks || []);
  const overdueCount = allTasks.filter(t => new Date(t.dueDate) < new Date()).length;

  if (!user) return (
    <div style={{ backgroundColor: '#0d1117', color: 'white', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ background: '#161b22', padding: '40px', borderRadius: '12px', border: '1px solid #30363d', width: '350px', textAlign: 'center' }}>
        <h1>🚀 {isRegistering ? 'Register' : 'Login'}</h1>
        <form onSubmit={handleAuth}>
          <input type="email" placeholder="Email" onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '5px', background: '#0d1117', color: 'white', border: '1px solid #333' }} />
          <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '20px', borderRadius: '5px', background: '#0d1117', color: 'white', border: '1px solid #333' }} />
          <button type="submit" style={{ width: '100%', padding: '10px', background: '#238636', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            {isRegistering ? 'Create Account' : 'Enter Admin Center'}
          </button>
        </form>
        <button onClick={() => setIsRegistering(!isRegistering)} style={{ background: 'none', border: 'none', color: '#58a6ff', marginTop: '15px', cursor: 'pointer' }}>
          {isRegistering ? 'Have an account? Login' : 'Need an account? Sign Up'}
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ backgroundColor: '#0d1117', color: 'white', minHeight: '100vh', padding: '40px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
        <h1>📊 ADMIN <span style={{ color: '#58a6ff' }}>Control Center</span></h1>
        <button onClick={() => setUser(null)} style={{ color: '#f85149', background: 'none', border: '1px solid #f85149', padding: '5px 15px', borderRadius: '5px', cursor: 'pointer' }}>Logout</button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
        <div style={{ background: '#161b22', padding: '20px', borderRadius: '10px', border: '1px solid #30363d', textAlign: 'center' }}>
          <h2>{projects.length}</h2><p>PROJECTS</p>
        </div>
        <div style={{ background: '#161b22', padding: '20px', borderRadius: '10px', border: '1px solid #30363d', textAlign: 'center' }}>
          <h2>{allTasks.length}</h2><p>TASKS DONE</p>
        </div>
        <div style={{ background: '#161b22', padding: '20px', borderRadius: '10px', border: '1px solid #f85149', textAlign: 'center' }}>
          <h2 style={{ color: '#f85149' }}>{overdueCount}</h2><p>OVERDUE ITEMS</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
        <input value={newProj} onChange={e => setNewProj(e.target.value)} placeholder="Project Name..." style={{ flex: 1, padding: '12px', background: '#0d1117', color: 'white', border: '1px solid #333', borderRadius: '5px' }} />
        <button onClick={createProj} style={{ background: '#238636', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Deploy Project</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {projects.map(p => (
          <div key={p.id} style={{ background: '#161b22', padding: '20px', borderRadius: '10px', border: '1px solid #30363d' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <h3 style={{ color: '#58a6ff' }}>📁 {p.name}</h3>
              <button onClick={() => createTask(p.id)}>+ Task</button>
            </div>
            {p.tasks?.map(t => (
              <div key={t.id} style={{ borderTop: '1px solid #333', padding: '8px 0', marginTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <span>{t.title}</span>
                {new Date(t.dueDate) < new Date() && <span style={{ color: '#f85149', fontSize: '10px' }}>OVERDUE</span>}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;