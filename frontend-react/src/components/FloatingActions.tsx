import React, { useState } from 'react';
import { Box, Fab, Tooltip, Zoom, useTheme } from '@mui/material';
import {
  Shield as ShieldIcon,
  Search as SearchIcon,
  FolderOpen as CaseIcon,
  Book as BookIcon,
  Map as TourIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface FloatingActionsProps {
  onOpenSearch: () => void;
  onOpenGlossary: () => void;
}

const FloatingActions: React.FC<FloatingActionsProps> = ({ onOpenSearch, onOpenGlossary }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const actions = [
    {
      icon: <SearchIcon />,
      name: 'Global Search (Ctrl+K)',
      onClick: () => {
        setOpen(false);
        onOpenSearch();
      },
      color: 'secondary',
    },
    {
      icon: <CaseIcon />,
      name: 'Create Case',
      onClick: () => {
        setOpen(false);
        navigate('/cases');
      },
      color: 'primary',
    },
    {
      icon: <BookIcon />,
      name: 'DFIR Glossary',
      onClick: () => {
        setOpen(false);
        onOpenGlossary();
      },
      color: 'info',
    },
    {
      icon: <TourIcon />,
      name: 'Guided Onboarding',
      onClick: () => {
        setOpen(false);
        navigate('/onboarding');
      },
      color: 'warning',
    },
  ];

  return (
    <Box
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      sx={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        display: 'flex',
        flexDirection: 'column-reverse',
        alignItems: 'center',
        gap: 1.5,
        zIndex: theme.zIndex.speedDial,
      }}
    >
      {/* Main Trigger FAB */}
      <Tooltip title={open ? 'Close Quick Actions' : 'Expand Quick Actions'} placement="left" arrow>
        <Fab
          color="primary"
          aria-label="expand"
          onClick={() => setOpen((prev) => !prev)}
          sx={{
            background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
            boxShadow: '0 8px 32px rgba(59,130,246,0.4)',
            transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            transform: open ? 'rotate(135deg)' : 'none',
            '&:hover': {
              boxShadow: '0 12px 40px rgba(59,130,246,0.6)',
            },
          }}
        >
          <ShieldIcon sx={{ fontSize: 24, color: '#fff' }} />
        </Fab>
      </Tooltip>

      {/* Expanded Actions */}
      {actions.map((action, index) => (
        <Zoom
          key={index}
          in={open}
          style={{ transitionDelay: `${index * 50}ms` }}
          unmountOnExit
        >
          <Tooltip title={action.name} placement="left" arrow>
            <Fab
              size="small"
              color={action.color as any}
              aria-label={action.name}
              onClick={action.onClick}
              sx={{
                boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'scale(1.15)',
                },
              }}
            >
              {action.icon}
            </Fab>
          </Tooltip>
        </Zoom>
      ))}
    </Box>
  );
};

export default FloatingActions;
