import { MouseEvent } from "react";
import { IconButton } from "@mui/material";
import ImageLoading from "../centralize/ImageLoading";
import { UserProfile } from "../../models/user";

export default function Avatar(props: {profile: UserProfile, onClick?: (event: MouseEvent<HTMLButtonElement>) => void, size?: 'small' | 'medium' | 'large', bottomElement?: JSX.Element}) {
    const sizeClass = !props.size ? 'min-w-10 max-w-10 min-h-10 max-h-10' : props.size === 'medium' ? `min-w-[3.25rem] max-w-[3.25rem] min-h-[3.25rem] max-h-[3.25rem]` : 'min-w-[6rem] max-w-[6rem] min-h-[6rem] max-h-[6rem]'
    return (
        <div className="relative">
            <IconButton
                color="inherit"
                size="small"
                onClick={e => props.onClick && props.onClick(e)}
                className={"w-fit" + (!props.onClick ? ' !cursor-default' : '')}
                disableTouchRipple={!props.onClick}
            >
                {props.profile.imageURL
                    ? <ImageLoading sizeClass={sizeClass} url={props.profile.imageURL} size={props.size} className="rounded-full" />
                    : <div className="rounded-full bg-blue-300 hover:brightness-90 ease-in duration-200 transition-[--tw-brightness]">
                        <div className={`flex items-center justify-center font-bold text-white ` + sizeClass}>
                            <span className={props.size && props.size === 'large' ? 'text-5xl' : ''}>{ props.profile.displayName ? props.profile.displayName.charAt(0).toUpperCase() : 'G' }</span>
                        </div>
                    </div>
                }
            </IconButton>

            {props.bottomElement && <div className="absolute bottom-1 left-1 h-8 w-8 rounded-full bg-blue-200 text-blue-600 border-white border">
                <IconButton
                    color="inherit"
                    size="small"
                    onClick={e => props.onClick && props.onClick(e)}
                    className="w-fit"
                >
                    { props.bottomElement }
                </IconButton>
            </div>}
        </div>
    );
}
