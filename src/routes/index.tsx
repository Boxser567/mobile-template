import type { FC } from 'react';
import type { RouteObject } from 'react-router';

import { lazy } from 'react';
import { useRoutes } from 'react-router-dom';

const HomePage = lazy(() => import('@/pages/home'));
const ChatPage = lazy(() => import('@/pages/chat'));

const routeList: RouteObject[] = [
  {
    path: '/',
    // element: <HomePage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: '/chat/:id',
        element: <ChatPage />,
      },
    ],
  },
];

const RenderRouter: FC = () => {
  const element = useRoutes(routeList);

  return element;
};

export default RenderRouter;
