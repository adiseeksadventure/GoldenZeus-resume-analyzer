import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Landing from './Landing';
import Login from './Login';
import Register from './Register';
import ResumeUpload from './ResumeUpload';
import Results from './Results';
import './App.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Landing />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/upload',
    element: <ResumeUpload />,
  },
  {
    path: '/results',
    element: <Results />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
