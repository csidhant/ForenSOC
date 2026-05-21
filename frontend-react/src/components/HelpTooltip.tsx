import React from 'react';
import { Tooltip, Box, Typography } from '@mui/material';
import { HelpOutline as HelpIcon } from '@mui/icons-material';

interface HelpTooltipProps {
  title: string;
  description: string;
  children?: React.ReactNode;
  placement?:
    | 'top'
    | 'right'
    | 'bottom'
    | 'left'
    | 'top-start'
    | 'top-end'
    | 'right-start'
    | 'right-end'
    | 'bottom-start'
    | 'bottom-end'
    | 'left-start'
    | 'left-end';
}

/**
 * HelpTooltip Component
 * Provides contextual help for UI elements
 *
 * Usage:
 * <HelpTooltip title="Alert Severity" description="Critical alerts require immediate action" />
 */
const HelpTooltip: React.FC<HelpTooltipProps> = ({
  title,
  description,
  children,
  placement = 'right',
}) => {
  return (
    <Tooltip
      title={
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
            {title}
          </Typography>
          <Typography variant="caption" sx={{ lineHeight: 1.4 }}>
            {description}
          </Typography>
        </Box>
      }
      placement={placement}
      arrow
      sx={{
        '& .MuiTooltip-tooltip': {
          backgroundColor: '#1f2937',
          color: '#fff',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          padding: '12px',
          fontSize: '0.875rem',
          borderRadius: '8px',
        },
        '& .MuiTooltip-arrow': {
          color: '#1f2937',
        },
      }}
    >
      <span>{children || <HelpIcon sx={{ fontSize: 18, cursor: 'help', opacity: 0.7, ml: 0.5 }} />}</span>
    </Tooltip>
  );
};

export default HelpTooltip;
