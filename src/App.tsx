import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import './App.css';

type Range = '7 days' | '30 days' | '90 days';
type Metric = 'Visitors' | 'Sessions' | 'Conversions';
type Channel = 'All channels' | 'Organic search' | 'Direct' | 'Social' | 'Referral' | 'Email';
type PageRow = { page: string; path: string; views: number; change: number; time: string; rate: string; channel: Exclude<Channel, 'All channels'> };
type Note = { id: number; title: string; body: string; date: string };

type Campaign = { name: string; channel: Exclude<Channel, 'All channels'>; spend: number; conversions: number; roas: string; status: 'Active' | 'Learning' | 'Paused' };

const pageRows: PageRow[] = [
  { page: 'Home page', path: '/', views: 28450, change: 12.8, time: '01:42', rate: '42.6%', channel: 'Direct' },
  { page: 'Shop / All products', path: '/shop', views: 18920, change: 8.4, time: '02:18', rate: '36.2%', channel: 'Organic search' },
  { page: 'Wireless headphones', path: '/products/headphones', views: 12680, change: 18.2, time: '03:06', rate: '28.7%', channel: 'Organic search' },
  { page: 'About us', path: '/about', views: 8420, change: -2.3, time: '01:14', rate: '51.4%', channel: 'Direct' },
  { page: 'Offers & deals', path: '/deals', views: 7190, change: 21.6, time: '02:42', rate: '24.1%', channel: 'Social' },
  { page: 'Summer collection', path: '/collections/summer', views: 6540, change: 14.3, time: '02:11', rate: '31.8%', channel: 'Email' },
  { page: 'Shipping information', path: '/shipping', views: 4280, change: -1.8, time: '00:58', rate: '48.2%', channel: 'Referral' },
  { page: 'Contact & support', path: '/contact', views: 3610, change: 6.2, time: '01:36', rate: '33.5%', channel: 'Direct' },
];

const dataset: Record<Range, Record<Metric, number[]>> = {
  '7 days': {
    Visitors: [34, 45, 39, 58, 49, 68, 61, 75, 66, 82, 71, 90],
    Sessions: [28, 38, 36, 48, 44, 60, 54, 68, 60, 75, 67, 82],
    Conversions: [15, 22, 18, 29, 26, 37, 32, 44, 39, 50, 45, 58],
  },
  '30 days': {
    Visitors: [28, 35, 32, 46, 42, 39, 56, 51, 63, 58, 73, 68, 77, 65, 82, 76, 89, 80, 94, 86, 99, 89, 105, 97],
    Sessions: [24, 31, 29, 39, 36, 34, 47, 44, 54, 50, 63, 59, 66, 57, 70, 67, 78, 72, 83, 77, 88, 80, 92, 86],
    Conversions: [12, 18, 15, 23, 22, 19, 29, 27, 33, 30, 40, 36, 43, 37, 48, 44, 53, 49, 59, 55, 64, 58, 69, 63],
  },
  '90 days': {
    Visitors: [19, 27, 24, 35, 31, 43, 39, 47, 44, 58, 52, 66, 61, 71, 68, 80, 74, 88, 81, 96, 90, 103, 96, 114],
    Sessions: [16, 23, 21, 30, 27, 37, 34, 41, 38, 50, 46, 57, 53, 62, 59, 70, 65, 77, 71, 84, 79, 90, 85, 99],
    Conversions: [8, 13, 11, 18, 16, 24, 21, 28, 26, 35, 31, 41, 38, 45, 43, 52, 48, 59, 54, 65, 60, 69, 66, 78],
  },
};

const rangeStats: Record<Range, { visitors: string; sessions: string; conversion: string; engagement: string; visitorsChange: string; sessionsChange: string; conversionChange: string; engagementChange: string }> = {
  '7 days': { visitors: '11,284', sessions: '14,291', conversion: '3.81%', engagement: '2m 51s', visitorsChange: '6.4%', sessionsChange: '4.9%', conversionChange: '0.4%', engagementChange: '1.2%' },
  '30 days': { visitors: '48,294', sessions: '62,817', conversion: '3.62%', engagement: '2m 48s', visitorsChange: '12.8%', sessionsChange: '8.4%', conversionChange: '0.6%', engagementChange: '2.1%' },
  '90 days': { visitors: '132,845', sessions: '176,302', conversion: '3.74%', engagement: '2m 54s', visitorsChange: '16.1%', sessionsChange: '11.7%', conversionChange: '1.3%', engagementChange: '0.8%' },
};

