import { Unsubscribe } from 'firebase/auth';
import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { observeAuth, signinAnonymous } from './firebase/authentication';
import LocalStorageKey from './constant/local-storage-key';
import GlobalContext from './context/global';
import Alert from './components/centralize/Alert';
import LoadingScreen from './components/centralize/LoadingScreen';
import Topbar from './components/layout/Topbar';
import { Alert as AlertModel } from './models/alert';
import { Poker } from './models/poker';
import { Setting } from './models/setting';
import { UserProfile } from './models/user';
import { watchUser } from './repository/firestore/user';
import Router from "./router/router";
import { randomString } from './utils/generator';

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

  const [sessionID] = useState(randomString(20));
  const [isLoading, setLoading] = useState<boolean>(false);
  const [alert, setAlert] = useState<AlertModel>({isShow: false, message: '', severity: 'info'});
  const [profile, setProfile] = useState<UserProfile>({isAnonymous: true, userUUID: '', displayName: ''});
  const [poker, setPoker] = useState<Poker>();
  const [setting, setSetting] = useState<Setting>({displayUserImage: (localStorage.getItem(LocalStorageKey.DisplayUserImageSetting) as ('show' | 'hide')) || 'hide'});
  const [isPageReady, setPageReady] = useState(false);
  const [isDisplayVoteButtonOnTopbar, setDisplayVoteButtonOnTopbar] = useState(false);

  useMemo(async () => {
    let isObserveOnInitial = false;
    let unsubUser: Unsubscribe;
    observeAuth(async (user) => {
      if (!user) {
        if (!isObserveOnInitial) {
          isObserveOnInitial = true;
          user = await signinAnonymous();
        }
        return;
      }
      isObserveOnInitial = true;

      if (unsubUser) {
        unsubUser();
      }
      unsubUser = await watchUser(user.uid, userProfile => {
        setProfile(userProfile);
        setPageReady(true);
      });
    });
  }, []);

  useEffect(() => {
    localStorage.setItem(LocalStorageKey.DisplayUserImageSetting, setting.displayUserImage);
  }, [setting.displayUserImage])

  // Clear poker data for re-render topbar
  useEffect(() => {
    const paths = location.pathname.split('/');
    if (paths.length !== 2 || paths[1].length === 0 || paths[1] === 'reset-password') {
      setPoker(undefined);
    }
  }, [location.pathname])

  return (
    <>
      <ThemeProvider theme={theme}>
        <GlobalContext.Provider
          value={{
            sessionID,
            profile,
            alert: (alert => setAlert({...alert, isShow: true})),
            isLoading,
            setLoading,
            poker,
            setPoker,
            isPageReady,
            setting,
            setSetting,
            isDisplayVoteButtonOnTopbar,
            setDisplayVoteButtonOnTopbar,
          }}>
          <Alert isShowAlert={alert.isShow} message={alert.message} severity={alert.severity} onDismiss={() => setAlert({...alert, isShow: false})} />
          <LoadingScreen isLoading={isLoading} />
          <Topbar />
          <div className="relative top-20 min-h-100 overflow-y-auto bg-white">
            <Router />
          </div>
        </GlobalContext.Provider>
      </ThemeProvider>
    </>
  )
}

export default App
