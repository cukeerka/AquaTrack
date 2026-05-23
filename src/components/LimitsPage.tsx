import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Badge } from './ui/badge';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext'; // Використовуємо контекст
import { Plus, Trash2 } from 'lucide-react';

interface Limit {
  id: string;
  startDate: string;
  endDate: string;
  value: number;
  deviceNumber: string;
  isExceeded: boolean; // Додаємо реальний статус
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5055/api"; 

export const LimitsPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth(); // Отримуємо поточного юзера
  
  const [limits, setLimits] = useState<Limit[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [limitToDelete, setLimitToDelete] = useState<string | null>(null);
  
  const [newLimit, setNewLimit] = useState({
    startDate: '',
    endDate: '',
    value: '',
    deviceNumber: '',
  });

  // --- ЗАВАНТАЖЕННЯ ЛІМІТІВ ТА ПЕРЕВІРКА СТАТУСУ ---
  const fetchLimits = useCallback(async () => {
    try {
      const currentUserId = user?.id || localStorage.getItem("userId") || "1";
      
      // 1. Отримуємо список лімітів
      const response = await axios.get(`${API_BASE_URL}/limits/list?userId=${currentUserId}`);
      
      // 2. Для кожного ліміту запитуємо статус "перевищено/ні" з бекенду
      const mappedLimits = await Promise.all(response.data.map(async (item: any) => {
        let isExceeded = false;
        try {
          const statusRes = await axios.get(`${API_BASE_URL}/limits/check-exceeded/${item.LimitId}`);
          isExceeded = statusRes.data.LimitExceeded;
        } catch (e) {
          console.error("Не вдалося перевірити статус ліміту", item.LimitId);
        }

        return {
          id: item.LimitId.toString(),
          startDate: item.StartDate,
          endDate: item.EndDate,
          value: item.LimitValue,
          deviceNumber: `Device-${item.DeviceId.toString().padStart(3, '0')}`,
          isExceeded: isExceeded
        };
      }));
      
      setLimits(mappedLimits);
    } catch (error) {
      console.error("Помилка при завантаженні лімітів", error);
    }
  }, [user]);

  useEffect(() => {
    fetchLimits();
  }, [fetchLimits]);

  // --- СТВОРЕННЯ ЛІМІТУ ---
  const handleCreateLimit = async () => {
    if (newLimit.startDate && newLimit.endDate && newLimit.value && newLimit.deviceNumber) {
      const parsedDeviceId = parseInt(newLimit.deviceNumber.replace(/\D/g, '')) || Number(newLimit.deviceNumber);
      const currentUserId = user?.id || localStorage.getItem("userId");

      if (!currentUserId) {
        alert("Помилка: Користувач не авторизований!");
        return;
      }

      try {
        await axios.post(`${API_BASE_URL}/limits/create`, {
          startDate: newLimit.startDate,
          endDate: newLimit.endDate,
          limitValue: Number(newLimit.value),
          deviceId: parsedDeviceId,
          userId: Number(currentUserId),
        });
        
        setNewLimit({ startDate: '', endDate: '', value: '', deviceNumber: '' });
        setIsDialogOpen(false);
        fetchLimits();
      } catch (error: any) {
        const msg = error.response?.data?.message || error.response?.data || "Помилка створення";
        alert(msg);
      }
    } else {
      alert(t('fillAllFields') || "Будь ласка, заповніть усі поля");
    }
  };

  // --- ВИДАЛЕННЯ ЛІМІТУ ---
  const handleDeleteLimit = async (id: string) => {
    try {
      await axios.delete(`${API_BASE_URL}/limits/delete/${id}`);
      setLimits(limits.filter(limit => limit.id !== id));
    } catch (error: any) {
        const msg = error.response?.data?.message || error.response?.data || "Помилка видалення";
        alert(msg);
    } finally {
      setDeleteDialogOpen(false);
      setLimitToDelete(null);
    }
  };
  
  const openDeleteDialog = (id: string) => {
    setLimitToDelete(id);
    setDeleteDialogOpen(true);
  };

  return (
  <div className="max-w-7xl mx-auto px-4 py-8 w-full">
      {/* Адаптивний заголовок: колонкою на мобільному, в рядок на ПК */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">{t('limitsManagement') || "Управління лімітами"}</h1>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto bg-[#385BA5] hover:bg-[#2d4880] text-white">
              <Plus className="h-4 w-4 mr-2" />
              {t('createLimit') || "Створити ліміт"}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] w-[95vw] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('createLimit') || "Створити ліміт"}</DialogTitle>
              <DialogDescription>
                {t('fillLimitDetails') || "Заповніть деталі для створення нового ліміту споживання"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="deviceNumber">{t('deviceNumber') || "Номер пристрою"}</Label>
                <Input
                  id="deviceNumber"
                  value={newLimit.deviceNumber}
                  onChange={(e) => setNewLimit({ ...newLimit, deviceNumber: e.target.value })}
                  placeholder="напр. 1 або Device-001"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate">{t('startDate') || "Початкова дата"}</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={newLimit.startDate}
                  onChange={(e) => setNewLimit({ ...newLimit, startDate: e.target.value })}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">{t('endDate') || "Кінцева дата"}</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={newLimit.endDate}
                  onChange={(e) => setNewLimit({ ...newLimit, endDate: e.target.value })}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="value">{t('limitValue') || "Об'єм води (Літри)"}</Label>
                <Input
                  id="value"
                  type="number"
                  value={newLimit.value}
                  onChange={(e) => setNewLimit({ ...newLimit, value: e.target.value })}
                  placeholder="5000"
                  className="w-full"
                />
              </div>
              {/* Адаптивні кнопки форми */}
              <div className="flex flex-col sm:flex-row gap-2 mt-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full sm:flex-1 order-2 sm:order-1">
                  {t('cancel') || "Скасувати"}
                </Button>
                <Button onClick={handleCreateLimit} className="w-full sm:flex-1 bg-[#385BA5] hover:bg-[#2d4880] text-white order-1 sm:order-2">
                  {t('save') || "Зберегти"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('limits') || "Встановлені ліміти"}</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Обгортка для горизонтального скролу таблиці на мобільному */}
          <div className="overflow-x-auto w-full">
            <Table className="min-w-[700px]">
              <TableHeader>
                <TableRow>
                  <TableHead>{t('deviceNumber') || "Пристрій"}</TableHead>
                  <TableHead>{t('startDate') || "Початок"}</TableHead>
                  <TableHead>{t('endDate') || "Кінець"}</TableHead>
                  <TableHead>{t('limitValue') || "Ліміт"}</TableHead>
                  <TableHead>{t('status') || "Статус"}</TableHead>
                  <TableHead className="text-right">{t('actions') || "Дії"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {limits.map((limit) => {
                  return (
                    <TableRow key={limit.id}>
                      <TableCell className="font-medium">{limit.deviceNumber}</TableCell>
                      <TableCell>
                        {new Date(limit.startDate).toLocaleDateString(language === 'uk' ? 'uk-UA' : 'en-US')}
                      </TableCell>
                      <TableCell>
                        {new Date(limit.endDate).toLocaleDateString(language === 'uk' ? 'uk-UA' : 'en-US')}
                      </TableCell>
                      <TableCell className="font-bold">{limit.value} L</TableCell>
                      <TableCell>
                        {limit.isExceeded ? (
                          <Badge variant="destructive" className="bg-[#ef4466]">{t('overLimit')}</Badge>
                          ) : (
                          <Badge variant="default" className="bg-green-600 dark:bg-green-500">{t('withinLimit')}</Badge>
                          )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => openDeleteDialog(limit.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {limits.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                      {t("noLimits") || "Ліміти відсутні. Створіть новий ліміт."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="w-[95vw] sm:max-w-[425px] rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirmDelete') || "Підтвердження видалення"}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('confirmDeleteLimit') || "Ви впевнені, що хочете видалити цей ліміт? Цю дію неможливо скасувати."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
            <AlertDialogCancel className="w-full sm:w-auto mt-0">{t('cancel') || "Скасувати"}</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleDeleteLimit(limitToDelete as string)} className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white">
              {t('delete') || "Видалити"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};