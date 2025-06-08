import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Typography,
  Slider,
  Button,
  Alert
} from '@mui/material';
import { ToolComponentProps } from '../../../../tools/defineTool';
import InfoIcon from '@mui/icons-material/Info';

const Component: React.FC<ToolComponentProps> = ({ title }) => {
  const [input, setInput] = useState('');
  const [hash, setHash] = useState('');
  const [saltRounds, setSaltRounds] = useState(10);
  const [error, setError] = useState('');

  const generateHash = async () => {
    try {
      setError('');
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.hash(input, saltRounds);
      setHash(hashedPassword);
    } catch (err) {
      setError('Failed to generate hash. Please try again.');
      console.error('Hash generation error:', err);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(hash);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Alert severity="info" icon={<InfoIcon />}>
        BCrypt is a password hashing function designed to be computationally
        expensive, making it resistant to brute-force attacks. Higher salt
        rounds increase security but also increase computation time.
      </Alert>

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Input Text
              </Typography>
              <TextField
                fullWidth
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter text to hash"
                variant="outlined"
              />
            </Box>

            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Salt Rounds: {saltRounds}
              </Typography>
              <Slider
                value={saltRounds}
                onChange={(_, value) => setSaltRounds(value as number)}
                min={4}
                max={12}
                step={1}
                marks
                valueLabelDisplay="auto"
              />
            </Box>

            <Button
              variant="contained"
              onClick={generateHash}
              disabled={!input}
              fullWidth
            >
              Generate Hash
            </Button>

            {error && (
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            )}

            {hash && (
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Generated Hash
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    fullWidth
                    value={hash}
                    InputProps={{
                      readOnly: true
                    }}
                    variant="outlined"
                  />
                  <Button variant="outlined" onClick={copyToClipboard}>
                    Copy
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Component;
