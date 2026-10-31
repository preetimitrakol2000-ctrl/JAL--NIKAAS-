/**
 * Jal-Nikaas: Farmer Interface Navigation Bar
 * High-contrast, large touch-friendly tabs with minimal clutter
 */

import React from 'react';
import { FarmerTab, Language } from '../../types';
import { getTranslation } from '../../utils/i18n';
import {
  Home,
  Droplet,
  Bell,
  Sparkles,
  Map,
  Settings,
} from 'lucide-react';

interface FarmerNavigationProps {
  activeTab: FarmerTab;
  onTabChange: (tab: FarmerTab) => void;
  language: Language;
  unreadAlertCount: number;
}

export const FarmerNavigation: React.FC<FarmerNavigationProps> = ({
  activeTab,
  onTabChange,
  language,
  unreadAlertCount,
}) => {
  const tabs = [
    {
      id: 'home' as FarmerTab,
      label: getTranslation(language, 'farmer_nav_home'),
      icon: Home,
    },
    {
      id: 'field' as FarmerTab,
      label: getTranslation(language, 'farmer_nav_field'),
      icon: Droplet,
    },
    {
      id: 'alerts' as FarmerTab,
      label: getTranslation(language, 'farmer_nav_alerts'),
      icon: Bell,
      badge: unreadAlertCount,
    },
    {
      id: 'recommendations' as FarmerTab,
      label: getTranslation(language, 'farmer_nav_recommendations'),
      icon: Sparkles,
    },
    {
      id: 'map' as FarmerTab,
      label: getTranslation(language, 'farmer_nav_map'),
      icon: Map,
    },
    {
      id: 'settings' as FarmerTab,
      label: getTranslation(language, 'farmer_nav_settings'),
      icon: Settings,
    },
  ];

  return (
    <nav className="border-b border-emerald-100 bg-emerald-50/70 sticky top-0 z-30 shadow-xs backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-3 sm:px-6">
        <div className="flex items-center space-x-1 sm:space-x-2 py-2 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-bold transition-all ${
                  isActive
                    ? 'bg-emerald-700 text-white shadow-sm ring-1 ring-emerald-600'
                    : 'text-slate-700 hover:bg-emerald-100/70 hover:text-slate-900'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-emerald-200' : 'text-emerald-700'}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-extrabold ${
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
