import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { useLanguage } from '../contexts/LanguageContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, ComposedChart } from 'recharts';
import { Droplets, TrendingUp, Calendar, Award, Users, PlusCircle, Download } from 'lucide-react'; // ДОДАНО Download
import { Badge } from './ui/badge';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface WaterData {
  id: string | number;
  date: string;
  value: number;
  device: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5055/api"; 
const DAILY_LIMIT = 280;

export const MonitoringPage: React.FC = () => {
  const { t } = useLanguage();
  
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const defaultDate = sevenDaysAgo.toISOString().split('T')[0];
  const todayDate = new Date().toISOString().split('T')[0];

  const [selectedDate, setSelectedDate] = useState(defaultDate);
  const [waterData, setWaterData] = useState<WaterData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [claimDeviceId, setClaimDeviceId] = useState('');
  const [claimLocation, setClaimLocation] = useState('');
  const [claimStatus, setClaimStatus] = useState<{ message: string; isError: boolean } | null>(null);

  useEffect(() => {
    const fetchWaterUsage = async () => {
      setIsLoading(true);
      try {
        const currentUserId = localStorage.getItem("userId") || "1";

        const response = await axios.get(`${API_BASE_URL}/water-usage/history`, {
          params: {
            startDate: selectedDate,
            endDate: todayDate,
            userId: currentUserId 
          }
        });

        const dailyMap: Record<string, WaterData> = {};
        
        response.data.forEach((item: any) => {
          const dateStr = new Date(item.Timestamp).toISOString().split('T')[0];
          
          if (!dailyMap[dateStr]) {
            dailyMap[dateStr] = {
              id: item.UsageId || dateStr,
              date: dateStr,
              value: 0,
              device: `Device-${item.DeviceId?.toString().padStart(3, '0') || '001'}`
            };
          }
          dailyMap[dateStr].value += item.UsageValue;
        });

        const aggregatedData = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));
        setWaterData(aggregatedData);
      } catch (error) {
        console.error("Помилка завантаження даних про споживання:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWaterUsage();
  }, [selectedDate, todayDate]);

  const handleClaimDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    setClaimStatus(null);
    try {
      const currentUserId = localStorage.getItem("userId") || "1";
      await axios.post(`${API_BASE_URL}/iot-devices/claim`, {
        DeviceId: parseInt(claimDeviceId),
        UserId: parseInt(currentUserId),
        LocationName: claimLocation
      });
      setClaimStatus({ message: "Пристрій успішно прив'язано!", isError: false });
      setClaimDeviceId('');
      setClaimLocation('');
    } catch (error: any) {
      setClaimStatus({ 
        message: error.response?.data?.message || "Помилка при зв'язці пристрою", 
        isError: true 
      });
    }
  };

  const totalConsumption = waterData.reduce((sum, item) => sum + item.value, 0);
  const averageDaily = waterData.length > 0 ? (totalConsumption / waterData.length).toFixed(1) : "0.0";
  
  let streak = 0;
  for (let i = waterData.length - 1; i >= 0; i--) {
    if (waterData[i].value <= DAILY_LIMIT) {
      streak++;
    } else {
      break; 
    }
  }
  
  const buildingAverage = 255;

// --- ФУНКЦІЯ ЕКСПОРТУ В PDF ---
  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // 1. Header
    doc.setFontSize(22);
    doc.setTextColor(56, 91, 165); 
    doc.text("AquaTrack", 14, 20);
    
    doc.setFontSize(16);
    doc.setTextColor(100, 100, 100);
    doc.text("Water Consumption Report", 14, 30);

    // 2. Line & Summary
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 35, 196, 35); 
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 45);
    doc.text(`Period: ${selectedDate} to ${todayDate}`, 14, 52);
    
    doc.setFont("helvetica", "bold");
    doc.text(`Total Consumption: ${Math.round(totalConsumption)} L`, 14, 62);
    doc.text(`Average Daily: ${averageDaily} L`, 14, 69);
    doc.setFont("helvetica", "normal");

    // 3. Table
    const tableColumn = ["Date", "Device", "Value (L)"];
    const tableRows = waterData.map(item => [
      item.date,
      item.device,
      `${Math.round(item.value)}`
    ]);

    // ТУТ БУЛА ПОМИЛКА: Пишемо autoTable(doc, ...), а не doc.autoTable(...)
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 75,
      theme: 'striped',
      headStyles: { fillColor: [56, 91, 165], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [245, 247, 250] },
    });

    // 4. Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text(`AquaTrack Ecosystem - Page ${i} of ${pageCount}`, 14, doc.internal.pageSize.height - 10);
    }

    doc.save(`AquaTrack_Report_${selectedDate}.pdf`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 w-full">
      {/* Додано кнопку PDF поруч із заголовком */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">{t('waterConsumption') || "Споживання води"}</h1>
        <Button onClick={exportToPDF} variant="outline" className="gap-2 w-full sm:w-auto">
          <Download className="h-4 w-4" />
          {t('exportPDF') || "PDF Звіт"}
        </Button>
      </div>

      {/* Streak Badge */}
      {streak >= 3 && (
        <Card className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/40 dark:to-emerald-950/40 border-green-200 dark:border-green-800/50">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <div className="w-12 h-12 bg-green-600 dark:bg-green-500 rounded-full flex items-center justify-center shrink-0">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center">
                <p className="text-green-900 dark:text-green-100 font-medium">
                  {t('streakMsg1')}{streak}{t('streakMsg2')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Адаптивний Grid для карток */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalConsumption') || "Загальне споживання"}</CardTitle>
            <Droplets className="h-4 w-4 text-[#385BA5] dark:text-[#5b8de5]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(totalConsumption)} {t('liter')}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('averageDaily') || "Середнє за день"}</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageDaily} {t('liter')}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('selectDate') || "Виберіть дату"}</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={todayDate} 
              className="w-full"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dailyComparison')}</CardTitle>
            <Users className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">{t('yourAverage')}: <span className="font-medium text-foreground">{averageDaily} {t('liter')}</span></div>
              <div className="text-sm text-muted-foreground">{t('buildingAverage')}: <span className="font-medium text-foreground">{buildingAverage} {t('liter')}</span></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Графік */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t('consumptionData') || "Графік споживання"}</CardTitle>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          {isLoading ? (
            <div className="h-[350px] flex items-center justify-center text-muted-foreground">
              Завантаження даних...
            </div>
          ) : waterData.length === 0 ? (
            <div className="h-[350px] flex items-center justify-center text-muted-foreground">
              Немає даних за вибраний період
            </div>
          ) : (
            <div className="w-full overflow-hidden">
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={waterData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }} 
                    tickFormatter={(value) => {
                      const d = new Date(value);
                      return `${d.getMonth() + 1}/${d.getDate()}`;
                    }}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
                  />
                  
                  <ReferenceLine 
                    y={DAILY_LIMIT} 
                    stroke="#6b7280" 
                    strokeDasharray="5 5" 
                    label={{ value: 'Limit', position: 'insideTopLeft', fill: '#6b7280', fontSize: 12 }}
                  />
                  
                  <Area 
                    type="monotone" 
                    dataKey={(data) => Math.min(data.value, DAILY_LIMIT)} 
                    fill="#22c55e" 
                    fillOpacity={0.3}
                    stroke="none"
                  />
                  
                  <Area 
                    type="monotone" 
                    dataKey={(data) => data.value > DAILY_LIMIT ? data.value : DAILY_LIMIT} 
                    fill="#ef4444" 
                    fillOpacity={0.3}
                    stroke="none"
                  />
                  
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke={(data) => data.value > DAILY_LIMIT ? '#ef4444' : '#22c55e'}
                    strokeWidth={2}
                    dot={{ fill: '#385BA5', r: 4 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
          
          {/* Легенда під графіком */}
          <div className="flex items-center justify-center gap-4 sm:gap-6 mt-6 text-xs sm:text-sm flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-500 opacity-50 rounded"></div>
              <span>{t('savings')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-500 opacity-50 rounded"></div>
              <span>{t('overspending')}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Таблиця */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t('consumptionData') || "Детальні дані"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto w-full">
            <Table className="min-w-[600px]">
              <TableHeader>
                <TableRow>
                  <TableHead>{t('date') || "Дата"}</TableHead>
                  <TableHead>{t('device') || "Пристрій"}</TableHead>
                  <TableHead>{t('value') || "Об'єм"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {waterData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.date}</TableCell>
                    <TableCell>{item.device}</TableCell>
                    <TableCell className={item.value > DAILY_LIMIT ? "text-red-500 font-bold" : "text-green-600 font-medium"}>
                      {Math.round(item.value)} {t('liter')}
                    </TableCell>
                  </TableRow>
                ))}
                {waterData.length === 0 && !isLoading && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                      Дані відсутні
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Форма прив'язки пристрою */}
      <Card className="border-dashed border-2 bg-gray-50/50 dark:bg-white/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5 text-[#385BA5]" />
            <CardTitle className="text-lg">{t('addNewSensor')}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleClaimDevice} className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="space-y-2 w-full sm:flex-1">
              <Label htmlFor="deviceId">{t('sensorId')}</Label>
              <Input 
                id="deviceId" 
                placeholder="Наприклад: 1" 
                value={claimDeviceId} 
                onChange={(e) => setClaimDeviceId(e.target.value)}
                required
                className="w-full"
              />
            </div>
            <div className="space-y-2 w-full sm:flex-1">
              <Label htmlFor="location">{t('locationName')}</Label>
              <Input 
                id="location" 
                placeholder="Наприклад: Кухня" 
                value={claimLocation} 
                onChange={(e) => setClaimLocation(e.target.value)}
                required
                className="w-full"
              />
            </div>
            <Button type="submit" className="w-full sm:w-auto bg-[#385BA5] text-white hover:bg-[#2d4880]">
              {t('bindSensor')}
            </Button>
          </form>

          {claimStatus && (
            <div className={`mt-4 p-3 rounded-md text-sm font-medium ${claimStatus.isError ? 'bg-red-100 text-red-700 border-red-200' : 'bg-green-100 text-green-700 border-green-200'} border`}>
              {claimStatus.message}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};