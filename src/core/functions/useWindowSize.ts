import { useEffect, useState } from "react";

export default function useWindowSize() {
    const [windowSize, setWindowSize] = useState({width: window.innerWidth, height: window.innerHeight});

    useEffect(() => {
        const handleWindowResize = () => setWindowSize({width: window.innerWidth, height: window.innerHeight});
        window.addEventListener('resize', handleWindowResize);
        return () => window.removeEventListener('resize', handleWindowResize);
    }, []);

    return { width: windowSize.width, height: windowSize.height }
}
