import React, { useState, useEffect } from 'react';

// --- REPLACE THE URL BELOW WITH YOUR ACTUAL RAILWAY DOMAIN ---
const BASE_URL = 'https://task-manager-production-b24a.up.railway.app';

function App() {
  const [user, setUser] = useState(null); 
  const [isRegistering, setIsRegistering] = useState(false); 
  const [projects, setProjects] = useState([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newProj, setNewProj] = useState('');

  const fetchAll = async () => {
    try {
      const res = await fetch(`${BASE_URL}/dashboard`);
      if (!res.ok) throw new Error('Backend error');
      const data = await res.json();
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) { 
      console.error("Live Backend offline or URL incorrect:", err); 
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    const path = isRegistering ? '/register' : '/login';
    try {
      const res = await fetch(`${BASE_URL}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: 'ADMIN' })
      });
      
      if (res.ok) {
        setUser({ email, role: 'ADMIN' });
        fetchAll();
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Authentication failed");
      }
    } catch (err) {
      alert("Cannot connect to live backend. Check console.");
    }
  };

  const createProj = async () => {
    if (!newProj) return;
    await fetch(`${BASE_URL}/projects`, {
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
    if(!title) return;
    
    await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, projectId: pid, dueDate: date })
    });
    fetchAll();
  };

  // Dashboard Calculations
  const allTasks = projects.flatMap(p => p.tasks || []);
  const overdueCount = allTasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date()).length;

  // LOGIN / REGISTER VIEW
  if (!user) return (
    <div style={{ backgroundColor: '#0d1117', color: 'white', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'sans-serif' }}>
      <div style={{ background: '#161b22', padding: '40px', borderRadius: '12px', border: '1px solid #30363d', width: '350px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>🚀 {isRegistering ? 'Create Account' : 'Admin Login'}</h1>
        <form onSubmit={handleAuth}>
          <input type="email" placeholder="Email" required onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '6px', background: '#0d1117', color: 'white', border: '1px solid #30363d', boxSizing: 'border-box' }} />
          <input type="password" placeholder="Password" required onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '6px', background: '#0d1117', color: 'white', border: '1px solid #30363d', boxSizing: 'border-box' }} />
          <button type="submit" style={{ width: '100%', padding: '12px', background: '#238636', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
            {isRegistering ? 'Sign Up' : 'Enter Control Center'}
          </button>
        </form>
        <button onClick={() => setIsRegistering(!isRegistering)} style={{ background: 'none', border: 'none', color: '#58a6ff', marginTop: '20px', cursor: 'pointer', fontSize: '14px' }}>
          {isRegistering ? 'Already have an account? Login' : 'Need an account? Sign Up'}
        </button>
      </div>
    </div>
  );

  // MAIN DASHBOARD VIEW
  return (
    <div style={{ backgroundColor: '#0d1117', color: 'white', minHeight: '100vh', padding: '40px', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <h1 style={{ margin: 0 }}>🚀 ADMIN <span style={{ color: '#58a6ff' }}>Control Center</span></h1>
        <button onClick={() => setUser(null)} style={{ color: '#f85149', background: 'none', border: '1px solid #f85149', padding: '8px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Logout</button>
      </header>

      {/* Stats Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px', marginBottom: '40px' }}>
        <div style={{ background: '#161b22', padding: '25px', borderRadius: '12px', border: '1px solid #30363d', textAlign: 'center' }}>
          <h2 style={{ fontSize: '32px', margin: '0 0 10px 0' }}>{projects.length}</h2>
          <p style={{ color: '#8b949e', margin: 0, fontWeight: 'bold', fontSize: '14px' }}>PROJECTS</p>
        </div>
        <div style={{ background: '#161b22', padding: '25px', borderRadius: '12px', border: '1px solid #30363d', textAlign: 'center' }}>
          <h2 style={{ fontSize: '32px', margin: '0 0 10px 0' }}>{allTasks.length}</h2>
          <p style={{ color: '#8b949e', margin: 0, fontWeight: 'bold', fontSize: '14px' }}>TASKS DONE</p>
        </div>
        <div style={{ background: '#161b22', padding: '25px', borderRadius: '12px', border: `1px solid ${overdueCount > 0 ? '#f85149' : '#30363d'}`, textAlign: 'center' }}>
          <h2 style={{ fontSize: '32px', margin: '0 0 10px 0', color: overdueCount > 0 ? '#f85149' : 'white' }}>{overdueCount}</h2>
          <p style={{ color: overdueCount > 0 ? '#f85149' : '#8b949e', margin: 0, fontWeight: 'bold', fontSize: '14px' }}>OVERDUE ITEMS</p>
        </div>
      </div>

      {/* Create Project Bar */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '40px' }}>
        <input value={newProj} onChange={e => setNewProj(e.target.value)} placeholder="New Project Name..." style={{ flex: 1, padding: '15px', background: '#0d1117', color: 'white', border: '1px solid #30363d', borderRadius: '8px' }} />
        <button onClick={createProj} style={{ background: '#238636', color: 'white', border: 'none', padding: '0 30px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Deploy Project</button>
      </div>

      {/* Projects Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px' }}>
        {projects.map(p => (
          <div key={p.id} style={{ background: '#161b22', padding: '20px', borderRadius: '12px', border: '1px solid #30363d' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ margin: 0, color: '#58a6ff' }}>📁 {p.name}</h3>
              <button onClick={() => createTask(p.id)} style={{ background: '#30363d', color: 'white', border: 'none', padding: '5px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>+ Task</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {p.tasks && p.tasks.length > 0 ? p.tasks.map(t => (
                <div key={t.id} style={{ background: '#0d1117', padding: '10px', borderRadius: '6px', border: '1px solid #30363d', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px' }}>
                  <span>{t.title}</span>
                  {t.dueDate && new Date(t.dueDate) < new Date() && (
                    <span style={{ color: '#f85149', fontSize: '10px', fontWeight: 'bold', border: '1px solid #f85149', padding: '2px 5px', borderRadius: '4px' }}>OVERDUE</span>
                  )}
                </div>
              )) : <p style={{ color: '#8b949e', fontSize: '12px', textAlign: 'center' }}>No tasks assigned yet.</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;