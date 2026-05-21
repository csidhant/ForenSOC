import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  size?: 'small' | 'medium' | 'large';
}

/**
 * EmptyState Component
 * Friendly message when there's no data to display
 *
 * Usage:
 * <EmptyState
 *   icon={<InboxIcon />}
 *   title="No Alerts Yet"
 *   description="When security events are detected, they'll appear here"
 *   action={{
 *     label: "Learn about alerts",
 *     onClick: () => navigate('/help')
 *   }}
 * />
 */
const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  size = 'medium',
}) => {
  const sizeProps = {
    small: { iconSize: 40, titleVariant: 'h6', py: 3 },
    medium: { iconSize: 64, titleVariant: 'h5', py: 6 },
    large: { iconSize: 96, titleVariant: 'h4', py: 8 },
  };

  const props = sizeProps[size];

  return (
    <Paper
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: props.py,
        px: 3,
        textAlign: 'center',
        backgroundColor: 'background.paper',
        borderRadius: 2,
        border: '1px dashed',
        borderColor: 'divider',
      }}
    >
      {icon && (
        <Box
          sx={{
            fontSize: props.iconSize,
            mb: 2,
            opacity: 0.6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
      )}

      <Typography
        variant={props.titleVariant as any}
        sx={{
          fontWeight: 'bold',
          mb: 1,
          color: 'text.primary',
        }}
      >
        {title}
      </Typography>

      <Typography
        variant="body2"
        sx={{
          color: 'text.secondary',
          mb: action ? 3 : 0,
          maxWidth: 400,
          lineHeight: 1.6,
        }}
      >
        {description}
      </Typography>

      {action && (
        <Button
          variant="contained"
          color="primary"
          onClick={action.onClick}
          startIcon={action.icon}
          sx={{ mt: 2 }}
        >
          {action.label}
        </Button>
      )}
    </Paper>
  );
};

export default EmptyState;
