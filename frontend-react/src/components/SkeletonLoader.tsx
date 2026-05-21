import React from 'react';
import { Skeleton, Box, Card, CardContent } from '@mui/material';

interface SkeletonLoaderProps {
  type?: 'card' | 'table' | 'text' | 'chart';
  count?: number;
  height?: number;
}

/**
 * SkeletonLoader Component
 * Shows animated placeholders while content is loading
 */
const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  type = 'card',
  count = 1,
  height = 200,
}) => {
  if (type === 'card') {
    return (
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2 }}>
        {Array.from({ length: count }).map((_, idx) => (
          <Card key={idx}>
            <CardContent>
              <Skeleton variant="text" width="80%" height={32} />
              <Skeleton variant="text" width="100%" height={20} sx={{ mt: 2 }} />
              <Skeleton variant="text" width="100%" height={20} sx={{ mt: 1 }} />
              <Skeleton variant="rectangular" height={40} sx={{ mt: 2 }} />
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  }

  if (type === 'table') {
    return (
      <Box>
        {Array.from({ length: count }).map((_, idx) => (
          <Box key={idx} sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Skeleton variant="rectangular" width="20%" height={40} />
            <Skeleton variant="rectangular" width="30%" height={40} />
            <Skeleton variant="rectangular" width="30%" height={40} />
            <Skeleton variant="rectangular" width="20%" height={40} />
          </Box>
        ))}
      </Box>
    );
  }

  if (type === 'chart') {
    return (
      <Box sx={{ height, width: '100%' }}>
        <Skeleton variant="rectangular" height="100%" sx={{ borderRadius: 1 }} />
      </Box>
    );
  }

  return (
    <Box>
      {Array.from({ length: count }).map((_, idx) => (
        <Skeleton
          key={idx}
          variant="text"
          height={20}
          width={`${Math.random() * 30 + 70}%`}
          sx={{ mt: idx === 0 ? 0 : 2 }}
        />
      ))}
    </Box>
  );
};

export default SkeletonLoader;
