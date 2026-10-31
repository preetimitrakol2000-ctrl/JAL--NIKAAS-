/**
 * Jal-Nikaas: Primary Navigation Bar
 */

import React from 'react';
import { Language, OfficerTab } from '../types';
import { getTranslation } from '../utils/i18n';
import {
  LayoutDashboard,
  Activity,
  Map,
  BellRing,
  Sprout,
  Users,
  FileSpreadsheet,
} from 'lucide-react';

export type ActiveTab = OfficerTab;

interface NavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  language: Language;
  unreadAlertCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  language,
  unreadAlertCount,
}) => {
  const tabs = [
    {
      id: 'overview' as ActiveTab,
      label: getTranslation(language, 'nav_overview'),
      icon: LayoutDashboard,
    },
    {
      id: 'monitoring' as ActiveTab,
      label: getTranslation(language, 'nav_monitoring'),
      icon: Activity,
    },
    {
      id: 'gis' as ActiveTab,
      label: getTranslation(language, 'nav_gis'),
      icon: Map,
    },
    {
      id: 'alerts' as ActiveTab,
      label: getTranslation(language, 'nav_alerts'),
      icon: BellRing,
      badge: unreadAlertCount,
    },
    {
      id: 'crops' as ActiveTab,
      label: getTranslation(language, 'nav_crops'),
      icon: Sprout,
    },
    {
      id: 'farmers' as ActiveTab,
      label: getTranslation(language, 'nav_farmers'),
      icon: Users,
    },
    {
      id: 'reports' as ActiveTab,
      label: getTranslation(language, 'nav_reports'),
      icon: FileSpreadsheet,
    },
  ];

  return (
    <nav className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
      <div className="mx-auto max-w-7xl px-3 sm:px-6">
        <div className="flex items-center space-x-1 sm:space-x-1.5 py-2 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-emerald-300' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    className={`ml-0.5 rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                      isActive ? 'bg-red-500 text-white' : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
