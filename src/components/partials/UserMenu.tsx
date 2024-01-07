import { MouseEvent, useContext, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Divider, ListItemIcon, ListItemText, Menu, MenuItem, Typography } from "@mui/material";
import { CollectionsBookmark, Logout, Login, PersonAdd, ManageAccounts, Lock } from '@mui/icons-material';
import Avatar from "./Avatar";
import ProfileDialog from "../dialog/ProfileDialog";
import ChangePasswordDialog from "../dialog/ChangePasswordDialog";
import SigninDialog from "../dialog/SigninDialog";
import SignupDialog from "../dialog/SignupDialog";
import SignoutDialog from "../dialog/SignoutDialog";
import GlobalContext from "../../context/global";
import { UserProfile } from "../../models/user";
import { signout } from "../../firebase/authentication";
import { getUserProfile, updateUserProfile } from "../../repository/firestore/user";

export default function UserMenu() {
    const { setLoading, alert, setProfile, profile } = useContext(GlobalContext);

    const navigate = useNavigate();
    const location = useLocation();

    type DialogName = 'profile' | 'change-password' | 'signin' | 'signup' | 'signout' | 'close'

    const [isOpenMenu, setOpenMenu] = useState(false);
    const [openDialog, setOpenDialog] = useState<DialogName>('close');

    const [isTransition, setTransition] = useState(true);

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
        setLoading(false);
        setDialog('close');
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
        setDialog('close');
        setLoading(false);
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
                            <Divider className="!my-2" />
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

            <ProfileDialog open={openDialog === 'profile'} profile={profile} onSubmit={updateProfile} onClose={() => setDialog('close')} />
            <ChangePasswordDialog open={openDialog === 'change-password'} profile={profile} onSubmit={() => setDialog('close')} onClose={() => setDialog('close')} />
            <SigninDialog open={openDialog === 'signin'} onClose={() => setDialog('close')} onSignup={() => setDialog('signup', true)} isTransition={isTransition} />
            <SignupDialog open={openDialog === 'signup'} onClose={() => setDialog('close')} onSignin={() => setDialog('signin', true)} isTransition={isTransition} />
            <SignoutDialog open={openDialog === 'signout'} onSubmit={signOut} onClose={() => setDialog('close')} />
        </>
    );
}