const channelData: { name: Exclude<Channel, 'All channels'>; percentage: number; color: string; sessions: number }[] = [
  { name: 'Organic search', percentage: 42, color: 'var(--chart-a)', sessions: 26383 },
  { name: 'Direct', percentage: 27, color: 'var(--chart-b)', sessions: 16960 },
  { name: 'Social', percentage: 18, color: 'var(--chart-c)', sessions: 11307 },
  { name: 'Referral', percentage: 9, color: 'var(--chart-d)', sessions: 5653 },
  { name: 'Email', percentage: 4, color: 'var(--chart-e)', sessions: 2514 },
];

const campaigns: Campaign[] = [
  { name: 'Autumn essentials', channel: 'Organic search', spend: 1250, conversions: 184, roas: '4.8×', status: 'Active' },
  { name: 'Welcome series', channel: 'Email', spend: 420, conversions: 96, roas: '6.2×', status: 'Active' },
  { name: 'Social discovery', channel: 'Social', spend: 890, conversions: 72, roas: '2.9×', status: 'Learning' },
  { name: 'Brand protection', channel: 'Direct', spend: 310, conversions: 54, roas: '5.1×', status: 'Active' },
  { name: 'Partner referrals', channel: 'Referral', spend: 275, conversions: 31, roas: '2.4×', status: 'Paused' },
];

const navItems = [
  { name: 'Overview', icon: '◫', helper: 'Your performance at a glance' },
  { name: 'Acquisition', icon: '↗', helper: 'Understand where visitors come from' },
  { name: 'Audience', icon: '◎', helper: 'Explore visitors and devices' },
  { name: 'Content', icon: '▤', helper: 'Discover your most engaging pages' },
  { name: 'Conversions', icon: '◉', helper: 'Follow the path from visit to action' },
];

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(value);
}

