import { useContext, useState } from "react";
import { Button, Dialog, DialogContent, Divider, IconButton, InputAdornment, TextField, Typography } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import HeaderDialog from "./HeaderDialog";
import GoogleIcon from '/images/google-icon.png';
import GlobalContext from "../../context/global";
import { createUser, signInGoogle } from "../../firebase/authentication";
import { replaceUser } from "../../repository/firestore/poker";
import { signin } from "../../repository/firestore/user";
import { noSpace, pressEnter, setValue } from "../../utils/input";

export default function SignupDialog(props: {open: boolean, onSubmit?: () => void, onClose?: () => void, onSignin: () => void, isTransition: boolean}) {
    const { isLoading, setLoading, alert, profile, sessionID } = useContext(GlobalContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isShowPassword, setShowPassword] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isShowConfirmPassword, setShowConfirmPassword] = useState(false);

    const inputs = [
        {
            type: () => 'email',
            placeholder: 'Enter your email',
            label: 'Email',
            value: email,
            onChange: setValue(setEmail, { others: [noSpace] }),
        },
        {
            type: (isShowPassword: boolean) => isShowPassword ? 'text' : 'password',
            placeholder: 'Enter your password',
            label: 'Password',
            value: password,
            isShowPassword,
            onChange: setValue(setPassword),
            endAdornmentClick: () => setShowPassword(!isShowPassword),
        },
        {
            type: (isShowPassword: boolean) => isShowPassword ? 'text' : 'password',
            placeholder: 'Enter your confirm password',
            label: 'Confirm Password',
            value: confirmPassword,
            isShowPassword: isShowConfirmPassword,
            onChange: setValue(setConfirmPassword),
            endAdornmentClick: () => setShowConfirmPassword(!isShowConfirmPassword),
        },
    ]

    async function signUpWithEmailPassword() {
        if (email.length === 0 || password.length < 6 || confirmPassword.length < 6 || password !== confirmPassword) {
            return;
        }
        setLoading(true);
        try {
            const userUUID = profile.userUUID;
            const user = await createUser(email, password);
            await signin({
                userUID: user.uid,
                email: user.email || undefined,
                displayName: user.displayName || user.email?.substring(0, user.email?.indexOf('@')) || 'Username',
                imageURL: user.photoURL || undefined,
                isAnonymous: false,
                isLinkGoogle: false,
            })
            replaceUser(userUUID, user.uid, sessionID);
            alert({message: 'Sign up successfully', severity: 'success'});
        } catch (error) {
            let err = `${error}`;
            if (err.includes('email-already-in-use')) {
                err = `Email is already in used, please try again!`
            } else if (err.includes('invalid-email')) {
                err = `Email is invalid, please try again!`
            }
            alert({message: err, severity: 'error'});
        }
        setLoading(false);
    }

    async function signInWithGoogle() {
        setLoading(true);
        try {
            const userUUID = profile.userUUID;
            const user = await signInGoogle();
            if (user) {
                await signin({
                    userUID: user.uid,
                    email: user.email || undefined,
                    displayName: user.displayName || undefined,
                    imageURL: user.photoURL || undefined,
                    isAnonymous: false,
                    isLinkGoogle: true,
                });
                replaceUser(userUUID, user.uid, sessionID);
                alert({message: 'Sign in with google successfully', severity: 'success'});
            } else {
                throw Error('Sign in with google failed');
            }
        } catch (error) {
            alert({message: 'Sign in failed, please try again!', severity: 'error'});
        }
        setLoading(false);
    }

    const clearInput = () => {
        setEmail('');
        setPassword('');
        setShowPassword(false);
        setConfirmPassword('');
        setShowConfirmPassword(false);
    }

    const onClose = () => {
        setTimeout(() => clearInput(), 200)
        if (props.onClose) {
            props.onClose();
        }
    }

    const onSignin = () => {
        props.onSignin();
        clearInput();
    }

    return (
        <Dialog open={props.open} onClose={onClose} maxWidth='xs' fullWidth transitionDuration={!props.isTransition ? 0 : undefined}>
            <HeaderDialog title="Sign Up" onClose={onClose} />

            <DialogContent className="flex flex-col gap-4">
                {inputs.map((input, index) => {
                    return (
                        <TextField
                            fullWidth
                            key={index}
                            type={input.isShowPassword !== undefined ? input.type(input.isShowPassword) : input.type()}
                            variant='outlined'
                            placeholder={input.placeholder}
                            label={input.label}
                            value={input.value}
                            disabled={isLoading}
                            onChange={input.onChange}
                            onKeyDown={pressEnter(signUpWithEmailPassword, onClose)}
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
                <Button
                    variant="contained"
                    className="w-full rounded-md shadow-md"
                    size="large"
                    color="success"
                    disabled={isLoading || email.length === 0 || password.length < 6 || confirmPassword.length < 6 || password !== confirmPassword}
                    onClick={signUpWithEmailPassword}
                >
                    Sign Up
                </Button>
                <Typography className="!font-bold text-blue-500 cursor-pointer !ml-auto !w-fit" onClick={onSignin}>Signin</Typography>

                <Divider />
                <Button
                    variant='outlined'
                    className="w-full rounded-md p-2 drop-shadow-sm"
                    onClick={signInWithGoogle}
                    size="large"
                    disabled={isLoading}
                    sx={{backgroundColor: '#fff', color: '#000', borderColor: 'rgb(229 231 235)', height: '56.69px'}}
                >
                    <div className="flex items-center justify-center">
                        <img src={GoogleIcon} alt="Google Icon" className="w-6 h-6" />
                        <span className="ml-4">Sign up with Google</span>
                    </div>
                </Button>
            </DialogContent>
        </Dialog>
    );
}
