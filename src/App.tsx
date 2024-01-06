import { useMemo, useState } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import GlobalContext from './context/global';
import Alert from './components/centralize/Alert';
import LoadingScreen from './components/centralize/LoadingScreen';
import Topbar from './components/layout/Topbar';
import { Alert as AlertModel } from './models/alert';
import { UserProfile } from './models/user';
import { getUserProfile } from './repository/firestore/user';
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

  const [profile, setProfile] = useState<UserProfile>({isAnonymous: true, userUUID: '', sessionUUID: ''});
  const [alert, setAlert] = useState<AlertModel>({isShow: false, message: '', severity: 'info'});
  const [isLoading, setLoading] = useState<boolean>(true);

  useMemo(async () => {
    const user = await getUserProfile();
    if (user) {
      setProfile(user);
      setLoading(false);
    }
  }, []);

  return (
    <>
      <ThemeProvider theme={theme}>
        <GlobalContext.Provider value={{profile, setProfile, alert: (alert => setAlert({...alert, isShow: true})), isLoading, setLoading}}>
          <Alert isShowAlert={alert.isShow} message={alert.message} severity={alert.severity} onDismiss={() => setAlert({...alert, isShow: false})} />
          <LoadingScreen isLoading={isLoading} />
          <Topbar />
          <Router />
        </GlobalContext.Provider>
      </ThemeProvider>
    </>
  )
}

export default App
