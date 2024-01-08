import { Link } from "react-router-dom";
import { Button } from "@mui/material";

export function NotFoundPage() {
    return (
        <div className="relative w-screen h-screen flex overflow-y-auto bg-white">
            <div className="w-full p-4">
                <div className="relative top-1/2 -translate-y-1/2">
                    <div className="text-center text-black space-y-4 mt-6 max-w-md m-auto">
                        <img src="/images/404.avif" alt="Not found" />
                        {/* <div className="error mx-auto text-[#5a5c69] text-[7rem] relative leading-none w-[12.5rem]">404</div> */}
                        <span className="uppercase font-bold text-xl">PAGE NOT FOUND</span>
                        <div>The page you are looking for might have been removed, had its name changed or its temporary unavailable.</div>

                        <div className="flex gap-4 justify-center items-center">
                            <Button
                                variant="contained"
                                color="secondary"
                                className="mr-2"
                                onClick={() => history.back()}
                                startIcon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                                </svg>}
                            >
                                Back
                            </Button>

                            <Link to="/">
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                                    </svg>}
                                >
                                    Home
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}