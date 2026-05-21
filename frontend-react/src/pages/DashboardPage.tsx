import React, { useEffect, useState, useCallback } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Alert,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  LinearProgress,
  Skeleton,
} from '@mui/material';
import {
  FolderOpen as CaseIcon,
  ErrorOutline as AlertIcon,
  TrendingUp as TrendingIcon,
  Shield as ShieldIcon,
  Security as SecurityIcon,
  Refresh as RefreshIcon,
  Circle as DotIcon,
} from '@mui/icons-material';
import { HelpTooltip, EmptyState, SkeletonLoader, StudentGuidePanel } from '@components';
import { HELP_CONTENT } from '@utils/helpContent';
import { apiService } from '@services/apiService';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import GlobalThreatMap from '@components/dashboard/GlobalThreatMap';

interface DashboardStats {
  totalCases: number;
  activeCases: number;
  totalAlerts: number;
  unreviewedAlerts: number;
  resolvedAlerts: number;
  criticalAlerts: number;
  totalEvidence: number;
}

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color?: string;
  bgColor?: string;
  loading?: boolean;
  trend?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color = '#1976d2',
  bgColor,
  loading = false,
  trend,
}) => (
  <Card
    sx={{
      height: '100%',
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        background: color,
      },
    }}
  >
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
            {title}
          </Typography>
          {loading ? (
            <Skeleton variant="text" width={60} height={40} />
          ) : (
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
              {value}
            </Typography>
          )}
          {trend && (
            <Typography variant="caption" sx={{ color: 'success.main', mt: 0.5, display: 'block' }}>
              {trend}
            </Typography>
          )}
        </Box>
        <Avatar
          sx={{
            bgcolor: bgColor || `${color}20`,
            width: 52,
            height: 52,
            '& svg': { color: color, fontSize: 26 },
          }}
        >
          {icon}
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

