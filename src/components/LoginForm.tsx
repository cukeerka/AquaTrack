import { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Droplet, Eye, EyeOff } from 'lucide-react';

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth(); // Беремо функцію з нашого оновленого контексту
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        setError(t('invalidEmailFormat') || "Введіть коректний email (наприклад: name@mail.com)");
        return; // Зупиняємо виконання, запит на сервер не йде
    }
    try {
      // Чекаємо, поки AuthContext зробить запит до C# і оновить стан
      await login(email, password);
      // Ніяких редиректів! App.tsx автоматично перемалює екран, щойно стан зміниться.
    } catch (err) {
      setError(t("loginError") || "Помилка входу. Перевірте email та пароль.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 dark:from-[#0a0e13] dark:via-[#0f1419] dark:to-[#141922] p-4">
      <Card className="w-full max-w-md shadow-xl dark:shadow-2xl dark:shadow-black/50 border-gray-200 dark:border-white/10 mx-auto">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col items-center text-center mb-6 sm:mb-8">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-3 sm:mb-4 bg-[#385BA5] dark:bg-[#5b8de5]">
              <Droplet className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">AquaTrack</h1>
            <h2 className="text-lg sm:text-xl mb-2">{t('login')}</h2>
            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm px-2">
              {t('loginSubtitle')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm">{t('email')}</Label>
              <Input
                id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="border-gray-300 dark:border-white/20 bg-transparent dark:bg-input-background w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm">{t('password')}</Label>
              <div className="relative">
                <Input
                  id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required
                  className="border-gray-300 dark:border-white/20 bg-transparent dark:bg-input-background pr-10 w-full"
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="h-5 w-5 text-gray-500" /> : <Eye className="h-5 w-5 text-gray-500" />}
                </button>
              </div>
            </div>

            {error && <div className="text-red-500 text-xs sm:text-sm text-center font-medium">{error}</div>}

            <Button type="submit" className="w-full bg-[#385BA5] hover:bg-[#2d4880] text-white">
              {t('login')}
            </Button>
          </form>
          
          <div className="mt-6 text-center space-y-3">
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 italic">
              {t('joinMessage')}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {t('noAccount')}{' '}
              <button onClick={onSwitchToRegister} className="hover:underline font-medium text-[#385BA5]">
                {t('register')}
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};