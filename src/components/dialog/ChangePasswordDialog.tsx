import { Button, Dialog, DialogActions, DialogContent, Divider, IconButton, InputAdornment, TextField } from "@mui/material";
import HeaderDialog from "./HeaderDialog";
import { UserProfile } from "../../models/user";
import { useContext, useState } from "react";
import GlobalContext from "../../context/global";
import { pressEnter, setValue } from "../../utils/input";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { changePassword } from "../../firebase/authentication";

export default function ChangePasswordDialog(props: {open: boolean, profile: UserProfile, onSubmit?: () => void, onClose?: () => void}) {
    const { isLoading, setLoading, alert } = useContext(GlobalContext);

    const [oldPassword, setOldPassword] = useState('');
    const [isShowOldPassword, setShowOldPassword] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [isShowNewPassword, setShowNewPassword] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isShowConfirmPassword, setShowConfirmPassword] = useState(false);

    const inputs = [
        {
            type: (isShowPassword: boolean) => isShowPassword ? 'text' : 'password',
            placeholder: 'Enter your old password',
            label: 'Old Password',
            value: oldPassword,
            isShowPassword: isShowOldPassword,
            onChange: setValue(setOldPassword),
            endAdornmentClick: () => setShowOldPassword(!isShowOldPassword),
        },
        {
            type: (isShowPassword: boolean) => isShowPassword ? 'text' : 'password',
            placeholder: 'Enter your new password',
            label: 'New Password',
            value: newPassword,
            isShowPassword: isShowNewPassword,
            onChange: setValue(setNewPassword),
            endAdornmentClick: () => setShowNewPassword(!isShowNewPassword),
        },
        {
            type: (isShowPassword: boolean) => isShowPassword ? 'text' : 'password',
            placeholder: 'Enter your confirm new password',
            label: 'Confirm New Password',
            value: confirmPassword,
            isShowPassword: isShowConfirmPassword,
            onChange: setValue(setConfirmPassword),
            endAdornmentClick: () => setShowConfirmPassword(!isShowConfirmPassword),
        },
    ]

    const clearInput = () => {
        setOldPassword('');
        setShowOldPassword(false);
        setNewPassword('');
        setShowNewPassword(false);
        setConfirmPassword('');
        setShowConfirmPassword(false);
    }

    const onClose = () => {
        setTimeout(() => clearInput(), 200);
        if (props.onClose) {
            props.onClose();
        }
    }

    const onSubmit = async () => {
        if (!props.profile.email || oldPassword.length < 6 || newPassword.length < 6 || confirmPassword.length < 6 || newPassword !== confirmPassword) {
            return;
        }
        setLoading(true);
        try {
            if (oldPassword === newPassword) {
                throw Error('password-unchanged');
            }
            await changePassword(props.profile.email!, oldPassword, newPassword);
            setTimeout(() => clearInput(), 200);
            if (props.onSubmit) {
                props.onSubmit();
            }
            alert({message: 'Change password successfully', severity: 'success'});
        } catch (error) {
            let err = `${error}`
            if (err.includes('invalid-credential')) {
                err = 'Old password was wrong, please try again!';
            } else if (err.includes('password-unchanged')) {
                err = 'Unable to use old password, please try again!';
            }
            alert({message: err, severity: 'error'});
        }
        setLoading(false);
    }

    return (
        <Dialog open={props.open} onClose={onClose} maxWidth='xs' fullWidth>
            <HeaderDialog title="Change Password" onClose={onClose} />
            <DialogContent>
                <div className="flex flex-col gap-4">
                    {inputs.map((input, index) => {
                        return (
                            <TextField
                                fullWidth
                                key={index}
                                type={input.type(input.isShowPassword)}
                                variant='outlined'
                                placeholder={input.placeholder}
                                label={input.label}
                                value={input.value}
                                disabled={isLoading}
                                onChange={input.onChange}
                                onKeyDown={pressEnter(onSubmit, onClose)}
                                InputProps={input.isShowPassword === undefined ? {} : {
                                    endAdornment: <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={input.endAdornmentClick}
                                            edge="end"
                                        >
                                            {!input.isShowPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                }}
                            />
                        );
                    })}
                </div>
            </DialogContent>

            <Divider />
            <DialogActions>
                <Button variant="outlined" color="error" onClick={onClose}>Cancel</Button>
                <Button
                    variant="contained"
                    color="error"
                    onClick={onSubmit} disabled={isLoading || oldPassword.length < 6 || newPassword.length < 6 || confirmPassword.length < 6 || newPassword !== confirmPassword}
                >
                    Submit
                </Button>
            </DialogActions>
        </Dialog>
    );
}
