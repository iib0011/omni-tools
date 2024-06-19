import ToolHeader from "../../../components/ToolHeader";
import ToolLayout from "../../../components/ToolLayout";
import {Box, Stack, TextField} from "@mui/material";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import PublishIcon from '@mui/icons-material/Publish';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import DownloadIcon from '@mui/icons-material/Download';
import React, {useEffect, useState} from "react";

export default function SplitText() {
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('')
  useEffect(() => {
    setResult(input.split(' ').join('\n'))
  }, [input]);
  return (
    <ToolLayout>
      <ToolHeader title={"Text Splitter"}
                  description={"World's simplest browser-based utility for splitting text. Load your text in the input form on the left and you'll automatically get pieces of this text on the right. Powerful, free, and fast. Load text – get chunks."}/>

      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Typography fontSize={30} color={'primary'}>Input text</Typography>
          <TextField value={input} onChange={event => setInput(event.target.value)} fullWidth multiline rows={10}/>
          <Stack mt={1} direction={'row'} spacing={2}>
            <Button startIcon={<PublishIcon/>}>Import from file</Button>
            <Button startIcon={<ContentPasteIcon/>}>Copy to clipboard</Button>
          </Stack>
        </Grid>
        <Grid item xs={6}>
          <Typography fontSize={30} color={'primary'}>Text pieces</Typography>
          <TextField value={result} fullWidth multiline rows={10}/>
          <Stack mt={1} direction={'row'} spacing={2}>
            <Button startIcon={<DownloadIcon/>}>Save as</Button>
            <Button startIcon={<ContentPasteIcon/>}>Copy to clipboard</Button>
          </Stack>
        </Grid>
      </Grid>
      <Box mt={2}>

      </Box>
    </ToolLayout>)
}
