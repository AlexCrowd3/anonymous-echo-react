import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import Index from '@/pages/Index';
import NotFound from '@/pages/NotFound';
import { AuthForm } from '@/components/auth/AuthForm';
import GameMenu from '@/components/GameMenu';
import CreateChat from '@/components/CreateChat';
import JoinChat from '@/components/JoinChat';
import WaitingRoom from '@/components/waitUsers';
import GameInterface from '@/components/GameInterface';
import { useAuth } from '@/hooks/useAuth';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<LoginRedirector />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/menu" element={<GameMenu />} />
          <Route path="/create-chat" element={<CreateChat />} />
          <Route path="/join-chat" element={<JoinChat />} />
          <Route path="/waiting-room/:id" element={<WaitingRoom />} />
          <Route path="/playing/:chatId" element={<GameInterface />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

const LoginRedirector = () => {
  const { user } = useAuth();
  return user ? <Navigate to="/menu" replace /> : <Navigate to="/" replace />;
};

export default App;