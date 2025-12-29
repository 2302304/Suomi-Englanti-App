import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Practice from './pages/Practice';
import SentencePractice from './pages/SentencePractice';
import Dictionary from './pages/Dictionary';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  return token ? <>{children}</> : <Navigate to="/" />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/practice"
          element={
            <PrivateRoute>
              <Practice />
            </PrivateRoute>
          }
        />
        <Route
          path="/sentences"
          element={
            <PrivateRoute>
              <SentencePractice />
            </PrivateRoute>
          }
        />
        <Route
          path="/dictionary"
          element={
            <PrivateRoute>
              <Dictionary />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
