import { MouseEvent, useCallback, useContext, useState } from "react";
import { useLocation } from "react-router-dom";
import { Divider, ListItemIcon, ListItemText, Menu, MenuItem, Switch, Typography } from "@mui/material";
import { CollectionsBookmark, Logout, Login, PersonAdd, ManageAccounts, Lock, Visibility, Image } from '@mui/icons-material';
import MyGamesDialog from "../dialog/MyGamesDialog";
import ProfileDialog from "../dialog/ProfileDialog";
import ChangePasswordDialog from "../dialog/ChangePasswordDialog";
import SigninDialog from "../dialog/SigninDialog";
import SignupDialog from "../dialog/SignupDialog";
import SignoutDialog from "../dialog/SignoutDialog";
import Avatar from "../shared/Avatar";
import GlobalContext from "../../context/global";
import { Menu as MenuModel } from "../../models/menu";
import { UserProfile } from "../../models/user";
import { joinGame } from "../../repository/firestore/poker";
import { updateUserProfile } from "../../repository/firestore/user";

export default function UserMenu() {
    const { sessionID, setLoading, alert, profile, poker, setting, setSetting } = useContext(GlobalContext);

    const location = useLocation();

    const isPokerPath = useCallback(() => {
        const paths = location.pathname.split('/');
        return paths.length === 2 && paths[1].length > 0;
    }, [location.pathname]);

    type DialogName = 'my-games' | 'profile' | 'change-password' | 'signin' | 'signup' | 'signout' | 'close'

    const [isOpenMenu, setOpenMenu] = useState(false);
    const [openDialog, setOpenDialog] = useState<DialogName>('close');

    const [isTransition, setTransition] = useState(true);

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const spectatorToggle = () => poker && joinGame(profile.userUUID, profile.displayName, profile.imageURL, sessionID, poker.roomID, (poker.user[profile.userUUID]?.isSpectator ?? true) ? 'join' : 'leave')

    const menu: MenuModel[][] = [
        [
            {
                prefixIcon: <CollectionsBookmark fontSize="small" />,
                text: 'My Games',
                onClick: () => setDialog('my-games'),
            },
            {
                prefixIcon: <Visibility fontSize="small" />,
                text: 'Spectator Mode',
                hasMenu: () => poker !== undefined && isPokerPath(),
                onClick: spectatorToggle,
                suffix: <Switch
                    size="small"
                    checked={poker?.user[profile.userUUID]?.isSpectator ?? true}
                    onChange={spectatorToggle}
                />,
            },
            {
                prefixIcon: <Image fontSize="small" />,
                text: 'Display User Image',
                onClick: () => setSetting({...setting, displayUserImage: setting.displayUserImage === 'show' ? 'hide' : 'show'}),
                suffix: <Switch
                    size="small"
                    checked={setting.displayUserImage === 'show'}
                    onChange={() => setSetting({...setting, displayUserImage: setting.displayUserImage === 'show' ? 'hide' : 'show'})}
                />,
            },
            {
                prefixIcon: <ManageAccounts fontSize="small" />,
                text: 'Profile',
                onClick: () => setDialog('profile'),
            },
            {
                prefixIcon: <Lock fontSize="small" />,
                text: 'Change Password',
                hasMenu: (profile: UserProfile) => !profile.isAnonymous,
                onClick: () => setDialog('change-password'),
            },
        ],
        [
            {
                prefixIcon: <Login fontSize="small" />,
                text: 'Signin',
                hasMenu: (profile: UserProfile) => profile.isAnonymous,
                onClick: () => setDialog('signin'),
            },
            {
                prefixIcon: <PersonAdd fontSize="small" />,
                text: 'Signup',
                hasMenu: (profile: UserProfile) => profile.isAnonymous,
                onClick: () => setDialog('signup'),
            },
            {
                prefixIcon: <Logout fontSize="small" />,
                text: 'Signout',
                hasMenu: (profile: UserProfile) => !profile.isAnonymous,
                onClick: () => setDialog('signout'),
            },
        ],
    ];

    async function updateProfile(displayName: string, file?: File) {
        setLoading(true);
        try {
            await updateUserProfile({userUID: profile.userUUID, displayName, file});
            alert({message: 'Update profile successfully', severity: 'success'});
        } catch (error) {
            alert({message: 'Update profile failed, please try again!', severity: 'error'});
        }
        setLoading(false);
        setDialog('close');
    }

    const toggle = (event: MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
        setOpenMenu(!isOpenMenu);
    }

    const setDialog = (dialog: DialogName, isSwapComponent?: boolean) => {
        setTransition(isSwapComponent === undefined);
        setOpenDialog(dialog);
    }

    return (
        <>
            <Avatar profile={profile} onClick={toggle} />

            <Menu
                anchorEl={anchorEl}
                open={isOpenMenu}
                onClose={() => setOpenMenu(false)}
                elevation={8}
                className="w-full"
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
            >
                <div className="flex items-center gap-2 p-4 w-full max-w-64">
                    <Avatar size='medium' profile={profile} />
                    <div className="overflow-hidden mr-1">
                        <div className="text-ellipsis whitespace-nowrap overflow-hidden font-bold">{ profile.displayName || 'Guest' }</div>
                        <div className="text-ellipsis whitespace-nowrap overflow-hidden text-gray-500">{ profile.isAnonymous ? 'Guest user' : 'User' }</div>
                    </div>
                </div>

                {menu.filter(menuItems => menuItems.filter(menuItem => !menuItem.hasMenu || menuItem.hasMenu(profile))?.length > 0).map((menuItems, index) => {
                    return (
                        <div key={index} className="w-64 max-w-full">
                            <Divider className="!my-2" />
                            {menuItems.filter(menuItem => !menuItem.hasMenu || menuItem.hasMenu(profile)).map((menuItem, itemIndex) => {
                                return (
                                    <MenuItem key={`${index}${itemIndex}`} disabled={menuItem.disabled} onClick={() => menuItem.onClick && menuItem.onClick()}>
                                        <ListItemIcon>
                                            { menuItem.prefixIcon }
                                        </ListItemIcon>
                                        <ListItemText
                                            primaryTypographyProps={{
                                                style: {
                                                    whiteSpace: 'nowrap',
                                                    textOverflow: 'ellipsis',
                                                    overflow: 'hidden',
                                                    marginLeft: '-.25rem',
                                                }
                                            }}
                                        >
                                            { menuItem.text }
                                        </ListItemText>
                                        {!!menuItem.suffix && <Typography variant="body2" color="text.secondary">
                                            { menuItem.suffix }
                                        </Typography>}
                                    </MenuItem>
                                );
                            })}
                        </div>
                    );
                })}
            </Menu>

            <MyGamesDialog open={openDialog === 'my-games'} profile={profile} onClose={() => setDialog('close')} />
            <ProfileDialog open={openDialog === 'profile'} profile={profile} onSubmit={updateProfile} onClose={() => setDialog('close')} />
            {!profile.isAnonymous && <ChangePasswordDialog open={openDialog === 'change-password'} profile={profile} onSubmit={() => setDialog('close')} onClose={() => setDialog('close')} />}
            {profile.isAnonymous && <SigninDialog open={openDialog === 'signin'} onClose={() => setDialog('close')} onSignup={() => setDialog('signup', true)} isTransition={isTransition} />}
            {profile.isAnonymous && <SignupDialog open={openDialog === 'signup'} onClose={() => setDialog('close')} onSignin={() => setDialog('signin', true)} isTransition={isTransition} />}
            {!profile.isAnonymous && <SignoutDialog open={openDialog === 'signout'} onClose={() => setDialog('close')} />}
        </>
    );
}
