import React from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker
} from "react-simple-maps";
import { Box, Typography, Paper, useTheme } from "@mui/material";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface MapMarker {
  id: string;
  name: string;
  coordinates: [number, number];
  severity: string;
}

interface GlobalThreatMapProps {
  markers: MapMarker[];
}

const GlobalThreatMap: React.FC<GlobalThreatMapProps> = ({ markers }) => {
  const theme = useTheme();

  return (
    <Paper sx={{ p: 2, height: '100%', borderRadius: 2, overflow: 'hidden' }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Global Threat Distribution</Typography>
      <Box sx={{ width: "100%", height: 300, bgcolor: theme.palette.mode === 'dark' ? '#1a2027' : '#f0f4f8', borderRadius: 1 }}>
        <ComposableMap projectionConfig={{ scale: 140 }}>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={theme.palette.mode === 'dark' ? "#2d3748" : "#cbd5e0"}
                  stroke={theme.palette.mode === 'dark' ? "#1a2027" : "#fff"}
                  style={{
                    default: { outline: "none" },
                    hover: { fill: theme.palette.primary.main, outline: "none" },
                    pressed: { outline: "none" }
                  }}
                />
              ))
            }
          </Geographies>
          {markers.map(({ id, name, coordinates, severity }) => (
            <Marker key={id} coordinates={coordinates}>
              <circle 
                r={4} 
                fill={severity === 'Critical' ? '#d32f2f' : severity === 'High' ? '#ed6c02' : '#0288d1'} 
                stroke="#fff" 
                strokeWidth={1} 
              />
              <title>{`${name} (${severity})`}</title>
            </Marker>
          ))}
        </ComposableMap>
      </Box>
      <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#d32f2f' }} />
          <Typography variant="caption">Critical</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#ed6c02' }} />
          <Typography variant="caption">High</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#0288d1' }} />
          <Typography variant="caption">Medium/Low</Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default GlobalThreatMap;
