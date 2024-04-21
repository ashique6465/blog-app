

import './App.css';
import { Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import IndexPage from './pages/IndexPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { UserContextProvider } from './userContext';
import CreatePost from './pages/CreatePost';
function App() {
  return (
    <UserContextProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Nested routes for "/" */}
          <Route index element={<IndexPage />} />

          {/* Route for "/login" */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path='/create' element={<CreatePost />} />
        </Route>
      </Routes>
    </UserContextProvider>

  );
}

export default App;



