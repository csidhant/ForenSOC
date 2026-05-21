import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  List,
  Chip,
  Tabs,
  Tab,
  useTheme,
  Divider,
} from '@mui/material';
import {
  Close as CloseIcon,
  Search as SearchIcon,
  Book as BookIcon,
  Memory as MemoryIcon,
  NetworkCheck as NetworkIcon,
  Security as SecurityIcon,
  VerifiedUser as TrustIcon,
} from '@mui/icons-material';

interface GlossaryItem {
  term: string;
  category: 'detection' | 'memory' | 'network' | 'evidence' | 'general';
  definition: string;
  expertContext: string;
}

const GLOSSARY_ITEMS: GlossaryItem[] = [
  {
    term: 'Sigma Rules',
    category: 'detection',
    definition: 'A generic, open signature format for log events, allowing security analysts to describe detection methods in a standardized, tool-agnostic way.',
    expertContext: 'From a SOC operations perspective, Sigma is similar to Snort for network traffic or YARA for files. By utilizing Sigma, ForenSOC can share threat detection templates across SIEM backends like Splunk, Elastic, and Sentinel without rewrite friction.'
  },
  {
    term: 'YARA Scanning',
    category: 'evidence',
    definition: 'A pattern-matching Swiss Army knife primarily used by malware researchers to identify and classify malware samples based on text or binary patterns.',
    expertContext: 'In DFIR, YARA rules scan uploaded payloads, executables, or process memory. If a file contains a specific signature string or byte sequence, it is instantly tagged with a high-severity alert for immediate triage.'
  },
  {
    term: 'Volatility 3',
    category: 'memory',
    definition: 'The industry-standard open-source framework for analyzing physical memory (RAM) dumps from volatile devices.',
    expertContext: 'Memory forensics via Volatility bypasses OS-level rootkits. Analysts use it in ForenSOC to run key plugins like `pslist` (processes), `netscan` (active network sockets), and `malfind` (injected code), capturing evidence that never hits the hard disk.'
  },
  {
    term: 'Zeek (formerly Bro)',
    category: 'network',
    definition: 'An open-source network security monitoring platform that translates raw PCAP packets into structured, high-level audit logs.',
    expertContext: 'Zeek turns massive binary packet captures into human-readable TSV connection logs (`conn.log`, `dns.log`, `http.log`). This enables rapid protocol pivoting in the Log Explorer rather than manually sorting Wireshark packets.'
  },
  {
    term: 'Suricata EVE JSON',
    category: 'network',
    definition: 'A high-performance network threat detection engine that produces unified, newline-delimited JSON log output (EVE).',
    expertContext: 'Suricata acts as the IDS (Intrusion Detection System) layer. Its EVE output is parsed by ForenSOC to provide instant alert enrichment, including detailed signature descriptions, CVE identifiers, and network flow contexts.'
  },
  {
    term: 'Chain of Custody (CoC)',
    category: 'evidence',
    definition: 'Chronological documentation that records the sequence of custody, control, transfer, analysis, and disposition of physical or digital evidence.',
    expertContext: 'In digital forensics, a broken Chain of Custody renders evidence inadmissible. ForenSOC enforces CoC by hashing all uploaded artifacts (MD5 + SHA-256) on ingestion and logging every single read, download, or review action into an immutable audit trail.'
  },
  {
    term: 'Threat Intelligence (CTI)',
    category: 'general',
    definition: 'Information concerning the capabilities, intentions, and methodologies of threat actors, often used to enrich raw event alerts.',
    expertContext: 'ForenSOC integrates with Shodan, VirusTotal, and AlienVault OTX to automatically cross-reference IP addresses, files, and domain names. This gives analysts immediate reputational context without manually operating multiple tools.'
  },
  {
    term: 'MITRE ATT&CK Matrix',
    category: 'detection',
    definition: 'A globally-accessible knowledge base of adversary tactics and techniques based on real-world observations.',
    expertContext: 'Instead of viewing alerts in isolation, ForenSOC maps behaviors to the MITRE ATT&CK matrix. This helps team leaders identify gaps in their detection coverage and reconstruct active threat groups\' patterns.'
  },
  {
    term: 'SSH Brute-Force Detection',
    category: 'detection',
    definition: 'An automated detection mechanism targeting repetitive failed authentication attempts over SSH.',
    expertContext: 'A signature of brute-force is a high rate of failed logins followed by a success. ForenSOC monitors system authorization audits using stateful detection models to flag automated script attacks before a breach occurs.'
  }
];

