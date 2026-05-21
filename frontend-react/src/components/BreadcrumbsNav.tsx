import React from 'react';
import { Breadcrumbs, Link as MuiLink, Typography, Box } from '@mui/material';
import { NavigateNext as NavigateNextIcon, Home as HomeIcon } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

export interface BreadcrumbItem {
  label: string;
  path?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbsNavProps {
  items: BreadcrumbItem[];
}

const BreadcrumbsNav: React.FC<BreadcrumbsNavProps> = ({ items }) => {
  return (
    <Breadcrumbs
      separator={<NavigateNextIcon fontSize="small" sx={{ color: 'text.disabled' }} />}
      aria-label="breadcrumb"
      sx={{ mb: 2 }}
    >
      <MuiLink
        component={RouterLink}
        to="/dashboard"
        sx={{
          display: 'flex',
          alignItems: 'center',
          color: 'text.secondary',
          textDecoration: 'none',
          fontSize: '0.8125rem',
          fontWeight: 500,
          '&:hover': { color: 'primary.main' },
        }}
      >
        <HomeIcon sx={{ mr: 0.5, fontSize: 16 }} />
        Dashboard
      </MuiLink>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return isLast ? (
          <Typography
            key={index}
            variant="body2"
            sx={{
              display: 'flex',
              alignItems: 'center',
              color: 'text.primary',
              fontSize: '0.8125rem',
              fontWeight: 600,
            }}
          >
            {item.icon && (
              <Box component="span" sx={{ mr: 0.5, display: 'flex', alignItems: 'center' }}>
                {item.icon}
              </Box>
            )}
            {item.label}
          </Typography>
        ) : (
          <MuiLink
            key={index}
            component={RouterLink}
            to={item.path || '#'}
            sx={{
              display: 'flex',
              alignItems: 'center',
              color: 'text.secondary',
              textDecoration: 'none',
              fontSize: '0.8125rem',
              fontWeight: 500,
              '&:hover': { color: 'primary.main' },
            }}
          >
            {item.icon && (
              <Box component="span" sx={{ mr: 0.5, display: 'flex', alignItems: 'center' }}>
                {item.icon}
              </Box>
            )}
            {item.label}
          </MuiLink>
        );
      })}
    </Breadcrumbs>
  );
};

export default BreadcrumbsNav;
