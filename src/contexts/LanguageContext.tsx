import React, { createContext, useContext, useState } from 'react';

type Language = 'en' | 'uk';

interface Translations {
  [key: string]: {
    en: string;
    uk: string;
  };
}

const translations: Translations = {
  // Auth
  login: { en: 'Login', uk: 'Вхід' },
  loginSubtitle: { en: 'Enter your email to sign in to this site', uk: 'Введіть свою електронну пошту, щоб увійти на цей сайт' },
  register: { en: 'Register', uk: 'Реєстрація' },
  registerSubtitle: { en: 'Create an account to get started', uk: 'Створіть обліковий запис, щоб почати' },
  email: { en: 'Email', uk: 'Електронна пошта' },
  password: { en: 'Password', uk: 'Пароль' },
  confirmPassword: { en: 'Confirm Password', uk: 'Підтвердіть пароль' },
  fullName: { en: 'Full Name', uk: 'Повне ім\'я' },
  noAccount: { en: "Don't have an account?", uk: 'Немає облікового запису?' },
  haveAccount: { en: 'Already have an account?', uk: 'Вже є обліковий запис?' },
  emailRequired: { en: 'Please enter your email address', uk: 'Будь ласка, введіть вашу електронну пошту' },
  passwordRequired: { en: 'Please enter your password', uk: 'Будь ласка, введіть ваш пароль' },
  nameRequired: { en: 'Please enter your full name', uk: 'Будь ласка, введіть ваше повне ім\'я' },
  confirmPasswordRequired: { en: 'Please confirm your password', uk: 'Будь ласка, підтвердіть ваш пароль' },
  joinMessage: { en: 'Join AquaTrack and help save our planet, one drop at a time 💧', uk: 'Приєднуйтесь до AquaTrack і допоможіть зберегти нашу планету, крапля за краплею 💧' },
  invalidEmailFormat: { en: 'Please enter a valid email (e.g., name@mail.com)', uk: 'Введіть коректний email (наприклад: name@mail.com)' },
  
  // Navigation
  dashboard: { en: 'Dashboard', uk: 'Панель управління' },
  monitoring: { en: 'Monitoring', uk: 'Моніторинг' },
  limits: { en: 'Limits', uk: 'Ліміти' },
  admin: { en: 'Admin', uk: 'Адміністратор' },
  logout: { en: 'Logout', uk: 'Вихід' },
  
  // Monitoring & Common
  liter: { en: 'L', uk: 'Л' },
  waterConsumption: { en: 'Water Consumption Monitoring', uk: 'Моніторинг споживання води' },
  selectDate: { en: 'Select Date From', uk: 'Виберіть дату від' },
  date: { en: 'Date', uk: 'Дата' },
  value: { en: 'Value', uk: 'Значення' },
  device: { en: 'Device', uk: 'Пристрій' },
  consumptionData: { en: 'Consumption Data', uk: 'Дані споживання' },
  totalConsumption: { en: 'Total Consumption', uk: 'Загальне споживання' },
  averageDaily: { en: 'Average Daily', uk: 'Середнє за день' },
  dailyComparison: { en: 'Daily Comparison', uk: 'Щоденне порівняння' },
  yourAverage: { en: 'Your Average', uk: 'Ваше середнє' },
  buildingAverage: { en: 'Building Average', uk: 'Середнє по будинку' },
  savings: { en: 'Savings (Below Limit)', uk: 'Економія (В межах ліміту)' },
  overspending: { en: 'Overspending (Above Limit)', uk: 'Перевитрата (Понад ліміт)' },
  streakMsg1: { en: "Congratulations! You've stayed below your limit for ", uk: "Вітаємо! Ви не перевищуєте ліміт " },
  streakMsg2: { en: " days in a row! 🎉", uk: " днів поспіль! 🎉" },
  
  // Limits
  limitsManagement: { en: 'Water Usage Limits', uk: 'Ліміти споживання води' },
  createLimit: { en: 'Create New Limit', uk: 'Створити новий ліміт' },
  startDate: { en: 'Start Date', uk: 'Дата початку' },
  endDate: { en: 'End Date', uk: 'Дата закінчення' },
  limitValue: { en: 'Limit Value', uk: 'Значення ліміту' },
  deviceNumber: { en: 'Device Number', uk: 'Номер пристрою' },
  save: { en: 'Save', uk: 'Зберегти' },
  cancel: { en: 'Cancel', uk: 'Скасувати' },
  delete: { en: 'Delete', uk: 'Видалити' },
  actions: { en: 'Actions', uk: 'Дії' },
  overLimit: { en: 'Over Limit', uk: 'Перевищення' },
  withinLimit: { en: 'Within Limit', uk: 'В нормі' },
  
  // Confirmation dialogs
  confirmDelete: { en: 'Confirm Deletion', uk: 'Підтвердження видалення' },
  confirmDeleteLimit: { en: 'Are you sure you want to delete this limit? This action cannot be undone.', uk: 'Ви впевнені, що хочете видалити цей ліміт? Цю дію неможливо скасувати.' },
  confirmDeleteUser: { en: 'Are you sure you want to delete this user? This action cannot be undone.', uk: 'Ви впевнені, що хочете видалити цього користувача? Цю дію неможливо скасувати.' },
  confirmDeleteDevice: { en: 'Are you sure you want to delete this device? This action cannot be undone.', uk: 'Ви впевнені, що хочете видалити цей пристрій? Цю дію неможливо скасувати.' },
  
  // Admin
  userManagement: { en: 'User Management', uk: 'Управління користувачами' },
  deviceManagement: { en: 'IoT Device Management', uk: 'Управління IoT пристроями' },
  name: { en: 'Name', uk: 'Ім\'я' },
  role: { en: 'Role', uk: 'Роль' },
  changeRole: { en: 'Change Role', uk: 'Змінити роль' },
  user: { en: 'User', uk: 'Користувач' },
  deviceId: { en: 'Device ID', uk: 'ID пристрою' },
  location: { en: 'Location', uk: 'Місцезнаходження' },
  status: { en: 'Status', uk: 'Статус' },
  active: { en: 'Active', uk: 'Активний' },
  inactive: { en: 'Inactive', uk: 'Неактивний' },
  addNewSensor: { en: 'Add new IoT Sensor', uk: 'Додати новий IoT датчик' },
  bindSensor: { en: 'Bind Sensor', uk: 'Прив\'язати датчик' },
  
  // Landing Page
  heroTitle: { en: 'Monitor Water Usage, Save Our Planet', uk: 'Контролюйте споживання води, рятуйте нашу планету' },
  heroSubtitle: { en: 'Join AquaTrack and help save our planet, one drop at a time 💧', uk: 'Приєднуйтесь до AquaTrack і допоможіть врятувати нашу планету, краплю за краплею 💧' },
  getStarted: { en: 'Get Started', uk: 'Розпочати' },
  learnMore: { en: 'Learn More', uk: 'Дізнатися більше' },
  features: { en: 'Features', uk: 'Можливості' },
  featureMonitoringTitle: { en: 'Real-Time Monitoring', uk: 'Моніторинг в реальному часі' },
  featureMonitoringDesc: { en: 'Track water consumption across all your devices with detailed analytics and visual charts', uk: 'Відстежуйте споживання води на всіх ваших пристроях з детальною аналітикою та візуальними графіками' },
  featureLimitsTitle: { en: 'Smart Limits', uk: 'Розумні ліміти' },
  featureLimitsDesc: { en: 'Set custom water usage limits and receive alerts when you exceed your targets', uk: 'Встановлюйте власні ліміти споживання води та отримуйте сповіщення при їх перевищенні' },
  featureAdminTitle: { en: 'Easy Management', uk: 'Просте управління' },
  featureAdminDesc: { en: 'Manage users and IoT devices from a single, intuitive admin dashboard', uk: 'Керуйте користувачами та IoT пристроями з єдиної, інтуїтивної панелі адміністратора' },
  whyChoose: { en: 'Why Choose AquaTrack?', uk: 'Чому AquaTrack?' },
  whyEcoTitle: { en: 'Eco-Friendly', uk: 'Екологічно чисто' },
  whyEcoDesc: { en: 'Every drop counts. Help reduce water waste and protect our environment', uk: 'Кожна крапля має значення. Допоможіть зменшити витрати води та захистити наше довкілля' },
  whyDataTitle: { en: 'Data-Driven Insights', uk: 'Аналітика на основі даних' },
  whyDataDesc: { en: 'Make informed decisions with comprehensive reports and visualizations', uk: 'Приймайте обґрунтовані рішення з комплексними звітами та візуалізаціями' },
  whyIotTitle: { en: 'IoT Integration', uk: 'Інтеграція IoT' },
  whyIotDesc: { en: 'Seamlessly connect with your water meters and smart devices', uk: 'Легко підключайтеся до ваших лічильників води та розумних пристроїв' },
  goToDashboard: { en: 'Go to Dashboard', uk: 'Перейти до панелі' },
  
  // ML Predictions
  predictions: { en: 'Predictions', uk: 'Прогнози' },
  mlPredictions: { en: 'AI Water Consumption Forecasting', uk: 'Прогнозування споживання води за допомогою ШІ' },
  mlPredictionsDesc: { en: 'Advanced machine learning predictions and anomaly detection', uk: 'Розширені прогнози машинного навчання та виявлення аномалій' },
  modelAccuracy: { en: 'Model Accuracy', uk: 'Точність моделі' },
  avgConfidence: { en: 'Avg. Confidence', uk: 'Сер. впевненість' },
  anomaliesDetected: { en: 'Anomalies Detected', uk: 'Виявлено аномалій' },
  lastTraining: { en: 'Last Training', uk: 'Останнє навчання' },
  last14Days: { en: 'Last 14 days', uk: 'Останні 14 днів' },
  autoRetrained: { en: 'Auto-retrained daily', uk: 'Автоматичне навчання щодня' },
  weeklyForecast: { en: 'Weekly Forecast Summary', uk: 'Тижневий прогноз' },
  next7Days: { en: 'Next 7 days prediction', uk: 'Прогноз на наступні 7 днів' },
  predictedTotal: { en: 'Predicted Total', uk: 'Загальний об\'єм' },
  dailyAverage: { en: 'Daily Average', uk: 'Середнє за день' },
  daysOverLimit: { en: 'Days Over Limit', uk: 'Днів з перевищенням' },
  warning: { en: 'Warning', uk: 'Увага' },
  good: { en: 'Good', uk: 'Норма' },
  consumptionForecast: { en: '7-Day Consumption Forecast', uk: 'Графік ШІ прогнозу' },
  historicalAndPredicted: { en: 'Historical data with ML predictions and confidence intervals', uk: 'Історичні дані та передбачення майбутнього' },
  actualData: { en: 'Actual Data', uk: 'Фактичні дані' },
  predictedData: { en: 'Predicted Data', uk: 'Прогноз' },
  confidenceInterval: { en: 'Confidence Interval', uk: 'Межі довіри ШІ' },
  anomalyDetection: { en: 'Anomaly Detection', uk: 'Детектор аномалій' },
  unusualPatternsDetected: { en: 'Unusual consumption patterns detected by ML model', uk: 'Алгоритм фіксує нетипові патерни споживання' },
  actual: { en: 'Actual', uk: 'Фактично' },
  expected: { en: 'Expected', uk: 'Очікувано' },
  detailedForecast: { en: 'Detailed Forecast', uk: 'Деталізований прогноз' },
  dailyPredictionsWithConfidence: { en: 'Daily predictions with confidence ranges', uk: 'Прогнози по днях з урахуванням похибки' },
  dayOfWeek: { en: 'Day of Week', uk: 'День' },
  predicted: { en: 'Predicted', uk: 'Прогноз' },
  confidenceRange: { en: 'Confidence Range', uk: 'Межі довіри' },
  refreshModel: { en: 'Refresh Model', uk: 'Оновити' },
  
  // Severity
  high: { en: 'HIGH', uk: 'ВИСОКИЙ' },
  medium: { en: 'MEDIUM', uk: 'СЕРЕДНІЙ' },
  low: { en: 'LOW', uk: 'НИЗЬКИЙ' },
  
  // Export and Model Training
  exportReport: { en: 'Export', uk: 'Експорт' },
  exportCSV: { en: 'Export CSV', uk: 'CSV Файл' },
  exportPDF: { en: 'Export Report', uk: 'Текстовий Звіт' },
  exportSuccess: { en: 'Success', uk: 'Успіх' },
  csvDownloaded: { en: 'CSV file has been downloaded', uk: 'CSV файл завантажено' },
  pdfDownloaded: { en: 'Report file has been downloaded', uk: 'Звіт завантажено' },
  
  // Model Retraining
  retrainNow: { en: 'Retrain Model', uk: 'Довчити модель' },
  training: { en: 'Training...', uk: 'Тренування...' },
  modelRetraining: { en: 'Model Retraining', uk: 'Тренування моделі' },
  modelRetrainingInProgress: { en: 'The AI model is analyzing new data...', uk: 'Нейромережі потрібно трохи часу для аналізу нових даних...' },
  modelRetrainingComplete: { en: 'Model retraining has been completed successfully!', uk: 'Навчання успішно завершено!' },
  progress: { en: 'Progress', uk: 'Прогрес' },
  analyzingData: { en: 'Analyzing historical data...', uk: 'Аналіз сирих даних...' },
  buildingModel: { en: 'Building prediction matrix...', uk: 'Побудова матриці SSA...' },
  validatingModel: { en: 'Validating model accuracy...', uk: 'Вирахування похибки...' },
  finalizingModel: { en: 'Saving model...', uk: 'Збереження моделі...' },
  modelReady: { en: 'AI is ready!', uk: 'ШІ готовий до роботи' },
  modelRetrainSuccess: { en: 'Model Updated', uk: 'Модель оновлено' },
  
  // Alert Notifications
  alertNotifications: { en: 'Alert Notifications', uk: 'Сповіщення' },
  alertNotificationsDesc: { en: 'Configure AI notifications', uk: 'Налаштування сповіщень ШІ' },
  anomalyAlerts: { en: 'Anomaly Alerts', uk: 'Аномальні сплески' },
  anomalyAlertsDesc: { en: 'Get notified of unusual consumption', uk: 'Сповіщати при нетиповому споживанні' },
  limitAlerts: { en: 'Limit Alerts', uk: 'Попередження лімітів' },
  limitAlertsDesc: { en: 'Get notified about predicted limit breaches', uk: 'Сповіщати про прогнозоване перевищення' },
  anomalyAlert: { en: 'Anomalies Found!', uk: 'Знайдено аномалії!' },
  highSeverityAnomalies: { en: 'critical spikes in consumption', uk: 'критичних сплесків споживання' },
  forecastLimitAlert: { en: 'Limit Exceedance Warning', uk: 'Увага: Перевищення ліміту' },
  daysExpectedOverLimit: { en: 'days with predicted exceedance', uk: 'днів з прогнозованим перевищенням норми' },
  refreshingPredictions: { en: 'Loading new predictions...', uk: 'Завантаження нових прогнозів...' },
  predictionsRefreshed: { en: 'Data updated successfully', uk: 'Дані успішно оновлено' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};