import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { useLanguage } from '../contexts/LanguageContext';
import { Trash2, Users, Cpu, Plus } from 'lucide-react';
import { Badge } from './ui/badge';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

interface Device {
  id: string;
  deviceId: string;
  location: string;
  status: 'active' | 'inactive';
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5055/api";  

export const AdminPage: React.FC = () => {
  const { t } = useLanguage();
  
  const [users, setUsers] = useState<User[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);

  const [deleteUserDialogOpen, setDeleteUserDialogOpen] = useState(false);
  const [deleteDeviceDialogOpen, setDeleteDeviceDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [deviceToDelete, setDeviceToDelete] = useState<string | null>(null);

  const [addDeviceDialogOpen, setAddDeviceDialogOpen] = useState(false);
  const [newDeviceType, setNewDeviceType] = useState("");
  const [newDeviceStatus, setNewDeviceStatus] = useState("Active");

  // --- ЗАВАНТАЖЕННЯ ДАНИХ ---
  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users/list`);
      const mappedUsers: User[] = response.data.map((u: any) => ({
        id: u.UserId.toString(),
        name: u.Username,
        email: u.Email,
        role: u.Role.toLowerCase() === 'admin' ? 'admin' : 'user'
      }));
      setUsers(mappedUsers);
    } catch (error) {
      console.error("Помилка при завантаженні користувачів", error);
    }
  };

  const fetchDevices = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/iot-devices/list`);
      const mappedDevices: Device[] = res.data.map((d: any) => ({
        id: d.DeviceId.toString(),
        deviceId: `Device-${d.DeviceId.toString().padStart(3, '0')}`,
        location: d.DeviceType || 'Невідома локація',
        status: d.Status.toLowerCase() === 'active' ? 'active' : 'inactive'
      }));
      setDevices(mappedDevices);
    } catch (error) {
      console.error("Не вдалося завантажити пристрої", error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchDevices();
  }, []);

