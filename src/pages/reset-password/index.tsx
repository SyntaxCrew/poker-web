import { useContext, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button, Card, Divider, IconButton, InputAdornment, TextField } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import LoginLogo from '/images/login.webp';
import GlobalContext from "../../context/global";
import { getEmailFromActionCode, resetPassword } from "../../firebase/authentication";
import { pressEnter, setValue } from "../../utils/input";

export default function ResetPasswordPage() {
    const { isLoading, setLoading, alert } = useContext(GlobalContext);

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const oobCode = searchParams.get('oobCode');
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
            onChange: setValue(setEmail),
            disabled: true,
        },
        {
            type: (isShowPassword: boolean) => isShowPassword ? 'text' : 'password',
            placeholder: 'Enter your new password',
            label: 'New Password',
            value: password,
            isShowPassword,
            onChange: setValue(setPassword),
            endAdornmentClick: () => setShowPassword(!isShowPassword),
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

    useEffect(() => {
        init()
        async function init() {
            setLoading(true);
            try {
                if (!oobCode) {
                    navigate('/');
                    return;
                }
                const userEmail = await getEmailFromActionCode(oobCode);
                if (!userEmail) {
                    throw Error('oobCode is invalid');
                }
                setEmail(userEmail);
            } catch (error) {
                navigate('/');
            } finally {
                setLoading(false);
            }
        }
    }, [oobCode]);

    const submit = async () => {
        if (isLoading || password.length < 6 || confirmPassword.length < 6 || password !== confirmPassword) {
            return;
        }
        setLoading(true);
        try {
            await resetPassword(oobCode!, password);
            navigate('/');
            alert({message: `Reset password successfully!`, severity: 'success'});
        } catch (error) {
            alert({message: `${error}`, severity: 'error'});
        }
        setLoading(false);
    }

    return (
        <div className="relative w-screen top-20 min-h-[calc(100vh-5rem)] flex overflow-y-auto bg-white">
            <div className="w-full px-6 max-[900px]:hidden" id="reset-password-page-logo">
                <div className="relative top-1/2 -translate-y-1/2 overflow-y-auto">
                    <img className="m-auto" src={LoginLogo} alt="Scrum Poker" />
                </div>
            </div>
            <div className="w-full p-4">
                <div className="relative top-1/2 -translate-y-1/2">
                    <Card className="max-w-full m-auto rounded-md p-4 flex flex-col gap-4 w-96 shadow-xl border-2 border-gray-200" elevation={4}>
                        <div className="text-center text-3xl font-bold text-ellipsis overflow-hidden whitespace-nowrap">Reset Password</div>
                        <Divider />
                        <div className="flex flex-col gap-4">
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
                                        disabled={input.disabled || isLoading}
                                        onChange={input.onChange}
                                        onKeyDown={pressEnter(submit)}
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
                                variant='contained'
                                size='medium'
                                className='h-full rounded-md px-2 py-1'
                                onClick={submit}
                                color='success'
                                disabled={isLoading || password.length < 6 || confirmPassword.length < 6 || password !== confirmPassword}
                            >
                                Submit
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
