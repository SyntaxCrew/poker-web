import { Close } from "@mui/icons-material";
import { Slide, Alert as AlertMaterial, IconButton, Fade } from "@mui/material";
import { useEffect, useState } from "react";

export default function Alert(props: {isShowAlert: boolean, onDismiss: (isShowAlert: boolean) => void, severity: "success" | "info" | "warning" | "error", message: string}) {
    const [message, setMessage] = useState('');
    const [severity, setSeverity] = useState<"success" | "info" | "warning" | "error">('info');

    useEffect(() => {
        if (props.isShowAlert) {
            let timeout = 2;
            setSeverity(props.severity);
            setMessage(props.message);
            const interval = setInterval(() => {
                if (timeout > 0) {
                    timeout--;
                } else {
                    clearInterval(interval);
                    props.onDismiss(false);
                }
            }, 1000);
        }
    }, [props.isShowAlert]);

    return (
        <div className="fixed top-6 left-0 right-0 w-fit m-auto flex flex-col justify-start items-center z-[9999]">
            <Slide direction='down' in={props.isShowAlert} timeout={500} mountOnEnter unmountOnExit>
                <div>
                    <Fade in={props.isShowAlert} timeout={1000}>
                        <AlertMaterial
                            className="mx-4 shadow-lg"
                            severity={severity}
                            action={
                                <IconButton
                                    aria-label="close"
                                    color="inherit"
                                    size="small"
                                    onClick={() => props.onDismiss(false)}
                                >
                                    <Close fontSize="inherit" />
                                </IconButton>
                            }
                        >
                            { message }
                        </AlertMaterial>
                    </Fade>
                </div>
            </Slide>
        </div>
    );
}
