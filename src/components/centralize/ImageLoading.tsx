import { CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";

export default function ImageLoading(props: {sizeClass: string, size?: 'small' | 'medium' | 'large', url: string, className?: string}) {
    const imagePlaceholder = "https://www.signfix.com.au/wp-content/uploads/2017/09/placeholder-600x400.png"
    const loadingSize = !props.size ? 'min-w-7 max-w-7 min-h-7 max-h-7' : props.size === 'medium' ? `min-w-[2rem] max-w-[2rem] min-h-[2rem] max-h-[2rem]` : 'min-w-[3.5rem] max-w-[3.5rem] min-h-[3.5rem] max-h-[3.5rem]'

    const [isLoading, setLoading] = useState(false);
    const [isError, setError] = useState(false);

    useEffect(() => {
        setLoading(true);
    }, [props.url]);

    return (
        <div>
            {isLoading && <div className={"w-full h-full aspect-square m-auto bg-gray-700 text-white animate-pulse " + props.sizeClass + (props.className ? ' ' + props.className : '')}>
                <div className={"relative left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 " + loadingSize}>
                    <CircularProgress color="inherit" className={loadingSize} />
                </div>
            </div>}

            {isError && <img
                src={imagePlaceholder}
                className="imgClass + ' object-cover rounded-md'"
            />}
            <img
                src={props.url}
                alt="Image"
                className={(isLoading ? 'absolute w-0 h-0 opacity-0' : `object-cover hover:brightness-90 ease-in duration-200 transition-[--tw-brightness] `) + props.sizeClass + (props.className ? ' ' + props.className : '')}
                loading="lazy"
                onLoad={() => {setLoading(false); setError(false)}}
                onError={() => {setLoading(false); setError(true)}}
            />
        </div>
    );
}
