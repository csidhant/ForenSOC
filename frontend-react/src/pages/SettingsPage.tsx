import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';

const SettingsPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        Settings
      </Typography>

      <Card>
        <CardContent>
          <Typography color="textSecondary">
            Settings page coming soon.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SettingsPage;
