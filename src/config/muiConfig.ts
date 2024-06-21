import { createTheme } from '@mui/material'

const theme = createTheme({
  typography: {
    button: {
      textTransform: 'none'
    }
  },
  palette: { background: { default: '#ebf5ff' } }
})

export default theme
