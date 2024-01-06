import { MouseEvent, useContext, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Divider, ListItemIcon, ListItemText, Menu, MenuItem, Typography } from "@mui/material";
import { CollectionsBookmark, Logout, Login, PersonAdd, ManageAccounts } from '@mui/icons-material';
import Avatar from "./Avatar";
import SignoutDialog from "../dialog/SignoutDialog";
import GlobalContext from "../../context/global";
import { UserProfile } from "../../models/user";
import { signInGoogle, signout } from "../../firebase/authentication";
import { getUserProfile, signin, updateUserProfile } from "../../repository/firestore/user";
import ProfileDialog from "../dialog/ProfileDialog";

export default function UserAvatar() {
    const { setLoading, alert, setProfile, profile } = useContext(GlobalContext);

    const navigate = useNavigate();
    const location = useLocation();

    const [isOpenMenu, setOpenMenu] = useState(false);
    const [isOpenLogoutDialog, setOpenLogoutDialog] = useState(false);
    const [isOpenUserDialog, setOpenUserDialog] = useState(false);

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    interface Menu {
        prefixIcon: JSX.Element
        disabled?: boolean
        text: string
        suffix?: string | JSX.Element
        hasMenu?: (profile: UserProfile) => boolean
        onClick?: () => void
    }

    const menu: Menu[][] = [
        [
            {
                prefixIcon: <CollectionsBookmark fontSize="small" />,
                disabled: true,
                text: 'My Games',
                suffix: 'N/A',
                hasMenu: () => true,
            },
            {
                prefixIcon: <ManageAccounts fontSize="small" />,
                text: 'Profile',
                onClick: () => setOpenUserDialog(true),
            },
        ],
        [
            {
                prefixIcon: <Login fontSize="small" />,
                text: 'Signin',
                hasMenu: (profile: UserProfile) => profile.isAnonymous,
            },
            {
                prefixIcon: <PersonAdd fontSize="small" />,
                text: 'Signup',
                hasMenu: (profile: UserProfile) => profile.isAnonymous,
            },
            {
                prefixIcon: <Logout fontSize="small" />,
                text: 'Signout',
                hasMenu: (profile: UserProfile) => !profile.isAnonymous,
                onClick: () => setOpenLogoutDialog(true),
            },
        ],
    ];

    async function updateProfile(displayName: string, file?: File) {
        try {
            await updateUserProfile({userUID: profile.userUUID, isAnonymous: profile.isAnonymous, displayName, file});
            const userProfile = await getUserProfile();
            if (!userProfile) {
                throw Error('user not found');
            }
            setProfile(userProfile);
            alert({message: 'Update profile successfully', severity: 'success'});
        } catch (error) {
            alert({message: 'Update profile failed, please try again!', severity: 'error'});
        }
        setOpenUserDialog(false);
    }

    async function signInWithGoogle() {
        setLoading(true);
        try {
            const user = await signInGoogle();
            if (user) {
                await signin({
                    userUID: user.uid,
                    email: user.email || undefined,
                    displayName: user.displayName || '',
                    isAnonymous: false,
                    isLinkGoogle: true,
                });
                const userProfile = await getUserProfile();
                if (!userProfile) {
                    throw Error('user not found')
                }
                setProfile(userProfile);
                alert({message: 'Sign in with google successfully', severity: 'success'});
            }
        } catch (error) {
            // Maybe error is `auth/popup-closed-by-user`, so skip alert
        }
        setLoading(false);
    }

    async function signOut() {
        setLoading(true);
        try {
            await signout();
            const user = await getUserProfile();
            if (!user) {
                throw Error('user not found')
            }
            setProfile(user);
            alert({message: 'Sign out successfully', severity: 'success'});
            if (location.pathname !== '/') {
                navigate('/');
            }
        } catch (error) {
            alert({message: 'Sign out failed', severity: 'error'});
        }
        setOpenLogoutDialog(false);
        setLoading(false);
    }

    const toggle = (event: MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
        setOpenMenu(!isOpenMenu);
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
                <div className="flex items-center gap-2 p-4 w-full max-w-xs min-w-56">
                    <Avatar size='medium' profile={profile} />
                    <div className="overflow-hidden mr-1">
                        <div className="text-ellipsis whitespace-nowrap overflow-hidden font-bold">{ profile.displayName }</div>
                        <div className="text-ellipsis whitespace-nowrap overflow-hidden text-gray-500">{ profile.isAnonymous ? 'Guest user' : 'User' }</div>
                    </div>
                </div>

                {menu.filter(menuItems => menuItems.filter(menuItem => !menuItem.hasMenu || menuItem.hasMenu(profile))?.length > 0).map((menuItems, index) => {
                    return (
                        <div key={index}>
                            <Divider />
                            {menuItems.filter(menuItem => !menuItem.hasMenu || menuItem.hasMenu(profile)).map((menuItem, itemIndex) => {
                                return (
                                    <MenuItem key={`${index}${itemIndex}`} disabled={menuItem.disabled} onClick={() => menuItem.onClick && menuItem.onClick()}>
                                        <ListItemIcon>
                                            { menuItem.prefixIcon }
                                        </ListItemIcon>
                                        <ListItemText className="-mx-1">{ menuItem.text }</ListItemText>
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

            <ProfileDialog open={isOpenUserDialog} profile={profile} onSubmit={updateProfile} onClose={() => setOpenUserDialog(false)} />
            <SignoutDialog open={isOpenLogoutDialog} onSubmit={signOut} onClose={() => setOpenLogoutDialog(false)} />
        </>
    );
}