interface GlossaryModalProps {
  open: boolean;
  onClose: () => void;
}

const GlossaryModal: React.FC<GlossaryModalProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'detection' | 'memory' | 'network' | 'evidence'>('all');

  const filteredItems = GLOSSARY_ITEMS.filter((item) => {
    const matchesSearch =
      item.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.definition.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.expertContext.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' || item.category === activeTab;
    return matchesSearch && matchesTab;
  });

  const getCategoryChip = (cat: string) => {
    switch (cat) {
      case 'detection':
        return <Chip label="Detection" size="small" color="error" variant="outlined" icon={<SecurityIcon sx={{ fontSize: '14px !important' }} />} sx={{ borderRadius: 1.5 }} />;
      case 'memory':
        return <Chip label="Memory" size="small" color="primary" variant="outlined" icon={<MemoryIcon sx={{ fontSize: '14px !important' }} />} sx={{ borderRadius: 1.5 }} />;
      case 'network':
        return <Chip label="Network" size="small" color="info" variant="outlined" icon={<NetworkIcon sx={{ fontSize: '14px !important' }} />} sx={{ borderRadius: 1.5 }} />;
      case 'evidence':
        return <Chip label="Evidence" size="small" color="success" variant="outlined" icon={<TrustIcon sx={{ fontSize: '14px !important' }} />} sx={{ borderRadius: 1.5 }} />;
      default:
        return <Chip label="General" size="small" color="secondary" variant="outlined" sx={{ borderRadius: 1.5 }} />;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          background: theme.palette.mode === 'dark' 
            ? 'linear-gradient(135deg, rgba(23, 27, 38, 0.95) 0%, rgba(13, 16, 23, 0.95) 100%)' 
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(245, 247, 250, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          borderRadius: 4,
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: '0 24px 48px -12px rgba(0,0,0,0.4)',
        },
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <BookIcon sx={{ color: 'primary.main' }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            DFIR & SOC Terminology Guide
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ px: 3, py: 2 }}>
        {/* Search */}
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search glossary terms, definitions, and expert insights..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        {/* Category Tabs */}
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            mb: 2,
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              minWidth: 'auto',
              px: 2.5,
              fontWeight: 600,
              fontSize: '0.85rem',
            },
          }}
        >
          <Tab label="All Terms" value="all" />
          <Tab label="Threat Detection" value="detection" />
          <Tab label="Memory Forensics" value="memory" />
          <Tab label="Network Forensics" value="network" />
          <Tab label="Evidence & Chain of Custody" value="evidence" />
        </Tabs>

        {/* Glossary List */}
        <List sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filteredItems.length === 0 ? (
            <Box py={4} textAlign="center">
              <Typography color="text.secondary">No matching terms found. Try adjusting your search query.</Typography>
            </Box>
          ) : (
            filteredItems.map((item, index) => (
              <Box
                key={index}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
                  border: `1px solid ${theme.palette.divider}`,
                  transition: 'all 0.2s',
                  '&:hover': {
                    border: `1px solid ${theme.palette.primary.main}`,
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 20px rgba(59,130,246,0.08)',
                  },
                }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={2} mb={1}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    {item.term}
                  </Typography>
                  {getCategoryChip(item.category)}
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, lineHeight: 1.6 }}>
                  {item.definition}
                </Typography>
                <Divider sx={{ my: 1, borderStyle: 'dashed' }} />
                <Box sx={{ mt: 1.5 }}>
                  <Typography
                    variant="caption"
                    color="primary.main"
                    sx={{
                      fontWeight: 700,
                      display: 'block',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      mb: 0.5,
                    }}
                  >
                    🛡️ Expert Insight:
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', pl: 1, borderLeft: `2px solid ${theme.palette.primary.main}` }}>
                    {item.expertContext}
                  </Typography>
                </Box>
              </Box>
            ))
          )}
        </List>
      </DialogContent>
    </Dialog>
  );
};

export default GlossaryModal;
