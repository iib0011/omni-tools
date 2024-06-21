import { Box, Stack, TextField } from '@mui/material'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import PublishIcon from '@mui/icons-material/Publish'
import ContentPasteIcon from '@mui/icons-material/ContentPaste'
import React from 'react'

export default function ToolTextInput({ value, onChange, title = 'Input text' }: {
  title?: string;
  value: string
  onChange: (value: string) => void
}) {
  return (
    <Box>
      <Typography fontSize={30} color={'primary'}>
        {title}
      </Typography>
      <TextField
        value={value}
        onChange={(event) => onChange(event.target.value)}
        fullWidth
        multiline
        rows={10}
      />
      <Stack mt={1} direction={'row'} spacing={2}>
        <Button startIcon={<PublishIcon />}>Import from file</Button>
        <Button startIcon={<ContentPasteIcon />}>Copy to clipboard</Button>
      </Stack>
    </Box>
  )
}
