import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useLanguage } from '../contexts/LanguageContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, ComposedChart } from 'recharts';
import { Brain, TrendingUp, AlertTriangle, CheckCircle2, Activity, Zap, Calendar, RefreshCw, Download, FileText, FileSpreadsheet, Bell, BellOff } from 'lucide-react';
import { Progress } from './ui/progress';
import { toast } from 'sonner@2.0.3';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Switch } from './ui/switch';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5055/api"; 
const DAILY_LIMIT = 280;

export const PredictionsPage: React.FC = () => {
  const { t, language } = useLanguage();
  
  // --- СТАНИ ДЛЯ АПІ ---
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- UI СТАНИ ---
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [showTrainingDialog, setShowTrainingDialog] = useState(false);
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [anomalyAlertsEnabled, setAnomalyAlertsEnabled] = useState(true);
  const [limitAlertsEnabled, setLimitAlertsEnabled] = useState(true);

  // --- ЗАВАНТАЖЕННЯ ДАНИХ ML ---
  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // БЕРЕМО ID КОРИСТУВАЧА ДЛЯ ІЗОЛЯЦІЇ
      const currentUserId = localStorage.getItem("userId") || "1";

      // 1. Завантажуємо результати роботи персональної моделі ML.NET
      const dashRes = await axios.get(`${API_BASE_URL}/analytics/dashboard/1`, {
        params: { userId: currentUserId }
      });
      setDashboardData(dashRes.data);

      // 2. Завантажуємо історію за останні 7 днів (тільки для цього користувача)
      const today = new Date();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(today.getDate() - 7);
      
      const histRes = await axios.get(`${API_BASE_URL}/water-usage/history`, {
        params: {
          startDate: sevenDaysAgo.toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0],
          userId: currentUserId
        }
      });

      // Агрегуємо історію по днях
      const dailyMap: Record<string, any> = {};
      histRes.data.forEach((item: any) => {
        const dateStr = new Date(item.Timestamp).toISOString().split('T')[0];
        if (!dailyMap[dateStr]) {
          dailyMap[dateStr] = { 
            date: dateStr, 
            actual: 0, 
            dayOfWeek: new Date(item.Timestamp).toLocaleDateString(language === 'uk' ? 'uk-UA' : 'en-US', { weekday: 'short' }) 
          };
        }
        dailyMap[dateStr].actual += item.UsageValue;
      });
      
      setHistoricalData(Object.values(dailyMap).sort((a: any, b: any) => a.date.localeCompare(b.date)));

    } catch (error) {
      console.error("Помилка завантаження ШІ-дані:", error);
      toast.error(t('errorLoadingData') || "Помилка завантаження прогнозів. Переконайтеся, що модель натренована.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []); // eslint-disable-next-line react-hooks/exhaustive-deps

  // --- МАПІНГ ДАНИХ ДЛЯ UI ---
  const forecastData = dashboardData?.Forecast?.map((d: any) => ({
    date: d.Date,
    dayOfWeek: d.DayOfWeek,
    predicted: d.Predicted,
    confidenceLow: d.ConfidenceLow,
    confidenceHigh: d.ConfidenceHigh
  })) || [];

  const anomalies = dashboardData?.Anomalies?.map((a: any) => ({
    id: a.Id,
    date: a.Date,
    value: a.Value,
    expected: a.Expected,
    deviation: a.Deviation,
    severity: a.Severity.toLowerCase(), // 'high', 'medium', 'low'
    reason: a.Reason,
    device: a.Device
  })) || [];

  const combinedData = [
    ...historicalData.map(d => ({ ...d, type: 'historical' })),
    ...forecastData.map((d: any) => ({ ...d, type: 'forecast' }))
  ];

  const modelAccuracy = dashboardData?.ModelAccuracy || 0;
  const avgConfidence = dashboardData?.AvgConfidence || 0;
  const lastTraining = dashboardData?.LastTraining || '---';

  const weeklyPredictedTotal = forecastData.reduce((sum: number, d: any) => sum + d.predicted, 0);
  const weeklyAverage = forecastData.length > 0 ? Math.round(weeklyPredictedTotal / forecastData.length) : 0;
  const daysOverLimit = forecastData.filter((d: any) => d.predicted > DAILY_LIMIT).length;

  // --- СПОВІЩЕННЯ (ALERTS) ---
  useEffect(() => {
    // Показуємо алерти тільки якщо дані вже завантажені і є що показувати
    if (!isLoading && alertsEnabled && forecastData.length > 0) {
      if (anomalyAlertsEnabled && anomalies.length > 0) {
        const highSeverityAnomalies = anomalies.filter((a: any) => a.severity === 'high');
        if (highSeverityAnomalies.length > 0) {
          toast.error(t('anomalyAlert') || "Знайдено аномалії!", {
            description: `${highSeverityAnomalies.length} ${t('highSeverityAnomalies') || "критичних сплесків споживання"}`,
            duration: 5000,
          });
        }
      }

      if (limitAlertsEnabled && daysOverLimit > 0) {
        toast.warning(t('forecastLimitAlert') || "Увага: Перевищення ліміту", {
          description: `${daysOverLimit} ${t('daysExpectedOverLimit') || "днів з прогнозованим перевищенням норми"}`,
          duration: 5000,
        });
      }
    }
  }, [isLoading, alertsEnabled, anomalyAlertsEnabled, limitAlertsEnabled, daysOverLimit, anomalies.length, t]); // eslint-disable-next-line react-hooks/exhaustive-deps

  // --- ДІЇ КОРИСТУВАЧА ---
  const handleRefresh = async () => {
    setIsRefreshing(true);
    toast.info(t('refreshingPredictions') || "Завантаження нових прогнозів...");
    await fetchDashboardData();
    setIsRefreshing(false);
    toast.success(t('predictionsRefreshed') || "Дані успішно оновлено");
  };

  const handleModelRetrain = async () => {
    setShowTrainingDialog(true);
    setIsTraining(true);
    setTrainingProgress(0);

    // Імітуємо швидкий прогрес для красивого UX, поки чекаємо відповіді від сервера
    const progressInterval = setInterval(() => {
      setTrainingProgress((prev) => {
        // Зупиняємось на 90%, чекаючи реальної відповіді від API
        if (prev >= 90) return 90; 
        return prev + 15;
      });
    }, 500);

    try {
      // РОБИМО РЕАЛЬНИЙ ЗАПИТ НА СЕРВЕР З ІЗОЛЯЦІЄЮ!
      const currentUserId = localStorage.getItem("userId") || "1";
      await axios.post(`${API_BASE_URL}/analytics/retrain/1`, null, {
        params: { userId: currentUserId }
      });
      
      // Коли сервер відповів успішно:
      clearInterval(progressInterval);
      setTrainingProgress(100);
      setIsTraining(false);
      
      toast.success(t('modelRetrainSuccess') || "Модель оновлено", {
        description: "ШІ успішно перенавчився на найсвіжіших даних",
      });

      // Через 2 секунди закриваємо вікно і оновлюємо графіки новими даними
      setTimeout(() => {
        setShowTrainingDialog(false);
        fetchDashboardData(); 
      }, 2000);

    } catch (error) {
      clearInterval(progressInterval);
      setIsTraining(false);
      setShowTrainingDialog(false);
      toast.error("Помилка тренування", {
        description: "Не вдалося оновити модель. Перевірте підключення до сервера."
      });
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    const csvContent = [
      ['Date', 'Day of Week', 'Predicted (L)', 'Confidence Low (L)', 'Confidence High (L)', 'Status'].join(','),
      ...forecastData.map((day: any) => [
        day.date,
        day.dayOfWeek,
        day.predicted,
        day.confidenceLow,
        day.confidenceHigh,
        day.predicted > DAILY_LIMIT ? 'Over Limit' : 'Within Limit'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `aquatrack-forecast-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(t('exportSuccess') || "Успіх", {
      description: t('csvDownloaded') || "CSV файл завантажено",
    });
  };

  // Export to PDF
  const exportToPDF = () => {
    const pdfContent = `
AquaTrack - Water Consumption Forecast Report
Generated: ${new Date().toLocaleString()}
==============================================

MODEL PERFORMANCE
-----------------
Accuracy: ${modelAccuracy}%
Average Confidence: ${avgConfidence}%
Last Training: ${lastTraining}

WEEKLY SUMMARY
--------------
Predicted Total: ${weeklyPredictedTotal} {t('liter')}
Daily Average: ${weeklyAverage} {t('liter')}
Days Over Limit (${DAILY_LIMIT}{t('liter')}): ${daysOverLimit}

DETAILED FORECAST
-----------------
${forecastData.map((day: any) => `
Date: ${day.date} (${day.dayOfWeek})
Predicted: ${day.predicted} {t('liter')}
Confidence Range: ${day.confidenceLow} - ${day.confidenceHigh} {t('liter')}
Status: ${day.predicted > DAILY_LIMIT ? 'OVER LIMIT' : 'Within Limit'}
`).join('\n')}

ANOMALIES DETECTED
------------------
${anomalies.map((a: any) => `
Date: ${a.date} | Device: ${a.device}
Severity: ${a.severity.toUpperCase()}
Actual: ${a.value} {t('liter')} | Expected: ${a.expected} {t('liter')} | Deviation: ${a.deviation} {t('liter')}
Reason: ${a.reason}
`).join('\n')}

==============================================
© AquaTrack - ML Management System
    `.trim();

    const blob = new Blob([pdfContent], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `aquatrack-forecast-report-${new Date().toISOString().split('T')[0]}.txt`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(t('exportSuccess') || "Успіх", {
      description: t('pdfDownloaded') || "Звіт завантажено",
    });
  };

  return (
<div className="max-w-7xl mx-auto px-4 py-8 w-full">
      {/* Адаптивний заголовок */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="mb-2 text-2xl font-bold">{t('mlPredictions') || "AI Прогнозування"}</h1>
          <p className="text-muted-foreground">{t('mlPredictionsDesc') || "Машинне навчання та пошук аномалій"}</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 flex-1 md:flex-none">
                <Download className="h-4 w-4" />
                {t('exportReport') || "Експорт"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={exportToCSV} className="gap-2 cursor-pointer">
                <FileSpreadsheet className="h-4 w-4" />
                {t('exportCSV') || "CSV Файл"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportToPDF} className="gap-2 cursor-pointer">
                <FileText className="h-4 w-4" />
                {t('exportPDF') || "Текстовий Звіт"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button 
            onClick={handleRefresh} 
            disabled={isRefreshing || isLoading}
            variant="outline"
            className="gap-2 flex-1 md:flex-none"
          >
            <RefreshCw className={`h-4 w-4 ${(isRefreshing || isLoading) ? 'animate-spin' : ''}`} />
            {t('refreshModel') || "Оновити"}
          </Button>
        </div>
      </div>

      {/* Alert Settings Card */}
      <Card className="mb-6 border-l-4 border-l-[#385BA5] dark:border-l-[#5b8de5]">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                {t('alertNotifications') || "Сповіщення"}
              </CardTitle>
              <CardDescription>{t('alertNotificationsDesc') || "Налаштування сповіщень ШІ"}</CardDescription>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              {alertsEnabled ? (
                <Bell className="h-5 w-5 text-[#385BA5] dark:text-[#5b8de5]" />
              ) : (
                <BellOff className="h-5 w-5 text-muted-foreground" />
              )}
              <Switch
                checked={alertsEnabled}
                onCheckedChange={setAlertsEnabled}
              />
            </div>
          </div>
        </CardHeader>
        {alertsEnabled && (
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="pr-4">
                  <p className="text-sm font-medium">{t('anomalyAlerts') || "Аномальні сплески"}</p>
                  <p className="text-xs text-muted-foreground">{t('anomalyAlertsDesc') || "Сповіщати при нетиповому споживанні"}</p>
                </div>
                <Switch
                  checked={anomalyAlertsEnabled}
                  onCheckedChange={setAnomalyAlertsEnabled}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="pr-4">
                  <p className="text-sm font-medium">{t('limitAlerts') || "Попередження лімітів"}</p>
                  <p className="text-xs text-muted-foreground">{t('limitAlertsDesc') || "Сповіщати про прогнозоване перевищення"}</p>
                </div>
                <Switch
                  checked={limitAlertsEnabled}
                  onCheckedChange={setLimitAlertsEnabled}
                />
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* ML Model Status Cards - Адаптивний Ґрід */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">{t('modelAccuracy') || "Точність моделі"}</CardTitle>
            <Brain className="h-4 w-4 text-[#385BA5] dark:text-[#5b8de5]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{modelAccuracy}%</div>
            <Progress value={modelAccuracy} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">{t('avgConfidence') || "Впевненість ШІ"}</CardTitle>
            <Activity className="h-4 w-4 text-green-600 dark:text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{avgConfidence}%</div>
            <Progress value={avgConfidence} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">{t('anomaliesDetected') || "Знайдено аномалій"}</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{anomalies.length}</div>
            <p className="text-xs text-muted-foreground mt-1">{t('last14Days') || "За останній період"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">{t('lastTraining') || "Останнє навчання"}</CardTitle>
            <Zap className="h-4 w-4 text-purple-600 dark:text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-sm truncate">{lastTraining}</div>
            <Button 
              size="sm" 
              variant="outline" 
              className="mt-2 w-full"
              onClick={handleModelRetrain}
              disabled={isTraining}
            >
              {isTraining ? t('training') || 'Тренування...' : t('retrainNow') || 'Довчити модель'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Model Training Dialog - Адаптивний */}
      <Dialog open={showTrainingDialog} onOpenChange={setShowTrainingDialog}>
        <DialogContent className="sm:max-w-[425px] w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-600 dark:text-purple-500" />
              {t('modelRetraining') || "Тренування моделі"}
            </DialogTitle>
            <DialogDescription>
              {isTraining 
                ? (t('modelRetrainingInProgress') || "Нейромережі потрібно трохи часу для аналізу нових даних...") 
                : (t('modelRetrainingComplete') || "Навчання успішно завершено!")}
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <div className="mb-2 flex justify-between text-sm">
              <span>{t('progress') || "Прогрес"}</span>
              <span>{trainingProgress}%</span>
            </div>
            <Progress value={trainingProgress} className="h-3" />
            {isTraining && (
              <p className="mt-4 text-sm text-muted-foreground text-center px-2">
                {trainingProgress < 30 && (t('analyzingData') || "Аналіз сирих даних...")}
                {trainingProgress >= 30 && trainingProgress < 60 && (t('buildingModel') || "Побудова матриці SSA...")}
                {trainingProgress >= 60 && trainingProgress < 90 && (t('validatingModel') || "Вирахування похибки...")}
                {trainingProgress >= 90 && (t('finalizingModel') || "Збереження моделі...")}
              </p>
            )}
            {!isTraining && trainingProgress === 100 && (
              <div className="mt-4 flex items-center justify-center gap-2 text-green-600 dark:text-green-500">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">{t('modelReady') || "ШІ готовий до роботи"}</span>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Next Week Forecast Summary */}
      <Card className="mb-6 border-l-4 border-l-[#385BA5] dark:border-l-[#5b8de5]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('weeklyForecast') || "Прогноз на 7 днів"}</CardTitle>
              <CardDescription>{t('next7Days') || "Очікуване споживання"}</CardDescription>
            </div>
            <Calendar className="h-8 w-8 text-[#385BA5] dark:text-[#5b8de5]" />
          </div>
        </CardHeader>
        <CardContent>
          {/* Адаптивний Ґрід */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">{t('predictedTotal') || "Загальний об'єм"}</p>
              <p className="text-2xl font-bold">{weeklyPredictedTotal} {t('liter')}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('dailyAverage') || "В середньому за день"}</p>
              <p className="text-2xl font-bold">{weeklyAverage} {t('liter')}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('daysOverLimit') || "Днів з перевищенням"}</p>
              <p className="text-2xl font-bold flex items-center">
                {daysOverLimit}
                {daysOverLimit > 0 ? (
                  <Badge variant="destructive" className="ml-2 bg-[#ef4466]">{t('warning') || "Увага"}</Badge>
                ) : (
                  <Badge className="ml-2 bg-green-600 dark:bg-green-500">{t('good') || "Норма"}</Badge>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Forecast Chart */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t('consumptionForecast') || "Графік ШІ прогнозу"}</CardTitle>
          <CardDescription>{t('historicalAndPredicted') || "Історичні дані та передбачення майбутнього"}</CardDescription>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          {isLoading ? (
            <div className="h-[400px] flex items-center justify-center text-muted-foreground">
              Формування прогнозів...
            </div>
          ) : (
            <div className="w-full overflow-hidden">
              <ResponsiveContainer width="100%" height={400}>
                {/* Відступи для мобільних екранів, щоб графік не обрізався */}
                <ComposedChart data={combinedData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(150,150,150,0.1)" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#8b92a0"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => {
                      if (!value) return '';
                      const date = new Date(value);
                      return `${date.getMonth() + 1}/${date.getDate()}`;
                    }}
                  />
                  <YAxis stroke="#8b92a0" tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--card)', 
                      border: '1px solid var(--border)',
                      borderRadius: '8px'
                    }}
                    labelStyle={{ color: 'var(--foreground)', marginBottom: '5px' }}
                  />
                  <ReferenceLine 
                    y={DAILY_LIMIT} 
                    stroke="#ef4466" 
                    strokeDasharray="5 5"
                    label={{ value: 'Limit', fill: '#ef4466', fontSize: 12, position: 'insideTopLeft' }}
                  />
                  
                  <Area
                    type="monotone"
                    dataKey="confidenceHigh"
                    fill="#5b8de5"
                    fillOpacity={0.1}
                    stroke="none"
                    isAnimationActive={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="confidenceLow"
                    fill="#ffffff"
                    fillOpacity={0.1}
                    stroke="none"
                    isAnimationActive={false}
                  />
                  
                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke="#5b8de5"
                    strokeWidth={2}
                    dot={{ fill: '#5b8de5', r: 4 }}
                    name="Фактично ({t('liter')})"
                    connectNulls
                  />
                  
                  <Line
                    type="monotone"
                    dataKey="predicted"
                    stroke="#22c55e"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: '#22c55e', r: 4 }}
                    name="Прогноз (L)"
                    connectNulls
                  />
                </ComposedChart>
              </ResponsiveContainer>
              <div className="flex items-center justify-center gap-4 sm:gap-6 mt-6 text-xs sm:text-sm flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-0.5 sm:w-4 bg-[#5b8de5]"></div>
                  <span>{t('actualData') || "Фактичні дані"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-0.5 sm:w-4 bg-[#22c55e] border-dashed"></div>
                  <span>{t('predictedData') || "Прогноз"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 bg-[#5b8de5] opacity-20 rounded"></div>
                  <span>{t('confidenceInterval') || "Межі довіри ШІ"}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Anomaly Detection Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-500" />
            {t('anomalyDetection') || "Детектор аномалій"}
          </CardTitle>
          <CardDescription>{t('unusualPatternsDetected') || "Алгоритм фіксує нетипові патерни споживання"}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center text-muted-foreground py-4">Аналіз...</p>
          ) : anomalies.length === 0 ? (
            <p className="text-center text-muted-foreground py-4 font-medium">Аномалій не виявлено. Система працює стабільно.</p>
          ) : (
            <div className="space-y-4">
              {anomalies.map((anomaly: any) => (
                <div
                  key={anomaly.id}
                  className={`p-4 rounded-lg border-l-4 ${
                    anomaly.severity === 'high'
                      ? 'bg-red-50 dark:bg-red-950/20 border-l-red-600 dark:border-l-red-500'
                      : anomaly.severity === 'medium'
                      ? 'bg-orange-50 dark:bg-orange-950/20 border-l-orange-600 dark:border-l-orange-500'
                      : 'bg-blue-50 dark:bg-blue-950/20 border-l-blue-600 dark:border-l-blue-500'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-2 gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant={anomaly.severity === 'high' ? 'destructive' : 'secondary'}
                        className={
                          anomaly.severity === 'medium'
                            ? 'bg-orange-600 dark:bg-orange-500 text-white'
                            : anomaly.severity === 'low'
                            ? 'bg-blue-600 dark:bg-blue-500 text-white'
                            : ''
                        }
                      >
                        {t(anomaly.severity)}
                      </Badge>
                      <span className="text-sm font-medium">{anomaly.date}</span>
                      <span className="text-sm text-muted-foreground hidden sm:inline">•</span>
                      <span className="text-sm text-muted-foreground">{anomaly.device}</span>
                    </div>
                    <div className="sm:text-right flex gap-4 sm:block bg-background/50 sm:bg-transparent p-2 sm:p-0 rounded mt-2 sm:mt-0">
                      <p className="text-sm">
                        <span className="text-muted-foreground">{t('actual') || "Фактично"}: </span>
                        <span className="font-bold">{anomaly.value} {t('liter')}</span>
                      </p>
                      <p className="text-sm">
                        <span className="text-muted-foreground">{t('expected') || "Очікувано"}: </span>
                        <span className="font-medium">{anomaly.expected} {t('liter')}</span>
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-medium mt-2">{anomaly.reason}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Prediction Details Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('detailedForecast') || "Деталізований прогноз"}</CardTitle>
          <CardDescription>{t('dailyPredictionsWithConfidence') || "Прогнози по днях з урахуванням похибки"}</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Обгортка для горизонтального скролу таблиці */}
          <div className="overflow-x-auto w-full">
            <Table className="min-w-[700px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="py-3 px-2">{t('date') || "Дата"}</TableHead>
                  <TableHead className="py-3 px-2">{t('dayOfWeek') || "День"}</TableHead>
                  <TableHead className="text-right py-3 px-2">{t('predicted') || "Прогноз"}</TableHead>
                  <TableHead className="text-right py-3 px-2">{t('confidenceRange') || "Межі довіри"}</TableHead>
                  <TableHead className="text-right py-3 px-2">{t('status') || "Статус"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">Завантаження...</TableCell>
                  </TableRow>
                ) : forecastData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">Прогнози відсутні</TableCell>
                  </TableRow>
                ) : (
                  forecastData.map((day: any, index: number) => {
                    const isOverLimit = day.predicted > DAILY_LIMIT;
                    return (
                      <TableRow key={index}>
                        <TableCell className="py-3 px-2 font-medium">{day.date}</TableCell>
                        <TableCell className="py-3 px-2 text-muted-foreground">{day.dayOfWeek}</TableCell>
                        <TableCell className="text-right py-3 px-2 font-bold">{day.predicted} {t('liter')}</TableCell>
                        <TableCell className="text-right py-3 px-2 text-sm text-muted-foreground">
                          {day.confidenceLow} - {day.confidenceHigh} {t('liter')}
                        </TableCell>
                        <TableCell className="text-right py-3 px-2">
                          {isOverLimit ? (
                            <Badge variant="destructive" className="gap-1 bg-[#ef4466]">
                              <AlertTriangle className="h-3 w-3" />
                              <span className="hidden sm:inline">{t('overLimit') || "Перевищення"}</span>
                            </Badge>
                          ) : (
                            <Badge className="gap-1 bg-green-600 dark:bg-green-500">
                              <CheckCircle2 className="h-3 w-3" />
                              <span className="hidden sm:inline">{t('withinLimit') || "В нормі"}</span>
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};