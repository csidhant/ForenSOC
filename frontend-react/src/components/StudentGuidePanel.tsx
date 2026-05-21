import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Collapse,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Button,
} from '@mui/material';
import {
  School as SchoolIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Lightbulb as TipIcon,
  PlayArrow as PlayIcon,
} from '@mui/icons-material';

export interface StudentStep {
  title: string;
  description: string;
}

export interface StudentQuickAction {
  label: string;
  description: string;
  onClick?: () => void;
}

interface StudentGuidePanelProps {
  pageTitle: string;
  /** Plain-English explanation of what this page does */
  pageExplained: string;
  /** When / why would a student use this page? */
  whenToUse: string;
  steps: StudentStep[];
  tip?: string;
  quickActions?: StudentQuickAction[];
  /** Expand by default (e.g. first visit) */
  defaultOpen?: boolean;
}

const StudentGuidePanel: React.FC<StudentGuidePanelProps> = ({
  pageTitle,
  pageExplained,
  whenToUse,
  steps,
  tip,
  quickActions,
  defaultOpen = false,
}) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Card
      sx={{
        mb: 3,
        border: '1px solid',
        borderColor: 'primary.main',
        background:
          'linear-gradient(135deg, rgba(59,130,246,0.06) 0%, rgba(139,92,246,0.04) 100%)',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      {/* Header row — always visible */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          px: 2,
          py: 1.5,
          cursor: 'pointer',
          userSelect: 'none',
          '&:hover': { bgcolor: 'rgba(59,130,246,0.06)' },
        }}
        onClick={() => setOpen((v) => !v)}
      >
        <SchoolIcon sx={{ color: 'primary.main', mr: 1.5, fontSize: 20, flexShrink: 0 }} />
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main' }}>
            📘 Student Guide — {pageTitle}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {open ? 'Click to collapse' : 'New here? Click to learn how to use this page'}
          </Typography>
        </Box>
        <Chip
          label="Beginner Friendly"
          size="small"
          color="primary"
          variant="outlined"
          sx={{ mr: 1, display: { xs: 'none', sm: 'flex' } }}
        />
        <IconButton size="small" tabIndex={-1}>
          {open ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
        </IconButton>
      </Box>

      {/* Collapsible body */}
      <Collapse in={open}>
        <Divider />
        <CardContent sx={{ pt: 2 }}>
          {/* What is this page */}
          <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.9, color: 'text.primary' }}>
            {pageExplained}
          </Typography>

          {/* When to use */}
          <Box
            sx={{
              p: 1.5,
              borderRadius: 1,
              bgcolor: 'rgba(16,185,129,0.08)',
              border: '1px solid rgba(16,185,129,0.2)',
              mb: 2,
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'success.main' }}>
              🎯 When to use this page:
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary' }}>
              {whenToUse}
            </Typography>
          </Box>

          {/* Step-by-step */}
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
            📋 Step-by-Step for Students:
          </Typography>
          <List dense disablePadding sx={{ mb: 1 }}>
            {steps.map((step, i) => (
              <ListItem key={i} sx={{ py: 0.6, alignItems: 'flex-start' }}>
                <ListItemIcon sx={{ minWidth: 30, mt: 0.3 }}>
                  <Box
                    sx={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      bgcolor: 'primary.main',
                      color: '#fff',
                      fontSize: 11,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {i + 1}
                  </Box>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {step.title}
                    </Typography>
                  }
                  secondary={step.description}
                />
              </ListItem>
            ))}
          </List>

          {/* Pro tip */}
          {tip && (
            <Box
              sx={{
                mt: 1.5,
                p: 1.5,
                borderRadius: 1,
                bgcolor: 'rgba(245,158,11,0.08)',
                border: '1px solid rgba(245,158,11,0.25)',
                display: 'flex',
                gap: 1,
                alignItems: 'flex-start',
              }}
            >
              <TipIcon sx={{ color: 'warning.main', fontSize: 18, mt: 0.15, flexShrink: 0 }} />
              <Typography variant="body2" color="text.secondary">
                <strong>Pro tip:</strong> {tip}
              </Typography>
            </Box>
          )}

          {/* Quick-action buttons */}
          {quickActions && quickActions.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                ⚡ Try These Examples:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {quickActions.map((action, i) => (
                  <Button
                    key={i}
                    size="small"
                    variant="outlined"
                    startIcon={<PlayIcon />}
                    onClick={action.onClick}
                    title={action.description}
                    sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                  >
                    {action.label}
                  </Button>
                ))}
              </Box>
            </Box>
          )}
        </CardContent>
      </Collapse>
    </Card>
  );
};

export default StudentGuidePanel;
