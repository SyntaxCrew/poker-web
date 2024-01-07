import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import GlobalContext from './context/global';
import Alert from './components/centralize/Alert';
import LoadingScreen from './components/centralize/LoadingScreen';
import Topbar from './components/layout/Topbar';
import { Alert as AlertModel } from './models/alert';
import { Poker } from './models/poker';
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

  const location = useLocation();

  const [isLoading, setLoading] = useState<boolean>(false);
  const [alert, setAlert] = useState<AlertModel>({isShow: false, message: '', severity: 'info'});
  const [profile, setProfile] = useState<UserProfile>({isAnonymous: true, userUUID: '', sessionUUID: '', displayName: ''});
  const [poker, setPoker] = useState<Poker>();
  const [isPageReady, setPageReady] = useState(false);

  useMemo(async () => {
    const user = await getUserProfile();
    if (user) {
      setProfile(user);
    }
    setPageReady(true);
  }, []);

  // Clear poker data for re-render topbar
  useEffect(() => {
    const paths = location.pathname.split('/');
    if (paths.length !== 2 || paths[1].length === 0) {
      setPoker(undefined);
    }
  }, [location.pathname])

  return (
    <>
      <ThemeProvider theme={theme}>
        <GlobalContext.Provider value={{profile, setProfile, alert: (alert => setAlert({...alert, isShow: true})), isLoading, setLoading, poker, setPoker, isPageReady}}>
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
