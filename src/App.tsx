import { createTheme, ThemeProvider } from '@mui/material/styles';
import Router from "./router/router";

function App() {
  const theme = createTheme({
    typography: {
      fontFamily: ['Comic Neue', 'cursive', 'Noto Sans Thai'].join(','),
      button: {
        textTransform: 'none'
      },
    },
  })
  return (
    <>
      <ThemeProvider theme={theme}>
        <Router />
      </ThemeProvider>
    </>
  )
}

export default App
