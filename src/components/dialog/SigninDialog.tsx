import { useContext, useEffect, useState } from "react";
import { Button, Dialog, DialogContent, Divider, IconButton, InputAdornment, TextField, Typography } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import HeaderDialog from "./HeaderDialog";
import GoogleIcon from '/images/google-icon.png';
import GlobalContext from "../../context/global";
import { sendResetPasswordEmail, signInEmailPassword, signInGoogle } from "../../firebase/authentication";
import { getUserProfile, signin } from "../../repository/firestore/user";
import { pressEnter, setValue } from "../../utils/input";

export default function SigninDialog(props: {open: boolean, onSubmit?: () => void, onClose?: () => void, onSignup: () => void, isTransition: boolean}) {
    const { isLoading, setLoading, setProfile, alert } = useContext(GlobalContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isShowPassword, setShowPassword] = useState(false);

    const [isForgotPassword, setForgotPassword] = useState(false);
    const [countdown, setCountdown] = useState(0);

    const inputs = [
        {
            type: () => 'email',
            placeholder: 'Enter your email',
            label: 'Email',
            value: email,
            onChange: setValue(setEmail),
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
    ]

    useEffect(() => {
        const timer = countdown > 0 && setInterval(() => {
            setCountdown(countdown - 1);
        }, 1000);
        if (typeof timer == "number") {
            return () => clearInterval(timer);
        }
    }, [countdown])

    async function signIn() {
        const userProfile = await getUserProfile();
        if (!userProfile) {
            throw Error('user not found')
        }
        setProfile(userProfile);
        onClose();
    }

    async function signInWithEmailPassword() {
        if (email.length === 0 || password.length < 6) {
            return;
        }
        setLoading(true);
        try {
            const user = await signInEmailPassword(email, password);
            await signin({
                userUID: user.uid,
                displayName: user.displayName || '',
            })
            await signIn();
            alert({message: 'Sign in successfully', severity: 'success'});
        } catch (error) {
            alert({message: `Email or password is invalid, please try again!`, severity: 'error'});
        }
        setLoading(false);
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
                await signIn();
                alert({message: 'Sign in with google successfully', severity: 'success'});
            }
        } catch (error) {
            alert({message: 'Sign in failed, please try again!', severity: 'success'});
        }
        setLoading(false);
    }

    async function forgotPassword() {
        if (countdown > 0 || email.length === 0) {
            return;
        }
        setLoading(true);
        try {
            await sendResetPasswordEmail(email);
            alert({message: 'Send email to reset password successfully', severity: 'success'});
            setCountdown(60);
        } catch (error) {
            alert({message: 'Email is invalid, please try again!', severity: 'error'});
        }
        setLoading(false);
    }

    const clearInput = () => {
        setEmail('');
        setPassword('');
        setShowPassword(false);
        setForgotPassword(false);
    }

    const switchPage = (page: 'forgot-password' | 'signin') => {
        setEmail('');
        setPassword('');
        setShowPassword(false);
        setForgotPassword(page === 'forgot-password');
    }

    const onClose = () => {
        setTimeout(() => clearInput(), 200)
        if (props.onClose) {
            props.onClose();
        }
    }

    const onSignup = () => {
        props.onSignup();
        clearInput();
    }

    return (
        <Dialog open={props.open} onClose={onClose} maxWidth='xs' fullWidth transitionDuration={!props.isTransition ? 0 : undefined}>
            <HeaderDialog title={isForgotPassword ? "Forgot Password" : "Sign In"} onClose={onClose} />

            <DialogContent className="flex flex-col gap-4">
                {isForgotPassword && <>
                    <TextField
                        fullWidth
                        variant='outlined'
                        placeholder='Enter your email'
                        label='Email'
                        value={email}
                        onChange={setValue(setEmail)}
                        onKeyDown={pressEnter(forgotPassword, props.onClose)}
                    />
                    <Button
                        variant="contained"
                        className="w-full rounded-md shadow-md"
                        size="large"
                        color="success"
                        onClick={forgotPassword}
                        disabled={countdown > 0 || email.length === 0}
                    >
                        { countdown === 0 ? 'Send' : `${countdown} seconds` }
                    </Button>
                    <Typography className="!font-bold text-blue-500 cursor-pointer !ml-auto !w-fit" onClick={() => switchPage('signin')}>Login</Typography>
                </>}

                {!isForgotPassword && <>
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
                                onKeyDown={pressEnter(signInWithEmailPassword, props.onClose)}
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
                        disabled={isLoading || email.length === 0 || password.length < 6}
                        onClick={signInWithEmailPassword}
                    >
                        Login
                    </Button>
                    <div className="flex items-center justify-between">
                        <Typography className="!font-bold text-blue-500 cursor-pointer w-fit" onClick={onSignup}>Signup</Typography>
                        <Typography className="!font-bold text-blue-500 cursor-pointer w-fit" onClick={() => switchPage('forgot-password')}>Forgot Password</Typography>
                    </div>

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
                            <span className="ml-4">Sign in with Google</span>
                        </div>
                    </Button>
                </>}
            </DialogContent>
        </Dialog>
    );
}
