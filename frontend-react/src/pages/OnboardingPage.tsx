import React from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Stepper,
  Step,
  StepLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Alert,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Dashboard as DashboardIcon,
  Folder as FolderIcon,
  FileUpload as UploadIcon,
  Shield as ShieldIcon,
  TrendingUp as TrendingIcon,
  CheckCircle as CheckIcon,
  Lightbulb as TipIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@utils/store';

const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [activeStep, setActiveStep] = React.useState(0);

  const steps = ['Welcome', 'Key Concepts', 'Investigation Workflow', 'Getting Started', 'Quick Actions'];

  const getRoleSpecificGuide = () => {
    const role = user?.role?.toLowerCase() || 'viewer';

    const guides: Record<string, any> = {
      admin: {
        title: 'Admin Dashboard',
        description: 'Manage users, configure rules, and monitor system health',
        actions: [
          { label: 'Go to Settings', icon: <ShieldIcon />, path: '/settings' },
          { label: 'View Detection Rules', icon: <TrendingIcon />, path: '/detection-rules' },
          { label: 'Audit Logs', icon: <ShieldIcon />, path: '/audit' },
        ],
      },
      analyst: {
        title: 'Analyst Dashboard',
        description: 'Investigate alerts, manage cases, and analyze evidence',
        actions: [
          { label: 'View Alerts', icon: <ShieldIcon />, path: '/alerts' },
          { label: 'Create Case', icon: <FolderIcon />, path: '/cases' },
          { label: 'Evidence Vault', icon: <UploadIcon />, path: '/evidence' },
        ],
      },
      investigator: {
        title: 'Investigator Dashboard',
        description: 'Deep-dive forensic analysis and evidence collection',
        actions: [
          { label: 'View Cases', icon: <FolderIcon />, path: '/cases' },
          { label: 'Forensics Tools', icon: <TrendingIcon />, path: '/forensics' },
          { label: 'Timeline Builder', icon: <TrendingIcon />, path: '/timeline' },
        ],
      },
      viewer: {
        title: 'Viewer Dashboard',
        description: 'View reports and case summaries (read-only access)',
        actions: [
          { label: 'View Cases', icon: <FolderIcon />, path: '/cases' },
          { label: 'View Reports', icon: <TrendingIcon />, path: '/reports' },
          { label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
        ],
      },
    };

    return guides[role] || guides.viewer;
  };

  const roleGuide = getRoleSpecificGuide();

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      navigate('/dashboard');
    } else {
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4, textAlign: 'center', color: 'white' }}>
          <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
            🛡️ Welcome to ForenSOC
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            Advanced Security Operations & Digital Forensics Platform
          </Typography>
        </Box>

        {/* Stepper */}
        <Box sx={{ mb: 4 }}>
          <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Step Content */}
          <Paper sx={{ p: 4 }}>
            {activeStep === 0 && (
              <Box>
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
                  👋 Hello, {user?.username || 'Analyst'}!
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary', lineHeight: 1.8 }}>
                  ForenSOC is a comprehensive Security Operations Center (SOC) and Digital Forensics platform designed to help you investigate security incidents, analyze evidence, and generate forensic reports.
                </Typography>
                <Alert icon={<InfoIcon />} severity="info" sx={{ mb: 3 }}>
                  <Typography variant="body2">
                    Your Role: <strong>{user?.role}</strong> - You have access to {roleGuide.description}
                  </Typography>
                </Alert>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    This quick tour will show you how to get started in just a few minutes.
                  </Typography>
                </Box>
              </Box>
            )}

            {activeStep === 1 && (
              <Box>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
                  📚 Key Concepts
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 1 }}>
                          Alerts 🚨
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Security events detected by Sigma rules. Severity-coded by risk level.
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 1 }}>
                          Cases 📂
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Incident investigations that group related alerts and evidence.
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 1 }}>
                          Evidence 🔍
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Forensic artifacts with chain-of-custody integrity tracking (MD5/SHA-256).
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 1 }}>
                          Forensics 🧬
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          YARA scans, memory analysis, PCAP parsing, and timeline building.
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            )}

            {activeStep === 2 && (
              <Box>
                <Typography variant="h5" sx={{ mb: 1, fontWeight: 'bold' }}>
                  🔗 How Everything Connects
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  ForenSOC follows a real-world SOC investigation pipeline. Here&apos;s how to go from raw log data all the way to a finished forensic report:
                </Typography>

                {/* Pipeline visual */}
                <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                  {[
                    { emoji: '📥', label: 'Logs', sub: 'Raw data from systems', color: '#3B82F6' },
                    { emoji: '🚨', label: 'Alerts', sub: 'Suspicious activity flagged by rules', color: '#EF4444' },
                    { emoji: '📂', label: 'Cases', sub: 'Group alerts into an investigation', color: '#F59E0B' },
                    { emoji: '🔍', label: 'Evidence', sub: 'Upload & verify forensic files', color: '#8B5CF6' },
                    { emoji: '📄', label: 'Reports', sub: 'Document and export findings', color: '#10B981' },
                  ].map((item, idx, arr) => (
                    <React.Fragment key={item.label}>
                      <Box
                        sx={{
                          textAlign: 'center',
                          p: 1.5,
                          borderRadius: 2,
                          border: `2px solid ${item.color}`,
                          minWidth: 100,
                          bgcolor: `${item.color}18`,
                        }}
                      >
                        <Typography sx={{ fontSize: 28 }}>{item.emoji}</Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: item.color }}>
                          {item.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.3, mt: 0.5 }}>
                          {item.sub}
                        </Typography>
                      </Box>
                      {idx < arr.length - 1 && (
                        <Typography sx={{ fontSize: 22, color: 'text.disabled', flexShrink: 0 }}>→</Typography>
                      )}
                    </React.Fragment>
                  ))}
                </Box>

                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Where to start?</strong> Go to <strong>Logs</strong> to explore raw data, then check <strong>Alerts</strong> to see what ForenSOC flagged automatically.
                    Open a <strong>Case</strong> to track your investigation, upload <strong>Evidence</strong>, and generate a <strong>Report</strong> when done.
                  </Typography>
                </Alert>

                <Alert severity="warning">
                  <Typography variant="body2">
                    <strong>Student tip:</strong> MITRE ATT&amp;CK and Timeline are bonus tools — use them to classify attack techniques and reconstruct the attack timeline once you understand the basics.
                  </Typography>
                </Alert>
              </Box>
            )}

            {activeStep === 3 && (
              <Box>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
                  🚀 Getting Started
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
                  Here&apos;s what you should do first:
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <CheckIcon color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Check the Dashboard"
                      secondary="See real-time alerts, statistics, and threat overview"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckIcon color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Review Recent Alerts"
                      secondary="Understand what threats have been detected"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckIcon color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Create Your First Case"
                      secondary="Group related alerts and start an investigation"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckIcon color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Upload Evidence"
                      secondary="Add files to the evidence vault with integrity verification"
                    />
                  </ListItem>
                </List>

                <Alert icon={<TipIcon />} severity="warning" sx={{ mt: 3 }}>
                  <Typography variant="body2">
                    💡 Tip: Hover over field labels for help text and explanations of technical terms.
                  </Typography>
                </Alert>
              </Box>
            )}

            {activeStep === 4 && (
              <Box>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
                  ⚡ Quick Actions for {user?.role}
                </Typography>
                <Grid container spacing={2}>
                  {roleGuide.actions.map((action: any) => (
                    <Grid item xs={12} sm={6} md={4} key={action.path}>
                      <Card
                        sx={{
                          cursor: 'pointer',
                          transition: 'all 0.3s',
                          '&:hover': { boxShadow: 3, transform: 'translateY(-4px)' },
                        }}
                        onClick={() => handleNavigate(action.path)}
                      >
                        <CardContent sx={{ textAlign: 'center' }}>
                          <Box sx={{ fontSize: 32, mb: 1 }}>{action.icon}</Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                            {action.label}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {/* Navigation Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button disabled={activeStep === 0} onClick={handleBack}>
                Back
              </Button>
              <Button
                variant="contained"
                onClick={handleNext}
                startIcon={activeStep === steps.length - 1 ? <PlayIcon /> : undefined}
              >
                {activeStep === steps.length - 1 ? 'Go to Dashboard' : 'Next'}
              </Button>
            </Box>
          </Paper>
        </Box>

        {/* Skip Option */}
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Button
            color="inherit"
            onClick={() => navigate('/dashboard')}
            sx={{ color: 'white', opacity: 0.8, '&:hover': { opacity: 1 } }}
          >
            Skip Tour
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default OnboardingPage;
