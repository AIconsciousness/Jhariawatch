import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../hooks/useNotifications';
import { Bell, BellOff, AlertTriangle, Mail, FileText } from 'lucide-react';

const NotificationSettings = () => {
  const { user, updateUser } = useAuth();
  const { notificationPermission, requestPermission, isGranted, isDenied } = useNotifications();

  const handleToggleNotifications = async (type) => {
    const newSettings = {
      ...user.notifications,
      [type]: !user.notifications[type]
    };

    await updateUser({ notifications: newSettings });
  };

  const handleRequestPermission = async () => {
    const granted = await requestPermission();
    if (granted) {
      alert('Notifications enabled successfully!');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <Bell className="w-6 h-6" />
        Notification Settings
      </h2>

      {/* Browser Permission Status */}
      <div className="mb-6 p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
        <h3 className="font-semibold mb-2">Browser Notifications</h3>
        {isGranted && (
          <div className="flex items-center gap-2 text-green-600">
            <Bell className="w-5 h-5" />
            <span>Enabled</span>
          </div>
        )}
        {isDenied && (
          <div className="flex items-center gap-2 text-red-600">
            <BellOff className="w-5 h-5" />
            <span>Blocked - Please enable in browser settings</span>
          </div>
        )}
        {notificationPermission === 'default' && (
          <button
            onClick={handleRequestPermission}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Enable Push Notifications
          </button>
        )}
      </div>

      {/* Notification Preferences */}
      <div className="space-y-4">
        {/* Emergency Alerts */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <div>
              <h4 className="font-semibold">Emergency Alerts</h4>
              <p className="text-sm text-gray-600">
                Critical subsidence alerts for your area
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={user?.notifications?.emergencyAlerts ?? true}
              onChange={() => handleToggleNotifications('emergencyAlerts')}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Weekly Updates */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-blue-600" />
            <div>
              <h4 className="font-semibold">Weekly Email Updates</h4>
              <p className="text-sm text-gray-600">
                Weekly summary of reports and alerts
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={user?.notifications?.weeklyUpdates ?? true}
              onChange={() => handleToggleNotifications('weeklyUpdates')}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Report Updates */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-green-600" />
            <div>
              <h4 className="font-semibold">Report Status Updates</h4>
              <p className="text-sm text-gray-600">
                Updates when your report status changes
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={user?.notifications?.reportUpdates ?? true}
              onChange={() => handleToggleNotifications('reportUpdates')}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
