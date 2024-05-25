import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { IndexPage } from './pages/IndexPage';
import { TestPage } from './pages/TestPage';
import { Layout } from './Layout';

const router = createMemoryRouter([
  {
    path: '/',
    element: <Layout><IndexPage /></Layout>,
  },
  {
    path: '/test',
    element: <Layout><TestPage /></Layout>,
  },
]);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    {/* <App /> */}
    <RouterProvider router={router} />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
