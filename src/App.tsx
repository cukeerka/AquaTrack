import { useState, useEffect } from 'react';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LandingPage } from './components/LandingPage';
import { LoginForm } from './components/LoginForm';
import { RegisterForm } from './components/RegisterForm';
import { Header } from './components/Header';
import { MonitoringPage } from './components/MonitoringPage';
import { PredictionsPage } from './components/PredictionsPage';
import { LimitsPage } from './components/LimitsPage';
import { AdminPage } from './components/AdminPage';
import { Toaster } from './components/ui/sonner';

type AuthView = 'landing' | 'login' | 'register';
type Page = 'landing' | 'monitoring' | 'predictions' | 'limits' | 'admin';

const AppContent = () => {
  const { user } = useAuth();
  const [authView, setAuthView] = useState<AuthView>('landing');
  const [currentPage, setCurrentPage] = useState<Page>('monitoring');

  if (!user) {
    if (authView === 'landing') {
      return (
        <LandingPage 
          onNavigateToLogin={() => setAuthView('login')} 
          onNavigateToRegister={() => setAuthView('register')} 
        />
      );
    }
    
    return authView === 'login' ? (
      <LoginForm onSwitchToRegister={() => setAuthView('register')} />
    ) : (
      <RegisterForm onSwitchToLogin={() => setAuthView('login')} />
    );
  }

  // User is logged in
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header currentPage={currentPage} onNavigate={(page) => setCurrentPage(page as Page)} />
      
      {currentPage === 'landing' && (
        <LandingPage 
          onNavigateToLogin={() => setCurrentPage('monitoring')} 
          onNavigateToRegister={() => setCurrentPage('monitoring')}
          isLoggedIn={true}
          onNavigateToApp={() => setCurrentPage('monitoring')}
        />
      )}
      {currentPage === 'monitoring' && <MonitoringPage />}
      {currentPage === 'predictions' && <PredictionsPage />}
      {currentPage === 'limits' && <LimitsPage />}
      {currentPage === 'admin' && user.role === 'admin' && <AdminPage />}
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <AppContent />
          <Toaster />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}