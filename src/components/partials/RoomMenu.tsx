import { MouseEvent, useContext, useState } from "react";
import { Divider, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Typography } from "@mui/material";
import { ExpandMore, GroupRemove, Restore, Settings } from "@mui/icons-material";
import GlobalContext from "../../context/global";
import { Menu as MenuModel } from "../../models/menu";
import { UserProfile } from "../../models/user";
import { clearUsers } from "../../repository/firestore/poker";
import GameSettingDialog from "../dialog/GameSettingDialog";
import VotingHistoryDialog from "../dialog/VotingHistoryDialog";

export default function RoomMenu() {
    const { poker, profile } = useContext(GlobalContext);

    type Dialog = 'game-setting' | 'voting-history' | 'close';

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [isOpenMenu, setOpenMenu] = useState(false);
    const [openDialog, setOpenDialog] = useState<Dialog>('close');

    const toggle = (event: MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
        setOpenMenu(!isOpenMenu);
    }

    const menu: MenuModel[][] = [
        [
            {
                prefixIcon: <GroupRemove fontSize="small" />,
                text: 'Clear Users',
                hasMenu: (profile: UserProfile) => !profile.isAnonymous,
                onClick: () => poker && !!poker.roomID && clearUsers(poker.roomID),
                disabled: poker?.estimateStatus === 'OPENING',
            },
        ],
        [
            {
                prefixIcon: <Settings fontSize="small" />,
                text: 'Game Settings',
                onClick: () => setOpenDialog('game-setting'),
            },
            {
                prefixIcon: <Restore fontSize="small" />,
                text: 'Voting History',
                onClick: () => setOpenDialog('voting-history'),
            },
        ]
    ];

    if (!poker) {
        return (<></>);
    }
    return (
        <>
            <IconButton className="!rounded-lg hover:!bg-gray-200 !ease-in !duration-200 !transition-colors" onClick={toggle}>
                <div className="text-black flex overflow-hidden items-center max-w-3xl px-2 gap-2">
                    <Typography fontWeight={900} fontSize={18}>{ poker.roomName }</Typography>
                    <ExpandMore className={"!ease-in !duration-200 !transition-transform" + (isOpenMenu ? ' rotate-180' : '')} />
                </div>
            </IconButton>

            <Menu
                anchorEl={anchorEl}
                open={isOpenMenu}
                onClose={() => setOpenMenu(false)}
                elevation={8}
                className="w-full"
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
            >
                {menu.filter(menuItems => menuItems.filter(menuItem => !menuItem.hasMenu || menuItem.hasMenu(profile))?.length > 0).map((menuItems, index) => {
                    return (
                        <div key={index} className="w-56 max-w-full">
                            {index > 0 && <Divider className="!my-2" />}
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
                                    </MenuItem>
                                );
                            })}
                        </div>
                    );
                })}
            </Menu>

            <GameSettingDialog open={openDialog === 'game-setting'} onClose={() => setOpenDialog('close')} />
            <VotingHistoryDialog open={openDialog === 'voting-history'} onClose={() => setOpenDialog('close')} />
        </>
    );
}
