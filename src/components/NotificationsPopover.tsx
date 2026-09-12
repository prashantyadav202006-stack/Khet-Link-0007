import React from 'react';
import { 
  Bell, 
  X, 
  CheckCheck, 
  TrendingUp, 
  ShieldCheck, 
  CloudRain, 
  FileText,
  Clock
} from 'lucide-react';
import { AppNotification } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface NotificationsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAllRead: () => void;
  onSelectNotification: (notification: AppNotification) => void;
}

export const NotificationsPopover: React.FC<NotificationsPopoverProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
  onSelectNotification
}) => {
  const { t } = useLanguage();
  if (!isOpen) return null;

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'mandi':
        return <TrendingUp className="w-4 h-4 text-emerald-600" />;
      case 'escrow':
        return <ShieldCheck className="w-4 h-4 text-amber-600" />;
      case 'weather':
        return <CloudRain className="w-4 h-4 text-sky-600" />;
      case 'rfq':
        return <FileText className="w-4 h-4 text-[#6B8E4E]" />;
      default:
        return <Bell className="w-4 h-4 text-[#3C5148]" />;
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex justify-end sm:p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        id="notifications-popover-box"
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-sm sm:rounded-3xl h-full sm:h-auto sm:max-h-[85vh] shadow-2xl border border-neutral-200 flex flex-col justify-between overflow-hidden relative"
      >
        {/* Header */}
        <div className="p-4 border-b border-neutral-200 flex items-center justify-between bg-[#1B2727] text-white">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#B2C5B2]" />
            <h3 className="font-bold text-sm font-['Outfit']">{t('notif.title', 'Kisan & Mandi Alerts')}</h3>
            <span className="text-[10px] bg-[#6B8E4E] text-white px-2 py-0.2 rounded-full font-bold">
              {t('notif.live', 'Live')}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action bar */}
        <div className="px-4 py-2 bg-neutral-50 border-b border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
          <span>{notifications.filter(n => !n.read).length} {t('notif.unread', 'Unread Updates')}</span>
          <button
            onClick={onMarkAllRead}
            className="text-[#6B8E4E] hover:underline font-bold flex items-center gap-1 cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            {t('notif.markAllRead', 'Mark all read')}
          </button>
        </div>

        {/* Notifications list */}
        <div className="flex-1 overflow-y-auto divide-y divide-neutral-100">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => onSelectNotification(notif)}
              className={`p-4 transition cursor-pointer flex gap-3 items-start ${
                !notif.read ? 'bg-[#F4F8F4] hover:bg-[#EBF2EB]' : 'bg-white hover:bg-neutral-50'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-white border border-neutral-200 shadow-2xs flex items-center justify-center shrink-0 mt-0.5">
                {getIcon(notif.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h4 className={`text-xs truncate ${!notif.read ? 'font-bold text-[#1B2727]' : 'font-semibold text-neutral-700'}`}>
                    {notif.title}
                  </h4>
                  {notif.badge && (
                    <span className="text-[9px] bg-rose-100 text-rose-800 font-bold px-1.5 py-0.2 rounded">
                      {notif.badge}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-neutral-600 mt-1 leading-snug">
                  {notif.message}
                </p>
                <div className="flex items-center gap-1 text-[10px] text-neutral-400 mt-1.5 font-medium">
                  <Clock className="w-3 h-3" />
                  <span>{notif.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-neutral-100 text-center bg-neutral-50">
          <p className="text-[11px] text-neutral-500">
            {t('notif.footer', 'Automated SMS & WhatsApp alerts linked to Kisan Portal')}
          </p>
        </div>
      </div>
    </div>
  );
};
