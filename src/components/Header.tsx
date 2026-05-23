import { useState } from 'react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Droplet, LogOut, Globe, Moon, Sun, Menu, X } from 'lucide-react';

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPage, onNavigate }) => {
  const { language, setLanguage, t } = useLanguage();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  // Стан для мобільного меню
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Навігація з авто-закриттям меню на телефоні
  const handleNavigate = (page: string) => {
    onNavigate(page);
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-white dark:bg-[#141922] border-b border-gray-200 dark:border-white/10 sticky top-0 z-50 backdrop-blur-sm bg-white/95 dark:bg-[#141922]/95">
      <div className="container mx-auto px-4 py-4 relative">
        <div className="flex items-center justify-between">
          
          {/* ЛОГОТИП (Завжди зліва, займає 33% ширини на ПК) */}
          <div className="flex md:w-1/3 justify-start">
            <button 
              onClick={() => handleNavigate('landing')}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <Droplet className="h-8 w-8 text-[#385BA5] dark:text-[#5b8de5]" />
              <span className="text-xl font-bold">AquaTrack</span>
            </button>
          </div>
          
          {/* КНОПКИ НАВІГАЦІЇ (Тільки на ПК, строго по центру, займає 33%) */}
          <nav className="hidden md:flex items-center justify-center gap-2 md:w-1/3">
            <Button variant={currentPage === 'monitoring' ? 'default' : 'ghost'} onClick={() => handleNavigate('monitoring')}>
              {t('monitoring')}
            </Button>
            <Button variant={currentPage === 'predictions' ? 'default' : 'ghost'} onClick={() => handleNavigate('predictions')}>
              {t('predictions')}
            </Button>
            <Button variant={currentPage === 'limits' ? 'default' : 'ghost'} onClick={() => handleNavigate('limits')}>
              {t('limits')}
            </Button>
            {user?.role === 'admin' && (
              <Button variant={currentPage === 'admin' ? 'default' : 'ghost'} onClick={() => handleNavigate('admin')}>
                {t('admin')}
              </Button>
            )}
          </nav>

          {/* ПРАВА ПАНЕЛЬ (Тільки на ПК, справа, займає 33%) */}
          <div className="hidden md:flex items-center justify-end gap-3 md:w-1/3">
            <Button variant="outline" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>

            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <Select value={language} onValueChange={(value: 'en' | 'uk') => setLanguage(value)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="uk">Українська</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button variant="outline" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              {t('logout')}
            </Button>
          </div>

          {/* КНОПКА ГАМБУРГЕР (Тільки на мобільному) */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* ВИПАДАЮЧЕ МЕНЮ ДЛЯ МОБІЛЬНИХ ПРИСТРОЇВ */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white dark:bg-[#141922] border-b border-gray-200 dark:border-gray-700 shadow-lg p-4 flex flex-col gap-4 z-40">
            <nav className="flex flex-col gap-2">
              <Button variant={currentPage === 'monitoring' ? 'default' : 'ghost'} onClick={() => handleNavigate('monitoring')} className="justify-start">
                {t('monitoring')}
              </Button>
              <Button variant={currentPage === 'predictions' ? 'default' : 'ghost'} onClick={() => handleNavigate('predictions')} className="justify-start">
                {t('predictions')}
              </Button>
              <Button variant={currentPage === 'limits' ? 'default' : 'ghost'} onClick={() => handleNavigate('limits')} className="justify-start">
                {t('limits')}
              </Button>
              {user?.role === 'admin' && (
                <Button variant={currentPage === 'admin' ? 'default' : 'ghost'} onClick={() => handleNavigate('admin')} className="justify-start">
                  {t('admin')}
                </Button>
              )}
            </nav>

            <div className="flex flex-col gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button variant="outline" onClick={toggleTheme} className="justify-start">
                {theme === 'light' ? <><Moon className="h-4 w-4 mr-2" /> Темна тема</> : <><Sun className="h-4 w-4 mr-2" /> Світла тема</>}
              </Button>

              <Select value={language} onValueChange={(value: 'en' | 'uk') => setLanguage(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="uk">Українська</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" onClick={() => { logout(); setIsMenuOpen(false); }} className="justify-start">
                <LogOut className="h-4 w-4 mr-2" />
                {t('logout')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};