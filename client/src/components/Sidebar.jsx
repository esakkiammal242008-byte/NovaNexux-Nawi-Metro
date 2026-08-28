import { NavLink, useNavigate } from 'react-router-dom'
import { Activity, Bell, Camera, ClipboardCheck, FileCheck2, FileText, Gauge, LayoutDashboard, LogOut, Menu, ScanLine, Settings2, ShieldCheck, SlidersHorizontal, X } from 'lucide-react'

const links = [
  ['/', 'Dashboard', LayoutDashboard], ['instruments', 'Instruments', Gauge], ['tests', 'Tests', ClipboardCheck], ['reports', 'Reports', FileText], ['verify', 'Verify Report', ShieldCheck],
  ['alerts', 'Alerts', Bell], ['audit', 'Audit Logs', FileCheck2], ['simulator', 'Sensor Simulator', SlidersHorizontal], ['camera', 'Camera / OCR', Camera],
]

export default function Sidebar({ open, onClose, alertCount = 0 }) {
  const navigate = useNavigate()
  return <aside className={`sidebar ${open ? 'is-open' : ''}`}>
    <div className="brand"><div className="brand-mark"><Activity size={19} /></div><div><strong>NOVA<span>NEXUS</span></strong><small>METROLOGY OS</small></div><button className="icon-button mobile-only" onClick={onClose} aria-label="Close navigation"><X size={18} /></button></div>
    <div className="workspace-label">WORKSPACE <span>DEMO</span></div>
    <nav>{links.map(([to, label, Icon]) => <NavLink key={to} to={to} end={to === '/'} onClick={onClose}><Icon size={17} /><span>{label}</span>{label === 'Alerts' && alertCount > 0 && <b className="nav-count">{alertCount}</b>}</NavLink>)}</nav>
    <div className="sidebar-bottom"><div className="system-status"><span className="pulse-dot" /> <div><strong>System online</strong><small>Local prototype mode</small></div></div><button className="profile" onClick={() => navigate('/')}><div className="avatar">NT</div><div><strong>NovaNexus Tester</strong><small>Demo tester</small></div><LogOut size={15} /></button></div>
  </aside>
}
