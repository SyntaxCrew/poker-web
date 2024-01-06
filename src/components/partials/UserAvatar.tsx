import { MouseEvent, useContext, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Typography } from "@mui/material";
import { CollectionsBookmark, Logout, Login, PersonAdd, ManageAccounts } from '@mui/icons-material';
import GlobalContext from "../../context/global";
import { UserProfile } from "../../models/user";
import { signInGoogle, signout } from "../../firebase/authentication";
import { getUserProfile, signin } from "../../repository/firestore/user";

function Avatar(props: {profile: UserProfile, onClick?: (event: MouseEvent<HTMLButtonElement>) => void, size?: 'small' | 'medium' | 'large'}) {
    const sizeClass = !props.size ? 'min-w-10 max-w-10 min-h-10 max-h-10' : props.size === 'medium' ? `min-w-[3.25rem] max-w-[3.25rem] min-h-[3.25rem] max-h-[3.25rem]` : 'min-w-[4rem] max-w-[4rem] min-h-[4rem] max-h-[4rem]'
    return (
        <IconButton
            color="inherit"
            size="small"
            onClick={e => props.onClick && props.onClick(e)}
            className="w-fit"
        >
            {props.profile.imageURL
                ? <img src={props.profile.imageURL} alt="User avatar" className={`rounded-full hover:brightness-90 ease-in duration-200 transition-[--tw-brightness] ` + sizeClass} />
                : <div className="rounded-full bg-blue-300 hover:brightness-90 ease-in duration-200 transition-[--tw-brightness]">
                    <div className={`flex items-center justify-center font-bold text-white ` + sizeClass}>
                        { props.profile.displayName ? props.profile.displayName.charAt(0) : 'G' }
                    </div>
                </div>
            }
        </IconButton>
    );
}

export default function UserAvatar() {
    const { setLoading, alert, setProfile, profile } = useContext(GlobalContext);

    const navigate = useNavigate();
    const location = useLocation();

    const [isShowMenu, setShowMenu] = useState(false);
    const [isShowLogoutDialog, setShowLogoutDialog] = useState(false);
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
                onClick: () => setShowLogoutDialog(true),
            },
        ],
    ];

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
        setShowLogoutDialog(false);
        setLoading(false);
    }

    const toggle = (event: MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
        setShowMenu(!isShowMenu);
    }

    return (
        <>
            <Avatar profile={profile} onClick={toggle} />

            <Menu
                anchorEl={anchorEl}
                open={isShowMenu}
                onClose={() => setShowMenu(false)}
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

            {/* Signout Confirm Dialog */}
            <Dialog open={isShowLogoutDialog} onClose={() => setShowLogoutDialog(false)} maxWidth='xs' fullWidth>
                <DialogTitle>Signout</DialogTitle>
                <DialogContent>Are you sure to signout?</DialogContent>
                <DialogActions>
                    <Button variant="outlined" color="error" onClick={() => setShowLogoutDialog(false)}>Cancel</Button>
                    <Button variant="contained" color="error" onClick={signOut}>Signout</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
