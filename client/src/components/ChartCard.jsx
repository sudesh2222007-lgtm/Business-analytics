export default function ChartCard({ title, note, children }) {
  return (
    <div className="card-panel">
      <div className="card-header">
        <div className="card-title">{title}</div>
        {note && <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{note}</div>}
      </div>
      {children}
    </div>
  );
}