  // --- ДІЇ ---
  const handleChangeRole = async (userId: string, newRole: 'admin' | 'user') => {
    try {
      const roleForApi = newRole === 'admin' ? 'Admin' : 'User';
      await axios.put(`${API_BASE_URL}/users/update-role?userId=${userId}&newRole=${roleForApi}`);
      setUsers(users.map(user => user.id === userId ? { ...user, role: newRole } : user));
    } catch (error) {
      alert(t('errorChangeRole') || "Не вдалося змінити роль");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await axios.delete(`${API_BASE_URL}/users/delete/${userId}`);
      setUsers(users.filter(user => user.id !== userId));
    } catch (error) {
      alert(t('errorDeleteUser') || "Не вдалося видалити користувача");
    } finally {
      setDeleteUserDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const handleDeleteDevice = async (deviceId: string) => {
    try {
      await axios.delete(`${API_BASE_URL}/iot-devices/delete/${deviceId}`);
      setDevices(devices.filter(device => device.id !== deviceId));
    } catch (error) {
      alert(t('errorDeleteDevice') || "Не вдалося видалити пристрій");
    } finally {
      setDeleteDeviceDialogOpen(false);
      setDeviceToDelete(null);
    }
  };

  const handleRegisterDevice = async () => {
    if (!newDeviceType) {
      alert(t('enterDeviceDetails') || "Введіть тип/локацію пристрою");
      return;
    }
    try {
      await axios.post(`${API_BASE_URL}/iot-devices/register`, {
        deviceType: newDeviceType,
        status: newDeviceStatus,
      });
      await fetchDevices();
      setAddDeviceDialogOpen(false);
      setNewDeviceType("");
      setNewDeviceStatus("Active");
    } catch (error) {
      alert(t('errorRegisterDevice') || "Не вдалося додати пристрій");
    }
  };

  const openDeleteUserDialog = (userId: string) => {
    setUserToDelete(userId);
    setDeleteUserDialogOpen(true);
  };

  const openDeleteDeviceDialog = (deviceId: string) => {
    setDeviceToDelete(deviceId);
    setDeleteDeviceDialogOpen(true);
  };

  return (
<div className="max-w-7xl mx-auto px-4 py-8 w-full">
      <h1 className="mb-6 text-2xl font-bold">{t('admin') || "Адмін панель"}</h1>

      {/* УПРАВЛІННЯ КОРИСТУВАЧАМИ */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t('userManagement') || "Управління користувачами"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Обгортка для горизонтального скролу таблиці на мобільному */}
          <div className="overflow-x-auto w-full">
            <Table className="min-w-[600px]">
              <TableHeader>
                <TableRow>
                  <TableHead>{t('name') || "Ім'я"}</TableHead>
                  <TableHead>{t('email') || "Email"}</TableHead>
                  <TableHead>{t('role') || "Роль"}</TableHead>
                  <TableHead>{t('actions') || "Дії"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Select
                        value={user.role}
                        onValueChange={(value: 'admin' | 'user') => handleChangeRole(user.id, value)}
                      >
                        <SelectTrigger className="w-[130px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">{t('user') || "User"}</SelectItem>
                          <SelectItem value="admin">{t('admin') || "Admin"}</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => openDeleteUserDialog(user.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                      Завантаження користувачів...
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* УПРАВЛІННЯ ПРИСТРОЯМИ */}
      <Card>
        {/* Адаптивний CardHeader: стає колонкою на мобільному і рядком на ПК */}
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 space-y-0">
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5" />
            {t('deviceManagement') || "Управління пристроями"}
          </CardTitle>
          <Button onClick={() => setAddDeviceDialogOpen(true)} size="sm" className="gap-2 w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            {t('addDevice') || "Додати"}
          </Button>
        </CardHeader>
        <CardContent>
          {/* Обгортка для горизонтального скролу таблиці на мобільному */}
          <div className="overflow-x-auto w-full">
            <Table className="min-w-[600px]">
              <TableHeader>
                <TableRow>
                  <TableHead>{t('deviceId') || "ID Пристрою"}</TableHead>
                  <TableHead>{t('location') || "Локація"}</TableHead>
                  <TableHead>{t('status') || "Статус"}</TableHead>
                  <TableHead>{t('actions') || "Дії"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {devices.map((device) => (
                  <TableRow key={device.id}>
                    <TableCell className="font-medium">{device.deviceId}</TableCell>
                    <TableCell>{device.location}</TableCell>
                    <TableCell>
                      <Badge variant={device.status === 'active' ? 'default' : 'secondary'} className={device.status === 'active' ? 'bg-green-600 dark:bg-green-500' : ''}>
                        {t(device.status) || device.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => openDeleteDeviceDialog(device.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {devices.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                      Завантаження пристроїв...
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* МОДАЛЬНЕ ВІКНО ДОДАВАННЯ ПРИСТРОЮ */}
      <Dialog open={addDeviceDialogOpen} onOpenChange={setAddDeviceDialogOpen}>
        <DialogContent className="sm:max-w-[425px] w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('addDevice') || "Додати новий пристрій"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="deviceType" className="text-sm font-medium">
                {t('deviceType') || "Тип / Локація"}
              </label>
              <Input
                id="deviceType"
                placeholder="напр. Датчик підлоги, кухня"
                value={newDeviceType}
                onChange={(e) => setNewDeviceType(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">
                {t('status') || "Статус"}
              </label>
              <Select value={newDeviceStatus} onValueChange={setNewDeviceStatus}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Оберіть статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">{t('active') || "Активний"}</SelectItem>
                  <SelectItem value="Inactive">{t('inactive') || "Неактивний"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {/* Адаптивний DialogFooter: кнопки в колонку на мобільному, в рядок на ПК */}
          <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4 sm:space-x-0">
            <Button variant="outline" onClick={() => setAddDeviceDialogOpen(false)} className="w-full sm:w-auto">
              {t('cancel') || "Скасувати"}
            </Button>
            <Button onClick={handleRegisterDevice} className="w-full sm:w-auto bg-[#385BA5] hover:bg-[#2d4880] text-white">
              {t('save') || "Зберегти"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ДІАЛОГИ ВИДАЛЕННЯ */}
      <AlertDialog open={deleteUserDialogOpen} onOpenChange={setDeleteUserDialogOpen}>
        <AlertDialogContent className="w-[95vw] sm:max-w-[425px] rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirmDelete') || "Підтвердіть дію"}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('confirmDeleteUser') || "Ви впевнені, що хочете видалити цього користувача?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
            <AlertDialogCancel className="w-full sm:w-auto mt-0">{t('cancel') || "Скасувати"}</AlertDialogCancel>
            <AlertDialogAction onClick={() => userToDelete && handleDeleteUser(userToDelete)} className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white">
              {t('delete') || "Видалити"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteDeviceDialogOpen} onOpenChange={setDeleteDeviceDialogOpen}>
        <AlertDialogContent className="w-[95vw] sm:max-w-[425px] rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirmDelete') || "Підтвердіть дію"}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('confirmDeleteDevice') || "Ви впевнені, що хочете видалити цей пристрій?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
            <AlertDialogCancel className="w-full sm:w-auto mt-0">{t('cancel') || "Скасувати"}</AlertDialogCancel>
            <AlertDialogAction onClick={() => deviceToDelete && handleDeleteDevice(deviceToDelete)} className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white">
              {t('delete') || "Видалити"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};