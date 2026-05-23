import { Button } from './ui/button';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
// ДОДАНО: іконка Download
import { Droplet, BarChart3, Bell, Users, TrendingDown, Database, Zap, Globe, Moon, Sun, Download } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface LandingPageProps {
  onNavigateToLogin: () => void;
  onNavigateToRegister: () => void;
  isLoggedIn?: boolean;
  onNavigateToApp?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ 
  onNavigateToLogin, 
  onNavigateToRegister,
  isLoggedIn = false,
  onNavigateToApp
}) => {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f0f4f8] to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header - only show when not logged in */}
      {!isLoggedIn && (
        <header className="border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Droplet className="h-8 w-8" style={{ color: '#385BA5' }} />
                <span className="text-xl text-gray-900 dark:text-white font-semibold">AquaTrack</span>
              </div>
              
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={toggleTheme}
                  aria-label="Toggle theme"
                  className="shrink-0"
                >
                  {theme === 'light' ? (
                    <Moon className="h-4 w-4" />
                  ) : (
                    <Sun className="h-4 w-4" />
                  )}
                </Button>

                <div className="flex items-center gap-2 shrink-0">
                  <Globe className="h-4 w-4 text-gray-600 dark:text-gray-400 hidden sm:block" />
                  <Select value={language} onValueChange={(value: 'en' | 'uk') => setLanguage(value)}>
                    <SelectTrigger className="w-[100px] sm:w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="uk">Українська</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {isLoggedIn ? (
                  <Button onClick={onNavigateToApp} className="w-full sm:w-auto mt-2 sm:mt-0">
                    {t('goToDashboard')}
                  </Button>
                ) : (
                  <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                    <Button variant="outline" onClick={onNavigateToLogin} className="flex-1 sm:flex-none">
                      {t('login')}
                    </Button>
                    <Button onClick={onNavigateToRegister} className="flex-1 sm:flex-none bg-[#385BA5] hover:bg-[#2d4880] text-white">
                      {t('getStarted')}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Hero Section */}
      <section className="py-16 md:py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="flex justify-center mb-6">
            <Droplet className="h-16 w-16 md:h-20 md:w-20 text-[#385BA5] dark:text-[#5b8de5]" />
          </div>
          <h1 className="text-4xl md:text-5xl mb-6 text-gray-900 dark:text-white font-bold leading-tight">
            {t('heroTitle')}
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 px-2 md:px-0">
            {t('heroSubtitle')}
          </p>
          
          {/* ЗМІНЕНО: розширено max-w-md до max-w-2xl щоб помістилися 3 кнопки, і додано кнопку завантаження */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-2xl mx-auto">
            <Button size="lg" className="w-full sm:w-auto bg-[#385BA5] hover:bg-[#2d4880] text-white" onClick={onNavigateToRegister}>
              {t('getStarted')}
            </Button>
            
            <Button size="lg" variant="outline" className="w-full sm:w-auto" onClick={() => {
              document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
            }}>
              {t('learnMore')}
            </Button>

            <a href="https://drive.google.com/drive/folders/1BJG7SC7AGC0gQ7pkE77kh4FiGuF_KWbP?usp=sharing" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto outline-none">
              <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2 border-green-600 text-green-600 hover:bg-green-50 dark:border-green-500 dark:text-green-500 dark:hover:bg-green-950/30">
              <Download className="w-5 h-5" />
                Windows App
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 md:py-20 px-4 bg-white dark:bg-[#141922]">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-2xl md:text-3xl text-center mb-8 md:mb-12 text-gray-900 dark:text-white font-bold">
            {t('features')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="text-center p-6 rounded-lg bg-gray-50 dark:bg-[#1a1f26] border border-gray-200 dark:border-white/10 transition-transform hover:-translate-y-1">
              <div className="flex justify-center mb-4">
                <BarChart3 className="h-10 w-10 md:h-12 md:w-12 text-[#385BA5] dark:text-[#5b8de5]" />
              </div>
              <h3 className="text-lg md:text-xl mb-3 text-gray-900 dark:text-white font-semibold">
                {t('featureMonitoringTitle')}
              </h3>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
                {t('featureMonitoringDesc')}
              </p>
            </div>

            <div className="text-center p-6 rounded-lg bg-gray-50 dark:bg-[#1a1f26] border border-gray-200 dark:border-white/10 transition-transform hover:-translate-y-1">
              <div className="flex justify-center mb-4">
                <Bell className="h-10 w-10 md:h-12 md:w-12 text-[#385BA5] dark:text-[#5b8de5]" />
              </div>
              <h3 className="text-lg md:text-xl mb-3 text-gray-900 dark:text-white font-semibold">
                {t('featureLimitsTitle')}
              </h3>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
                {t('featureLimitsDesc')}
              </p>
            </div>

            <div className="text-center p-6 rounded-lg bg-gray-50 dark:bg-[#1a1f26] border border-gray-200 dark:border-white/10 transition-transform hover:-translate-y-1">
              <div className="flex justify-center mb-4">
                <Users className="h-10 w-10 md:h-12 md:w-12 text-[#385BA5] dark:text-[#5b8de5]" />
              </div>
              <h3 className="text-lg md:text-xl mb-3 text-gray-900 dark:text-white font-semibold">
                {t('featureAdminTitle')}
              </h3>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
                {t('featureAdminDesc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-16 md:py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-2xl md:text-3xl text-center mb-8 md:mb-12 text-gray-900 dark:text-white font-bold">
            {t('whyChoose')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="p-6">
              <div className="flex justify-center mb-4">
                <TrendingDown className="h-10 w-10 text-green-600 dark:text-green-500" />
              </div>
              <h3 className="text-lg md:text-xl mb-3 text-center text-gray-900 dark:text-white font-semibold">
                {t('whyEcoTitle')}
              </h3>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 text-center">
                {t('whyEcoDesc')}
              </p>
            </div>

            <div className="p-6">
              <div className="flex justify-center mb-4">
                <Database className="h-10 w-10 text-green-600 dark:text-green-500" />
              </div>
              <h3 className="text-lg md:text-xl mb-3 text-center text-gray-900 dark:text-white font-semibold">
                {t('whyDataTitle')}
              </h3>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 text-center">
                {t('whyDataDesc')}
              </p>
            </div>

            <div className="p-6">
              <div className="flex justify-center mb-4">
                <Zap className="h-10 w-10 text-green-600 dark:text-green-500" />
              </div>
              <h3 className="text-lg md:text-xl mb-3 text-center text-gray-900 dark:text-white font-semibold">
                {t('whyIotTitle')}
              </h3>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 text-center">
                {t('whyIotDesc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 px-4 bg-gradient-to-r dark:from-gray-800 dark:to-gray-900" style={{ background: 'linear-gradient(to right, #385BA5, #2d4a85)' }}>
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-2xl md:text-3xl mb-6 text-white font-semibold px-2 md:px-0">
            {t('heroSubtitle')}
          </h2>
          <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white hover:bg-gray-100" style={{ color: '#385BA5' }} onClick={onNavigateToRegister}>
            {t('getStarted')}
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-gray-900 dark:bg-black">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Droplet className="h-6 w-6 text-white" />
            <span className="text-white font-semibold">AquaTrack</span>
          </div>
          <p className="text-sm md:text-base text-gray-400 px-4 md:px-0">
            © 2025 AquaTrack. {t('heroSubtitle')}
          </p>
        </div>
      </footer>
    </div>
  );
};