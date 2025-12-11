import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './components/Login';
import { Chat } from './components/Chat';
import { InstallPrompt } from './components/InstallPrompt';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return user ? <Chat /> : <Login />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
      <InstallPrompt />
    </AuthProvider>
  );
}

export default App;