function money(value: number) {
  return new Intl.NumberFormat('en-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
}

function Icon({ children }: { children: ReactNode }) {
  return <span className="icon" aria-hidden="true">{children}</span>;
}

function Sparkline({ values, color = 'var(--chart-a)' }: { values: number[]; color?: string }) {
  const points = values.map((v, i) => `${(i / (values.length - 1)) * 100},${38 - (v / Math.max(...values)) * 32}`).join(' ');
  return <svg className="sparkline" viewBox="0 0 100 42" preserveAspectRatio="none" aria-hidden="true"><polyline points={points} fill="none" stroke={color} strokeWidth="2.7" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function LineChart({ values, metric, showComparison }: { values: number[]; metric: Metric; showComparison: boolean }) {
  const width = 820;
  const height = 280;
  const padX = 15;
  const padY = 18;
  const max = Math.max(...values) * 1.12;
  const points = values.map((value, i) => ({
    x: padX + (i / (values.length - 1)) * (width - padX * 2),
    y: height - padY - (value / max) * (height - padY * 2),
    value,
  }));
  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const area = `${line} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;
  const comparisonPoints = points.map((p, i) => ({ x: p.x, y: Math.min(height - padY, p.y + 26 + Math.sin(i * 1.4) * 9) }));
  const comparisonLine = comparisonPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  return (
    <svg className="main-chart" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" role="img" aria-label={`${metric} trend chart`}>
      <defs><linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--chart-a)" stopOpacity=".24"/><stop offset="100%" stopColor="var(--chart-a)" stopOpacity="0.01"/></linearGradient></defs>
      {[0, 1, 2, 3, 4].map((n) => <line key={n} x1="0" x2={width} y1={n * (height / 4)} y2={n * (height / 4)} className="chart-gridline" />)}
      {showComparison && <path d={comparisonLine} fill="none" stroke="var(--chart-compare)" strokeWidth="2.4" strokeDasharray="5 6" strokeLinecap="round" vectorEffect="non-scaling-stroke" />}
      <path d={area} fill="url(#chartFill)" />
      <path d={line} fill="none" stroke="var(--chart-a)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      {points.filter((_, i) => i === points.length - 1 || i === Math.floor(points.length * .55)).map((p, i) => <g key={i}><circle cx={p.x} cy={p.y} r="8" fill="var(--panel)" stroke="var(--chart-a)" strokeWidth="3"/><circle cx={p.x} cy={p.y} r="3" fill="var(--chart-a)"/><title>{`${metric}: index value ${p.value}`}</title></g>)}
    </svg>
  );
}

function readLocal<T>(key: string, fallback: T): T {
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [range, setRange] = useState<Range>('30 days');
  const [metric, setMetric] = useState<Metric>('Visitors');
  const [activeNav, setActiveNav] = useState('Overview');
  const [search, setSearch] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showTopProfileMenu, setShowTopProfileMenu] = useState(false);
  const [toast, setToast] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [compareEnabled, setCompareEnabled] = useState(true);
  const [selectedChannel, setSelectedChannel] = useState<Channel>('All channels');
  const [sortViewsAsc, setSortViewsAsc] = useState(false);
  const [showAnnotationModal, setShowAnnotationModal] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteBody, setNoteBody] = useState('');
  const [notes, setNotes] = useState<Note[]>(() => readLocal<Note[]>('pulseboard-notes', []));
  const [notificationsRead, setNotificationsRead] = useState(false);

  const chartValues = dataset[range][metric];
  const stats = rangeStats[range];
  const filteredRows = useMemo(() => {
    const rows = pageRows.filter((row) => `${row.page} ${row.path}`.toLowerCase().includes(search.toLowerCase().trim()) && (selectedChannel === 'All channels' || row.channel === selectedChannel));
    return rows.sort((a, b) => sortViewsAsc ? a.views - b.views : b.views - a.views);
  }, [search, selectedChannel, sortViewsAsc]);
  const filteredCampaigns = useMemo(() => campaigns.filter((campaign) => selectedChannel === 'All channels' || campaign.channel === selectedChannel), [selectedChannel]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    window.localStorage.setItem('pulseboard-notes', JSON.stringify(notes));
  }, [notes]);

  const announce = (message: string) => setToast(message);

  const exportReport = () => {
    const header = 'Page,Path,Views,Change,Average time,Bounce rate,Main channel';
    const rows = filteredRows.map((row) => [row.page, row.path, row.views, `${row.change}%`, row.time, row.rate, row.channel].map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(','));
    const summary = [`Pulseboard analytics demo — ${range}`, `Metric selected: ${metric}`, `Channel filter: ${selectedChannel}`, ''];
    const blob = new Blob([[...summary, header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pulseboard-report-${range.replace(' ', '-')}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    announce('CSV report downloaded');
  };

  const addAnnotation = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const title = noteTitle.trim();
    const body = noteBody.trim();
    if (!title || !body) return;
    const note: Note = { id: Date.now(), title, body, date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) };
    setNotes((current) => [note, ...current].slice(0, 6));
    setNoteTitle('');
    setNoteBody('');
    setShowAnnotationModal(false);
    announce('Annotation saved to this browser');
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedChannel('All channels');
    setSortViewsAsc(false);
  };

  return (
    <div className={`app-layout ${darkMode ? 'dark-mode' : ''}`}>
      <aside className="sidebar">
        <a className="brand" href="#dashboard" aria-label="Pulseboard home">
          <span className="brand-mark"><span>p</span><i /></span>
          <span className="brand-copy"><strong>pulseboard<span>.</span></strong><small>INSIGHTS STUDIO</small></span>
        </a>

        <div className="workspace-picker">
          <div className="workspace-avatar">HM</div>
          <div className="workspace-text"><strong>HPMart Store</strong><small>Sample workspace</small></div>
          <span className="picker-chevron">⌄</span>
        </div>

        <div className="sidebar-label">ANALYTICS</div>
        <nav className="side-nav" aria-label="Analytics navigation">
          {navItems.map((item) => (
            <button className={activeNav === item.name ? 'side-link active' : 'side-link'} key={item.name} onClick={() => { setActiveNav(item.name); if (item.name !== 'Overview') announce(`${item.name} view selected`); }}>
              <Icon>{item.icon}</Icon><span>{item.name}</span>{item.name === 'Conversions' && <b className="nav-dot" />}
            </button>
          ))}
        </nav>

        <div className="sidebar-label reports-label">QUICK REPORTS</div>
        <button className="side-link muted-link" onClick={() => { setMetric('Visitors'); setActiveNav('Acquisition'); announce('Traffic performance report selected'); }}><Icon>⌁</Icon><span>Traffic performance</span></button>
        <button className="side-link muted-link" onClick={() => { setMetric('Conversions'); setActiveNav('Conversions'); announce('Conversion report selected'); }}><Icon>◎</Icon><span>Conversion report</span></button>
        <button className="side-link muted-link" onClick={() => { setSelectedChannel('Email'); setActiveNav('Acquisition'); announce('Email channel selected'); }}><Icon>✉</Icon><span>Email campaigns</span></button>

        <div className="sidebar-spacer" />
        <div className="sidebar-help">
          <div className="help-icon">✳</div>
          <strong>Make data useful.</strong>
          <p>Explore trends, compare periods and save notes about what changed.</p>
          <button onClick={() => setShowAnnotationModal(true)}>Add an insight <span>↗</span></button>
        </div>
        <div className="sidebar-profile">
          <div className="profile-avatar">HP</div>
          <div><strong>Hema Pasupathy</strong><small>Demo administrator</small></div>
          <button aria-label="Profile options" onClick={() => setShowProfileMenu(!showProfileMenu)}>•••</button>
          {showProfileMenu && <div className="profile-popover"><strong>Workspace settings</strong><span>Pulseboard · HPMart Store</span><button onClick={() => { setDarkMode((value) => !value); setShowProfileMenu(false); announce(darkMode ? 'Light theme enabled' : 'Dark theme enabled'); }}>Switch to {darkMode ? 'light' : 'dark'} theme</button><button onClick={() => { setShowProfileMenu(false); announce('Demo using illustrative data, not connected to GA4.'); }}>About this demo</button></div>}
        </div>
      </aside>

      <main className="main-area" id="dashboard">
        <header className="topbar">
          <div className="breadcrumbs"><span>HPMart Store</span><b>/</b><strong>{activeNav}</strong><span className="demo-pill">DEMO DATA</span></div>
          <div className="topbar-actions">
            <div className="status-live"><span /> Demo report ready</div>
            <button className="icon-button theme-button" aria-label="Toggle colour theme" title="Toggle theme" onClick={() => setDarkMode((value) => !value)}>{darkMode ? '☼' : '◐'}</button>
            <button className="icon-button notification-button" aria-label="Notifications" onClick={() => { setShowNotifications(!showNotifications); setNotificationsRead(true); }}>♧{!notificationsRead && <i />}</button>
            {showNotifications && <div className="notifications-popover"><div className="popover-title"><strong>Activity inbox</strong><span>Latest updates</span></div><div className="notification-item"><span className="notification-mark green">↗</span><div><strong>Organic traffic is leading</strong><p>Search accounts for the largest share of demo sessions.</p><small>Analytics insight</small></div></div><div className="notification-item"><span className="notification-mark purple">✳</span><div><strong>Your report is ready</strong><p>Use Export report to download the visible page data.</p><small>Workspace</small></div></div><button className="popover-dismiss" onClick={() => setShowNotifications(false)}>Close inbox</button></div>}
            <div className="topbar-divider" />
            <button className="top-profile" onClick={() => setShowTopProfileMenu(!showTopProfileMenu)}><span className="top-profile-avatar">HP</span><span><strong>Hema</strong><small>Workspace admin</small></span><b>⌄</b></button>
            {showTopProfileMenu && <div className="top-profile-popover"><strong>Hema Pasupathy</strong><span>Demo workspace administrator</span><button onClick={() => { setDarkMode((value) => !value); setShowTopProfileMenu(false); announce(darkMode ? 'Light theme enabled' : 'Dark theme enabled'); }}>Switch to {darkMode ? 'light' : 'dark'} theme</button><button onClick={() => { setShowTopProfileMenu(false); announce('Pulseboard is a portfolio demo using illustrative analytics data.'); }}>About Pulseboard</button></div>}
          </div>
        </header>

        <div className="content-wrap">
          <section className="page-heading">
            <div><div className="eyebrow"><span className="eyebrow-dot" /> LIVE WORKSPACE · SAMPLE ANALYTICS</div><h1>{activeNav === 'Overview' ? 'Your performance, in focus.' : `${activeNav}, in focus.`}</h1><p>{navItems.find((item) => item.name === activeNav)?.helper ?? 'Your website performance at a glance.'} · Review trends for the selected period.</p></div>
            <div className="heading-actions"><label className="range-picker"><Icon>▦</Icon><select value={range} onChange={(e) => setRange(e.target.value as Range)} aria-label="Date range"><option>7 days</option><option>30 days</option><option>90 days</option></select><span>⌄</span></label><button className="outline-button" onClick={() => setShowAnnotationModal(true)}><span>＋</span> Add note</button><button className="export-button" onClick={exportReport}><span>↓</span> Export CSV</button></div>
          </section>

          {activeNav !== 'Overview' && <div className="view-notice"><span>✳</span><div><strong>{activeNav} report</strong><p>This report view focuses the dashboard on {activeNav.toLowerCase()}. All figures are illustrative, and the shared controls below remain interactive.</p></div><button onClick={() => setActiveNav('Overview')}>Back to overview</button></div>}

          <section className="kpi-grid" aria-label="Key performance indicators">
            <article className="kpi-card kpi-featured"><div className="kpi-top"><span className="kpi-label">Total visitors</span><span className="kpi-icon lime">↗</span></div><div className="kpi-value">{stats.visitors}</div><div className="kpi-foot"><span>{compareEnabled ? <b className="change positive">↗ {stats.visitorsChange}</b> : <b className="no-compare">Comparison off</b>} vs previous period</span><Sparkline values={[20, 28, 23, 34, 30, 42, 38, 48, 42, 56, 61]} color="var(--chart-a)" /></div></article>
            <article className="kpi-card"><div className="kpi-top"><span className="kpi-label">Sessions</span><span className="kpi-icon teal">⌁</span></div><div className="kpi-value">{stats.sessions}</div><div className="kpi-foot"><span>{compareEnabled ? <b className="change positive">↗ {stats.sessionsChange}</b> : <b className="no-compare">Comparison off</b>} vs previous period</span><Sparkline color="var(--chart-b)" values={[20, 26, 25, 34, 31, 42, 39, 45, 43, 51, 59]} /></div></article>
            <article className="kpi-card"><div className="kpi-top"><span className="kpi-label">Conversion rate</span><span className="kpi-icon coral">◎</span></div><div className="kpi-value">{stats.conversion}</div><div className="kpi-foot"><span>{compareEnabled ? <b className="change positive">↗ {stats.conversionChange}</b> : <b className="no-compare">Comparison off</b>} vs previous period</span><Sparkline color="var(--chart-c)" values={[25, 30, 27, 38, 34, 37, 46, 40, 51, 48, 58]} /></div></article>
            <article className="kpi-card"><div className="kpi-top"><span className="kpi-label">Avg. engagement</span><span className="kpi-icon lavender">◷</span></div><div className="kpi-value">{stats.engagement}</div><div className="kpi-foot"><span>{compareEnabled ? <b className="change negative">↘ {stats.engagementChange}</b> : <b className="no-compare">Comparison off</b>} vs previous period</span><Sparkline color="var(--chart-d)" values={[52, 45, 48, 40, 44, 38, 40, 34, 37, 31, 33]} /></div></article>
          </section>

          <div className="controls-row"><div className="control-note"><span className="control-pulse" /> Reporting period: <strong>{range}</strong><span className="control-separator">·</span> Values are demonstration data</div><label className="compare-toggle"><input type="checkbox" checked={compareEnabled} onChange={(event) => setCompareEnabled(event.target.checked)} /><span className="switch-track" /><span>Compare to previous period</span></label></div>

          <section className="analytics-grid">
            <article className="panel traffic-panel">
              <div className="panel-header"><div><span className="panel-kicker">PERFORMANCE TREND</span><h2>Traffic over time</h2><p>Spot the peaks, dips and momentum in your selected metric.</p></div><span className="panel-index">01</span></div>
              <div className="chart-summary"><strong>{metric === 'Visitors' ? stats.visitors : metric === 'Sessions' ? stats.sessions : range === '7 days' ? '431' : range === '30 days' ? '1,749' : '4,962'} <span className="change positive">↗ {metric === 'Visitors' ? stats.visitorsChange : metric === 'Sessions' ? stats.sessionsChange : stats.conversionChange}</span></strong><small>Total {metric.toLowerCase()} · {range.toLowerCase()}</small></div>
              <div className="chart-wrap"><div className="chart-y-labels"><span>High</span><span>75%</span><span>50%</span><span>25%</span><span>0</span></div><LineChart values={chartValues} metric={metric} showComparison={compareEnabled} /></div>
              <div className="chart-x-labels"><span>Start</span><span>{range === '7 days' ? 'Day 2' : range === '30 days' ? 'Week 1' : 'Month 1'}</span><span>{range === '7 days' ? 'Day 4' : range === '30 days' ? 'Week 2' : 'Month 2'}</span><span>End</span></div>
              <div className="chart-footer"><div className="legend"><i /> Current period {compareEnabled && <><i className="legend-muted" /> Previous period</>}</div><div className="metric-tabs">{(['Visitors', 'Sessions', 'Conversions'] as Metric[]).map((m) => <button key={m} className={metric === m ? 'selected' : ''} onClick={() => setMetric(m)}>{m}</button>)}</div></div>
            </article>

            <article className="panel channels-panel">
              <div className="panel-header"><div><span className="panel-kicker">ACQUISITION MIX</span><h2>Traffic sources</h2><p>Select a channel to filter the reports below.</p></div><span className="panel-index">02</span></div>
              <div className="channel-total"><strong>{formatNumber(range === '7 days' ? 14291 : range === '30 days' ? 62817 : 176302)}</strong><span><i /> {compareEnabled ? '+8.4% vs previous period' : 'Comparison disabled'}</span></div>
              <div className="channel-bars">{channelData.map((channel) => <button className={`channel-row ${selectedChannel === channel.name ? 'channel-selected' : ''}`} key={channel.name} onClick={() => { setSelectedChannel(selectedChannel === channel.name ? 'All channels' : channel.name); announce(selectedChannel === channel.name ? 'Showing all channels' : `${channel.name} selected`); }}><div className="channel-meta"><span><i style={{ background: channel.color }} />{channel.name}</span><strong>{formatNumber(Math.round(channel.sessions * (range === '7 days' ? .22 : range === '90 days' ? 2.8 : 1)))}</strong></div><div className="bar-track"><span style={{ width: `${channel.percentage}%`, background: channel.color }} /></div><small>{channel.percentage}% of sessions</small></button>)}</div>
              <button className="text-link" onClick={() => { setActiveNav('Acquisition'); announce('Acquisition report selected'); }}>Explore acquisition <span>→</span></button>
            </article>
          </section>

          <section className="mid-grid">
            <article className="panel funnel-panel"><div className="panel-header"><div><span className="panel-kicker">CONVERSION JOURNEY</span><h2>From visit to value</h2><p>See how the sample audience moves through the funnel.</p></div><span className="panel-index">03</span></div><div className="funnel-list"><div className="funnel-row"><div className="funnel-label"><span className="funnel-num">01</span><span>Website visits</span><strong>{range === '7 days' ? '14.3k' : range === '30 days' ? '62.8k' : '176.3k'}</strong></div><div className="funnel-track"><span style={{ width: '100%' }} /></div></div><div className="funnel-row"><div className="funnel-label"><span className="funnel-num">02</span><span>Product views</span><strong>{range === '7 days' ? '8.9k' : range === '30 days' ? '38.4k' : '108.1k'}</strong></div><div className="funnel-track"><span style={{ width: '61%', background: 'var(--chart-b)' }} /></div><small>61% of visits</small></div><div className="funnel-row"><div className="funnel-label"><span className="funnel-num">03</span><span>Added to cart</span><strong>{range === '7 days' ? '2.4k' : range === '30 days' ? '10.7k' : '29.5k'}</strong></div><div className="funnel-track"><span style={{ width: '28%', background: 'var(--chart-c)' }} /></div><small>28% of visits</small></div><div className="funnel-row"><div className="funnel-label"><span className="funnel-num">04</span><span>Completed actions</span><strong>{range === '7 days' ? '545' : range === '30 days' ? '2.3k' : '6.6k'}</strong></div><div className="funnel-track"><span style={{ width: '11%', background: 'var(--chart-d)' }} /></div><small>11% of visits</small></div></div><div className="funnel-insight"><span>↗</span><div><strong>Opportunity detected</strong><p>Review the add-to-cart step for potential friction.</p></div></div></article>

            <article className="panel devices-panel"><div className="panel-header"><div><span className="panel-kicker">AUDIENCE DEVICES</span><h2>Device mix</h2><p>Where visitors browse.</p></div><span className="panel-index">04</span></div><div className="device-chart-area"><div className="donut"><div className="donut-center"><strong>48.3k</strong><small>Visitors</small></div></div></div><div className="device-legend"><div><span><i className="device-dot desktop" />Desktop</span><strong>54.2%</strong></div><div><span><i className="device-dot mobile" />Mobile</span><strong>38.6%</strong></div><div><span><i className="device-dot tablet" />Tablet</span><strong>7.2%</strong></div></div><div className="device-note"><span>✳</span> Desktop is the leading device category in this sample.</div></article>
          </section>

          <section className="lower-grid">
            <article className="panel pages-panel" id="pages-panel"><div className="panel-header pages-header"><div><span className="panel-kicker">CONTENT PERFORMANCE</span><h2>Top pages</h2><p>Search, filter and sort your leading pages.</p></div><label className="table-search"><span>⌕</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search pages..." aria-label="Search pages" /></label></div><div className="table-tools"><label>Channel <select value={selectedChannel} onChange={(event) => setSelectedChannel(event.target.value as Channel)}><option>All channels</option>{channelData.map((channel) => <option key={channel.name}>{channel.name}</option>)}</select></label><button onClick={() => setSortViewsAsc((current) => !current)}>Views {sortViewsAsc ? '↑ ascending' : '↓ descending'}</button><button onClick={clearFilters}>Reset filters</button></div><div className="table-scroll"><table><thead><tr><th>PAGE</th><th>VIEWS</th><th>CHANGE</th><th>AVG. TIME</th><th>BOUNCE</th></tr></thead><tbody>{filteredRows.map((row) => <tr key={row.path}><td><div className="page-cell"><span className="page-icon">↗</span><span><strong>{row.page}</strong><small>{row.path}</small></span></div></td><td className="views-cell">{formatNumber(Math.round(row.views * (range === '7 days' ? .24 : range === '90 days' ? 2.7 : 1)))}</td><td><span className={row.change >= 0 ? 'table-change up' : 'table-change down'}>{row.change >= 0 ? '↗' : '↘'} {Math.abs(row.change).toFixed(1)}%</span></td><td>{row.time}</td><td>{row.rate}</td></tr>)}</tbody></table>{filteredRows.length === 0 && <div className="no-results">No pages match these filters. Try another search or reset the channel.</div>}</div><div className="table-footer"><span>Showing {filteredRows.length} of {pageRows.length} pages</span><button onClick={exportReport}>Export filtered rows ↗</button></div></article>

            <article className="panel campaigns-panel"><div className="panel-header"><div><span className="panel-kicker">CAMPAIGN MONITOR</span><h2>Campaign performance</h2><p>Sample marketing campaign results.</p></div><span className="panel-index">05</span></div><div className="campaign-list">{filteredCampaigns.map((campaign) => <div className="campaign-row" key={campaign.name}><div className="campaign-mark">{campaign.channel === 'Email' ? '✉' : campaign.channel === 'Social' ? '◎' : campaign.channel === 'Referral' ? '↗' : campaign.channel === 'Direct' ? '⌂' : '⌕'}</div><div className="campaign-main"><strong>{campaign.name}</strong><small>{campaign.channel} · {money(campaign.spend)} spend</small><div className={`campaign-status ${campaign.status.toLowerCase()}`}><i />{campaign.status}</div></div><div className="campaign-result"><strong>{campaign.roas}</strong><small>{campaign.conversions} conversions</small></div></div>)}{filteredCampaigns.length === 0 && <p className="campaign-empty">No campaigns match the selected channel.</p>}</div><button className="text-link" onClick={() => { setActiveNav('Acquisition'); announce('Campaign report selected — sample data'); }}>View campaign report <span>→</span></button></article>
          </section>

          <section className="insight-grid"><article className="insight-banner"><div className="insight-icon">✳</div><div className="insight-copy"><span>SMART INSIGHT · SAMPLE DATA</span><h3>Organic search is your strongest acquisition channel.</h3><p>Search contributes the largest share of sample sessions. Improve product landing pages and monitor the add-to-cart stage to find opportunities.</p></div><button onClick={() => { setSelectedChannel('Organic search'); setActiveNav('Acquisition'); document.getElementById('pages-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>Explore insight <span>→</span></button><div className="insight-orb" /></article>
            <article className="panel annotations-panel"><div className="panel-header"><div><span className="panel-kicker">WORKSPACE NOTES</span><h2>Annotations</h2><p>Keep context next to the data.</p></div><button className="add-note-icon" aria-label="Add note" onClick={() => setShowAnnotationModal(true)}>＋</button></div>{notes.length === 0 ? <div className="notes-empty"><span>✎</span><strong>No notes yet</strong><p>Add a short note about a campaign, release, or performance change.</p><button onClick={() => setShowAnnotationModal(true)}>Create first note</button></div> : <div className="notes-list">{notes.map((note) => <div className="note-item" key={note.id}><div><strong>{note.title}</strong><small>{note.date}</small></div><p>{note.body}</p><button aria-label={`Delete note ${note.title}`} onClick={() => { setNotes((current) => current.filter((item) => item.id !== note.id)); announce('Note deleted'); }}>×</button></div>)}</div>}</article>
          </section>

          <footer className="dashboard-footer"><div className="footer-brand"><span className="brand-mark small"><span>p</span><i /></span><strong>pulseboard<span>.</span></strong></div><span>Analytics workspace · Portfolio dashboard project</span><div><span className="footer-live-dot" /> Illustrative data · No live provider connected</div></footer>
        </div>
      </main>

      {showAnnotationModal && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowAnnotationModal(false); }}><section className="annotation-modal" role="dialog" aria-modal="true" aria-labelledby="annotation-heading"><div className="modal-heading"><div><span className="panel-kicker">WORKSPACE</span><h2 id="annotation-heading">Add an annotation</h2><p>Record context for your analytics review.</p></div><button aria-label="Close dialog" onClick={() => setShowAnnotationModal(false)}>×</button></div><form onSubmit={addAnnotation}><label>Note title<input autoFocus value={noteTitle} onChange={(event) => setNoteTitle(event.target.value)} placeholder="e.g. Autumn campaign launched" maxLength={70} required /></label><label>Details<textarea value={noteBody} onChange={(event) => setNoteBody(event.target.value)} placeholder="What changed, and what should the team watch?" rows={4} maxLength={400} required /></label><div className="form-foot"><span>{noteBody.length}/400 characters</span><button type="button" className="cancel-button" onClick={() => setShowAnnotationModal(false)}>Cancel</button><button type="submit" className="export-button">Save note ↗</button></div></form></section></div>}
      {toast && <div className="toast"><span>✓</span>{toast}</div>}
    </div>
  );
}
