/**
 * Jal-Nikaas: Role Selector Bar
 * Allows instant switching between Farmer Interface and Panchayat Officer Interface
 */

import React from 'react';
import { UserRole, Language } from '../types';
import { getTranslation } from '../utils/i18n';
import { Sprout, Building2, ArrowLeftRight } from 'lucide-react';

interface RoleSelectorProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  language: Language;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({
  currentRole,
  onRoleChange,
  language,
}) => {
  return (
    <div className="bg-slate-900 border-b border-emerald-950/40 px-3 py-2 text-white">
      <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-3">
        {/* Left: Role explanation */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
            <ArrowLeftRight className="h-3.5 w-3.5" />
            {getTranslation(language, 'role_switch_prompt')}:
          </span>
          <span className="text-xs text-slate-300 hidden md:inline">
            {currentRole === 'farmer'
              ? getTranslation(language, 'farmer_tagline')
              : getTranslation(language, 'officer_tagline')}
          </span>
        </div>

        {/* Right: Switcher buttons */}
        <div className="flex items-center rounded-lg bg-slate-800 p-0.5 border border-slate-700">
          <button
            onClick={() => onRoleChange('farmer')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition-all ${
              currentRole === 'farmer'
                ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
          >
            <Sprout className="h-4 w-4 text-emerald-300" />
            <span>{getTranslation(language, 'role_farmer')}</span>
          </button>

          <button
            onClick={() => onRoleChange('officer')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition-all ${
              currentRole === 'officer'
                ? 'bg-sky-700 text-white shadow-sm ring-1 ring-sky-400'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
          >
            <Building2 className="h-4 w-4 text-sky-300" />
            <span>{getTranslation(language, 'role_officer')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
