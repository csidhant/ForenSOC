import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';

const ReportsPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        Reports
      </Typography>

      <Card>
        <CardContent>
          <Typography color="textSecondary">
            Reports management interface coming soon.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ReportsPage;
