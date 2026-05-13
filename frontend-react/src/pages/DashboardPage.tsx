import React, { useEffect, useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  FolderOpen as CaseIcon,
  AlertCircle as AlertIcon,
  TrendingUp as TrendingIcon,
  CheckCircle as ResolvedIcon,
} from '@mui/icons-material';
import { apiService } from '@services/apiService';

interface DashboardStats {
  totalCases: number;
  activeCases: number;
  totalAlerts: number;
  unreviewedAlerts: number;
  resolvedAlerts: number;
}

const StatCard: React.FC<{
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color?: string;
  loading?: boolean;
}> = ({ title, value, icon, color = 'primary', loading = false }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 56,
          height: 56,
          borderRadius: '50%',
          bgcolor: `${color}.lighter` || 'primary.lighter',
        }}
      >
        {icon}
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography color="textSecondary" variant="body2">
          {title}
        </Typography>
        {loading ? (
          <CircularProgress size={24} />
        ) : (
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            {value}
          </Typography>
        )}
      </Box>
    </CardContent>
  </Card>
);

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        // Fetch data from API
        const casesData = await apiService.getCases(1, 100);
        const alertsData = await apiService.getAlerts(undefined, 1, 100);

        setStats({
          totalCases: casesData.total || 0,
          activeCases: casesData.items?.filter((c: any) => c.status === 'open').length || 0,
          totalAlerts: alertsData.total || 0,
          unreviewedAlerts: alertsData.items?.filter((a: any) => a.status === 'unreviewed').length || 0,
          resolvedAlerts: alertsData.items?.filter((a: any) => a.status === 'resolved').length || 0,
        });
      } catch (err: any) {
        setError('Failed to load dashboard statistics');
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Cases"
            value={stats?.totalCases || 0}
            icon={<CaseIcon sx={{ color: 'primary.main' }} />}
            loading={loading}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Cases"
            value={stats?.activeCases || 0}
            icon={<TrendingIcon sx={{ color: 'warning.main' }} />}
            loading={loading}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Alerts"
            value={stats?.totalAlerts || 0}
            icon={<AlertIcon sx={{ color: 'error.main' }} />}
            loading={loading}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Resolved Alerts"
            value={stats?.resolvedAlerts || 0}
            icon={<ResolvedIcon sx={{ color: 'success.main' }} />}
            loading={loading}
          />
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            System Health
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                API Connection
              </Typography>
              <LinearProgress variant="determinate" value={100} />
            </Box>
            <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 600 }}>
              OK
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ mt: 4, p: 2, bgcolor: 'info.lighter', borderRadius: 1 }}>
        <Typography variant="body2" sx={{ color: 'info.dark' }}>
          💡 <strong>Tip:</strong> Navigate through Cases, Alerts, and Reports using the menu above to manage your investigations.
        </Typography>
      </Box>
    </Box>
  );
};

export default DashboardPage;
