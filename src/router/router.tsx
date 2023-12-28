import { NonIndexRouteObject, Route, Routes } from "react-router-dom";
import HomePage from '../pages';
import PokerRoomPage from "../pages/[room]";
import { NotFoundPage } from "../pages/error/not-found";

interface RouterObject extends NonIndexRouteObject {
    title?: string
}

const routers: RouterObject[] = [
    {
        title: 'Home Page',
        path: '/',
        element: <HomePage />,
    },
    {
        title: 'Poker Room Page',
        path: '/:room',
        element: <PokerRoomPage />,
    },
];

export function Page(props: {element: React.ReactNode, title?: string}) {
    document.title = `Tokagile Poker | ${props.title || 'Not Found'}`;
    return props.element;
}

export default function Router() {
    return (
        <Routes>
            {routers.map((router, index) => {
                return (
                    <Route
                        key={index}
                        path={router.path}
                        element={<Page key={index} title={router.title} element={router.element} />}
                    />
                );
            })}
            <Route path="*" element={<Page element={<NotFoundPage />} />}></Route>
        </Routes>
    );
}