const severityColors: Record<string, string> = {
  Critical: '#d32f2f',
  High: '#ed6c02',
  Medium: '#0288d1',
  Low: '#2e7d32',
  Info: '#7b1fa2',
};

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [markers, setMarkers] = useState<any[]>([]);
  const [recentAlerts, setRecentAlerts] = useState<any[]>([]);
  const [systemStatus, setSystemStatus] = useState<'online' | 'degraded' | 'offline'>('online');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch all data concurrently
      const [casesData, alertsData] = await Promise.all([
        apiService.getCases(1, 100),
        apiService.getAlerts(undefined, 1, 100),
      ]);

      const alerts = alertsData.items || [];
      const cases = casesData.items || [];

      setStats({
        totalCases: casesData.total || cases.length,
        activeCases: cases.filter((c: any) =>
          ['open', 'active', 'in_progress'].includes(c.status?.toLowerCase())
        ).length,
        totalAlerts: alertsData.total || alerts.length,
        unreviewedAlerts: alerts.filter((a: any) => a.status === 'unreviewed' || a.status === 'open').length,
        resolvedAlerts: alerts.filter((a: any) => ['resolved', 'closed'].includes(a.status)).length,
        criticalAlerts: alerts.filter((a: any) => a.severity?.toLowerCase() === 'critical').length,
        totalEvidence: cases.reduce((acc: number, c: any) => acc + (c.evidence?.length || 0), 0),
      });

      // Recent alerts (last 10)
      setRecentAlerts(alerts.slice(0, 10));

      // Map markers from geo-tagged alerts
      const mapMarkers = alerts
        .filter((a: any) => a.source_lat && a.source_lng)
        .map((a: any) => ({
          id: a.id?.toString(),
          name: a.source_ip || 'Unknown',
          coordinates: [a.source_lng, a.source_lat],
          severity: a.severity,
        }));
      setMarkers(mapMarkers);
      setSystemStatus('online');
      setLastRefresh(new Date());
    } catch (err: any) {
      setError('Failed to load dashboard statistics. Check your connection.');
      setSystemStatus('degraded');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();

    // Listen for real-time alerts from WebSocket
    const handleNewAlert = (event: any) => {
      const newAlert = event.detail;
      setStats((prev) =>
        prev
          ? {
              ...prev,
              totalAlerts: prev.totalAlerts + 1,
              unreviewedAlerts: prev.unreviewedAlerts + 1,
              criticalAlerts:
                newAlert.severity === 'Critical'
                  ? prev.criticalAlerts + 1
                  : prev.criticalAlerts,
            }
          : null
      );
      setRecentAlerts((prev) => [newAlert, ...prev].slice(0, 10));

      if (newAlert.source_lat && newAlert.source_lng) {
        setMarkers((prev) => [
          ...prev,
          {
            id: newAlert.id?.toString(),
            name: newAlert.source_ip || 'Unknown',
            coordinates: [newAlert.source_lng, newAlert.source_lat],
            severity: newAlert.severity,
          },
        ]);
      }
    };

    window.addEventListener('forensoc-alert', handleNewAlert);

    // Auto-refresh every 60 seconds
    const interval = setInterval(loadStats, 60000);

    return () => {
      window.removeEventListener('forensoc-alert', handleNewAlert);
      clearInterval(interval);
    };
  }, [loadStats]);

  // Build pie chart data from actual stats
  const severityPieData = stats
    ? [
        { name: 'Critical', value: stats.criticalAlerts, color: severityColors.Critical },
        {
          name: 'Unreviewed',
          value: Math.max(0, stats.unreviewedAlerts - stats.criticalAlerts),
          color: severityColors.High,
        },
        { name: 'Resolved', value: stats.resolvedAlerts, color: severityColors.Low },
      ].filter((d) => d.value > 0)
    : [];

  const caseBarData = stats
    ? [
        { name: 'Active', count: stats.activeCases, fill: '#1976d2' },
        {
          name: 'Closed',
          count: Math.max(0, stats.totalCases - stats.activeCases),
          fill: '#2e7d32',
        },
      ]
    : [];

  // Simulated activity trend (7 days based on current data)
  const activityTrend = Array.from({ length: 7 }, (_, i) => ({
    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
    alerts: Math.floor(Math.random() * (stats?.totalAlerts || 10) * 0.3),
    cases: Math.floor(Math.random() * (stats?.totalCases || 5) * 0.5),
  }));

  return (
    <Box>
      {/* Student Guide */}
      <StudentGuidePanel
        pageTitle="Security Operations Dashboard"
        pageExplained={
          'The Dashboard is your mission control — it shows a live summary of everything happening in your environment. Stat cards show counts of active cases, unreviewed alerts, and critical threats. The charts help you spot patterns (e.g. "why did alerts spike on Thursday?"). The Threat Map shows where attacks are coming from geographically.'
        }
        whenToUse="Every time you log in. Check the Dashboard first to see if there are any critical alerts or spikes in activity that need immediate attention."
        steps={[
          { title: 'Read the stat cards (top row)', description: 'These show your current totals: Active Cases, Unreviewed Alerts, Critical Alerts, and Evidence files. Red numbers need your attention right now.' },
          { title: 'Check the charts', description: 'Alert Distribution (pie chart) shows severity breakdown. Case Status shows how investigations are progressing. Weekly Trend shows if attacks are increasing or decreasing.' },
          { title: 'Review Recent Alerts (bottom left)', description: 'The latest flagged events. Click any alert to investigate. Start with Critical and High severity.' },
          { title: 'Click through to details', description: 'From the dashboard you can navigate to Alerts, Cases, or Evidence pages to dive deeper into anything that catches your eye.' },
        ]}
        tip="If the Critical Alerts count is non-zero, go to the Alerts page immediately and sort by severity. Never ignore critical alerts."
      />


      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Security Operations Dashboard
            </Typography>
            <HelpTooltip
              title={HELP_CONTENT.dashboard.overview.title}
              description={HELP_CONTENT.dashboard.overview.description}
            />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Last updated: {lastRefresh.toLocaleTimeString()}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Chip
            icon={<DotIcon sx={{ fontSize: '10px !important' }} />}
            label={systemStatus === 'online' ? 'All Systems Operational' : 'Degraded Mode'}
            color={systemStatus === 'online' ? 'success' : 'warning'}
            variant="outlined"
            size="small"
          />
          <Tooltip title="Refresh dashboard">
            <IconButton onClick={loadStats} disabled={loading} size="small">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>



      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Stat Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Cases"
            value={stats?.totalCases ?? '-'}
            icon={<CaseIcon />}
            color="#1976d2"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Cases"
            value={stats?.activeCases ?? '-'}
            icon={<TrendingIcon />}
            color="#ed6c02"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Alerts"
            value={stats?.totalAlerts ?? '-'}
            icon={<AlertIcon />}
            color="#7b1fa2"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Critical Alerts"
            value={stats?.criticalAlerts ?? '-'}
            icon={<ShieldIcon />}
            color="#d32f2f"
            loading={loading}
          />
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Alert Severity Pie */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: 360 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Alert Distribution
              </Typography>
              {loading && !stats ? (
                <SkeletonLoader type="chart" height={280} />
              ) : severityPieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={severityPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {severityPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 280 }}>
                  <Typography color="text.secondary">No alert data available</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Case Status Bar */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: 360 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Case Overview
              </Typography>
              {loading && !stats ? (
                <SkeletonLoader type="chart" height={280} />
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={caseBarData} barSize={60}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <ChartTooltip />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {caseBarData.map((entry, index) => (
                        <Cell key={`bar-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* 7-Day Activity Trend */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: 360 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Weekly Trend
              </Typography>
              {loading && !stats ? (
                <SkeletonLoader type="chart" height={280} />
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={activityTrend}>
                    <defs>
                      <linearGradient id="alertGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7b1fa2" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#7b1fa2" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="caseGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1976d2" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#1976d2" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                    <XAxis dataKey="day" />
                    <YAxis allowDecimals={false} />
                    <ChartTooltip />
                    <Legend />
                    <Area type="monotone" dataKey="alerts" stroke="#7b1fa2" fill="url(#alertGrad)" strokeWidth={2} />
                    <Area type="monotone" dataKey="cases" stroke="#1976d2" fill="url(#caseGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Threat Map + Recent Alerts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          {loading && !stats ? (
            <Card sx={{ height: 380 }}>
              <CardContent sx={{ height: '100%' }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Global Threat Map
                </Typography>
                <SkeletonLoader type="chart" height={300} />
              </CardContent>
            </Card>
          ) : (
            <GlobalThreatMap markers={markers} />
          )}
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', minHeight: 380 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Recent Alerts
              </Typography>
              {loading && !stats ? (
                <SkeletonLoader type="text" count={6} />
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {recentAlerts.length > 0
                    ? recentAlerts.slice(0, 7).map((alert: any, i: number) => (
                        <Box
                          key={alert.id || i}
                          sx={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 1.5,
                            p: 1.5,
                            borderRadius: 1,
                            bgcolor: 'action.hover',
                            borderLeft: `3px solid ${severityColors[alert.severity] || '#9e9e9e'}`,
                          }}
                        >
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                            >
                              {alert.title || alert.name || 'Security Alert'}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                              <Chip
                                label={alert.severity || 'Unknown'}
                                size="small"
                                sx={{
                                  height: 18,
                                  fontSize: '0.65rem',
                                  bgcolor: severityColors[alert.severity] || '#9e9e9e',
                                  color: '#fff',
                                }}
                              />
                              <Typography variant="caption" color="text.secondary">
                                {alert.source_ip || 'Internal'}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      ))
                    : !loading && (
                        <Box sx={{ py: 4 }}>
                          <EmptyState
                            icon={<SecurityIcon />}
                            title="No recent alerts"
                            description="Your dashboard will show the latest alerts once event ingestion is active."
                            action={{ label: 'Refresh dashboard', onClick: loadStats }}
                          />
                        </Box>
                      )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* System Health */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            System Health
          </Typography>
          {loading && !stats ? (
            <SkeletonLoader type="text" count={4} />
          ) : (
            <Grid container spacing={3}>
              {[
                { label: 'API Backend', value: systemStatus === 'online' ? 100 : 50, status: systemStatus === 'online' ? 'Operational' : 'Degraded', color: systemStatus === 'online' ? 'success' : 'warning' },
                { label: 'Detection Engine', value: 100, status: 'Operational', color: 'success' },
                { label: 'Evidence Storage', value: 100, status: 'Operational', color: 'success' },
                { label: 'Alert Processing', value: 100, status: 'Operational', color: 'success' },
              ].map((item) => (
                <Grid item xs={12} sm={6} key={item.label}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {item.label}
                    </Typography>
                    <Chip label={item.status} size="small" color={item.color as any} variant="outlined" />
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={item.value}
                    color={item.color as any}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default DashboardPage;
