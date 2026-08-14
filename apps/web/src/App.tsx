import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { careService, CareTask, Priority, TaskStatus } from './services/careService';

type Filter = 'all' | 'high' | 'pending' | 'completed';

const PRIORITY_COLOR: Record<Priority, string> = {
  high: '#B91C1C',
  medium: '#92400E',
  low: '#166534',
};
const PRIORITY_BG: Record<Priority, string> = {
  high: '#FEE2E2',
  medium: '#FEF3C7',
  low: '#DCFCE7',
};

function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span style={{
      background: PRIORITY_BG[priority],
      color: PRIORITY_COLOR[priority],
      borderRadius: 20,
      padding: '2px 10px',
      fontSize: 12,
      fontWeight: 600,
    }}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  );
}

function formatDue(d: string): string {
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86_400_000).toISOString().split('T')[0];
  if (d === today) return 'Today';
  if (d === tomorrow) return 'Tomorrow';
  if (d < today) return 'Overdue';
  return d;
}

export default function App() {
  const [tasks, setTasks] = useState<CareTask[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [filter, setFilter] = useState<Filter>('all');
  const [completing, setCompleting] = useState<string | null>(null);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const data = await careService.getCareTasks();
      setTasks(data);
      setStatus('idle');
    } catch {
      setStatus('error');
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo<CareTask[]>(() => {
    switch (filter) {
      case 'high': return tasks.filter(t => t.priority === 'high');
      case 'pending': return tasks.filter(t => t.status === 'pending');
      case 'completed': return tasks.filter(t => t.status === 'completed');
      default: return tasks;
    }
  }, [tasks, filter]);

  const urgentCount = tasks.filter(t => t.priority === 'high' && t.status === 'pending').length;
  const pendingCount = tasks.filter(t => t.status === 'pending').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;

  const handleComplete = async (task: CareTask) => {
    setCompleting(task.id);
    try {
      const updated = await careService.updateTask(task.id, { status: 'completed' });
      setTasks(prev => prev.map(t => (t.id === updated.id ? updated : t)));
    } catch {
      alert('Failed to update task. Please try again.');
    } finally {
      setCompleting(null);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC' }}>
      <header style={{ background: '#0F4C81', padding: '16px 32px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 700 }}>CareFlow</h1>
        <span style={{ color: '#93C5FD', fontSize: 13 }}>Operations Dashboard</span>
      </header>

      <main style={{ maxWidth: 960, margin: '0 auto', padding: 24 }}>
        {/* Summary counters */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
          {[
            { label: 'Urgent', value: urgentCount, border: '#DC2626', bg: '#FEF2F2' },
            { label: 'Pending', value: pendingCount, border: '#D97706', bg: '#FFFBEB' },
            { label: 'Completed', value: completedCount, border: '#16A34A', bg: '#F0FDF4' },
          ].map(c => (
            <div key={c.label} style={{
              flex: 1, background: c.bg, borderRadius: 10, padding: '16px 20px',
              borderLeft: `4px solid ${c.border}`,
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#1E293B' }}>{c.value}</div>
              <div style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>{c.label}</div>
            </div>
          ))}
        </div>

        {/* Filter bar */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {(['all', 'high', 'pending', 'completed'] as Filter[]).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '6px 16px', borderRadius: 20, border: '1px solid',
              cursor: 'pointer', fontSize: 13, fontWeight: filter === f ? 600 : 400,
              borderColor: filter === f ? '#0F4C81' : '#E2E8F0',
              background: filter === f ? '#0F4C81' : '#F1F5F9',
              color: filter === f ? '#fff' : '#475569',
              transition: 'all 0.15s',
            }}>
              {f === 'high' ? 'High Priority' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
          <div style={{ marginLeft: 'auto' }}>
            <button onClick={load} style={{
              padding: '6px 16px', borderRadius: 20, border: '1px solid #E2E8F0',
              cursor: 'pointer', fontSize: 13, background: '#fff', color: '#475569',
            }}>
              ↻ Refresh
            </button>
          </div>
        </div>

        {/* Content */}
        {status === 'loading' && (
          <div style={{ textAlign: 'center', padding: 64, color: '#64748B' }}>
            Loading care queue...
          </div>
        )}

        {status === 'error' && (
          <div style={{ textAlign: 'center', padding: 64 }}>
            <p style={{ color: '#DC2626', marginBottom: 16 }}>Unable to load care data.</p>
            <button onClick={load} style={{
              background: '#0F4C81', color: '#fff', padding: '10px 24px',
              borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600,
            }}>Retry</button>
          </div>
        )}

        {status === 'idle' && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: 64, color: '#94A3B8' }}>No tasks found.</div>
        )}

        {status === 'idle' && filtered.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 6px' }}>
            <thead>
              <tr style={{ textAlign: 'left' }}>
                {['Patient', 'Task', 'Priority', 'Status', 'Due Date', ''].map(h => (
                  <th key={h} style={{ padding: '8px 12px', fontSize: 12, color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(task => (
                <tr key={task.id} style={{ background: '#fff', opacity: task.status === 'completed' ? 0.65 : 1 }}>
                  <td style={tdStyle}><strong>{task.patientName}</strong></td>
                  <td style={{ ...tdStyle, color: '#475569' }}>{task.title}</td>
                  <td style={tdStyle}><PriorityBadge priority={task.priority} /></td>
                  <td style={tdStyle}>
                    <span style={{
                      color: task.status === 'completed' ? '#16A34A' : '#D97706',
                      fontWeight: 600, fontSize: 13,
                    }}>
                      {task.status === 'completed' ? '✓ Completed' : '● Pending'}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, color: '#94A3B8', fontSize: 13 }}>{formatDue(task.dueDate)}</td>
                  <td style={tdStyle}>
                    {task.status === 'pending' && (
                      <button
                        onClick={() => handleComplete(task)}
                        disabled={completing === task.id}
                        style={{
                          background: completing === task.id ? '#86EFAC' : '#16A34A',
                          color: '#fff', border: 'none', borderRadius: 6,
                          padding: '6px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                        }}
                      >
                        {completing === task.id ? '...' : 'Complete'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}

const tdStyle: React.CSSProperties = {
  padding: '14px 12px',
  borderBottom: '1px solid #F1F5F9',
  fontSize: 14,
  verticalAlign: 'middle',
};
