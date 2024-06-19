import {Box, Icon, Input, Stack, TextField} from "@mui/material";
import Typography from "@mui/material/Typography";
import SearchIcon from '@mui/icons-material/Search';

export default function Home() {
  return (<Box padding={5} display={'flex'} flexDirection={'column'} alignItems={'center'} justifyContent={'center'}
               width={'100%'}>
    <Box width={"60%"}>
      <Stack mb={1} direction={'row'} spacing={1}> <Typography fontSize={30}>Transform Your Workflow
        with </Typography><Typography
        fontSize={30}
        color={'primary'}>Omni
        Tools</Typography></Stack>
      <Typography fontSize={20} mb={2}>
        Boost your productivity with Omni Tools—the ultimate toolkit for getting things done quickly! Access thousands
        of
        user-friendly utilities for editing images, text, lists, and data, all directly from your browser.
      </Typography>

      <TextField fullWidth placeholder={'Search all tools'} sx={{borderRadius: 2}} InputProps={{
        endAdornment: (
          <SearchIcon/>
        ),
      }}/>
    </Box>
  </Box>)
}
