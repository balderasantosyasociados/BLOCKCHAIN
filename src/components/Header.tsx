import React from 'react';
import {
  Shield,
  Layers,
  FileText,
  UserCheck,
  Building2,
  Globe2,
  Key,
  Cpu,
  Lock,
  ChevronDown,
  Activity,
  CheckCircle2,
  FileCode,
  Download,
  Share2,
  Phone,
  FolderArchive,
  Sparkles,
} from 'lucide-react';
import { SupportedCurrency, SupportedLanguage, UserProfile, UserRole, BrandingConfig } from '../types';
import { TRANSLATIONS } from '../services/i18n';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentUser: UserProfile;
  allUsers: UserProfile[];
  onSwitchUser: (user: UserProfile) => void;
  onOpenUserModal: () => void;
  branding: BrandingConfig;
  onOpenBrandingModal: () => void;
  onDownloadZip: () => void;
  onPublishOnline: () => void;
  onOpenFindingCrudModal: () => void;
  lang: SupportedLanguage;
  setLang: (lang: SupportedLanguage) => void;
  currency: SupportedCurrency;
  setCurrency: (c: SupportedCurrency) => void;
  blocksCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  currentUser,
  allUsers,
  onSwitchUser,
  onOpenUserModal,
  branding,
  onOpenBrandingModal,
  onDownloadZip,
  onPublishOnline,
  onOpenFindingCrudModal,
  lang,
  setLang,
  currency,
  setCurrency,
  blocksCount,
}) => {
  const t = TRANSLATIONS[lang];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-xl">
      {/* Top Governmental Ribbon (Bandera Dominicana & Institutional Bar) */}
      <div className="h-1.5 w-full flex">
        <div className="bg-[#002F6C] flex-1" title="Azul Ultramar - República Dominicana" />
        <div className="bg-[#CE1126] flex-1" title="Rojo Bermellón - República Dominicana" />
        <div className="bg-white flex-1" title="Blanco Esperanza y Paz" />
        <div className="bg-[#002F6C] flex-1" />
        <div className="bg-[#CE1126] flex-1" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Official Seal and Platform Title */}
          <div className="flex items-center space-x-3.5">
            <button
              onClick={onOpenBrandingModal}
              className="relative flex-shrink-0 group cursor-pointer text-left"
              title="Clic para cambiar identidad entre Baldera Santos y Asociados o Cámara de Cuentas RD"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-900 border border-blue-500/40 group-hover:border-amber-400 flex items-center justify-center shadow-lg shadow-blue-950/50 transition-colors">
                <Shield className="w-6 h-6 text-amber-400 group-hover:scale-110 transition-transform" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                </div>
              </div>
            </button>

            <div>
              <div className="flex items-center space-x-2 flex-wrap">
                <button
                  onClick={onOpenBrandingModal}
                  className="text-[11px] font-bold uppercase tracking-wider text-amber-400 bg-amber-950/60 hover:bg-amber-900/60 border border-amber-800/60 px-2 py-0.5 rounded-md transition-colors flex items-center gap-1"
                  title="Clic para editar nombre de la firma"
                >
                  <span>{branding.companyShort}</span>
                  <span className="text-[9px] text-amber-300">• Editar Firma</span>
                </button>
                <span className="text-[10px] text-slate-400 hidden sm:inline-flex items-center gap-1 font-mono">
                  <Lock className="w-3 h-3 text-emerald-400" />
                  Hyperledger Fabric v2.5 • Bloque #{blocksCount}
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5 mt-0.5">
                <span>{branding.companyName}</span>
              </h1>
              <p className="text-[11px] text-slate-400 font-medium line-clamp-1">
                {branding.subtitle}
              </p>
            </div>
          </div>

          {/* Quick Controls: Developer Info, Currency, Language, User Switcher, Profile */}
          <div className="flex items-center flex-wrap gap-2 justify-end">
            
            {/* Developer Contact Pill */}
            <div
              onClick={onOpenBrandingModal}
              className="hidden lg:flex items-center gap-2 bg-slate-950/90 border border-amber-900/60 px-2.5 py-1.5 rounded-xl cursor-pointer hover:border-amber-500 transition-colors"
              title="Desarrollador Oficial: Lic. Pedro Baldera. Clic para editar"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <div className="text-[10px] leading-tight">
                <span className="text-slate-400 block font-sans">Desarrollador Oficial:</span>
                <span className="text-amber-300 font-bold font-mono">{branding.developerName} • {branding.developerContact}</span>
              </div>
            </div>

            {/* In-Screen Findings Manager Button */}
            <button
              onClick={onOpenFindingCrudModal}
              className="flex items-center gap-1.5 bg-indigo-900/70 hover:bg-indigo-800 text-indigo-200 border border-indigo-700/80 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm"
              title="Gestión en pantalla: editar, corregir, modificar, eliminar y ver carpeta de versiones"
            >
              <FolderArchive className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">Gestor en Pantalla</span>
            </button>

            {/* Download Project ZIP Button */}
            <button
              onClick={onDownloadZip}
              className="flex items-center gap-1.5 bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 border border-emerald-600/80 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm"
              title="Descargar paquete completo ZIP con expedientes, evidencias y auditorías"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar ZIP</span>
            </button>

            {/* Publish Online Button */}
            <button
              onClick={onPublishOnline}
              className="flex items-center gap-1.5 bg-purple-800/80 hover:bg-purple-700 text-purple-100 border border-purple-600/80 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm"
              title="Publicar en línea y compartir enlace público"
            >
              <Globe2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Publicar</span>
            </button>

            {/* Currency Selector */}
            <div className="flex items-center bg-slate-800/80 border border-slate-700 rounded-lg p-0.5 text-xs font-medium">
              {(['DOP', 'USD', 'EUR'] as SupportedCurrency[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={`px-2 py-1 rounded transition-colors ${
                    currency === c
                      ? 'bg-blue-600 text-white font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Language Selector */}
            <div className="flex items-center bg-slate-800/80 border border-slate-700 rounded-lg p-0.5 text-xs font-medium">
              <button
                onClick={() => setLang('es')}
                className={`px-2 py-1 rounded transition-colors ${
                  lang === 'es'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Español (República Dominicana)"
              >
                ES
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-2 py-1 rounded transition-colors ${
                  lang === 'en'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="English"
              >
                EN
              </button>
            </div>

            {/* Quick Role Switcher */}
            <div className="relative group">
              <button
                className="flex items-center space-x-2 bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-200 transition-all shadow-sm"
                title="Cambiar rol activo para pruebas de auditoría"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="truncate max-w-[130px] font-semibold">{currentUser.nombre.split(' ')[0]} {currentUser.nombre.split(' ')[1] || ''}</span>
                <span className="text-[10px] text-amber-300 font-mono bg-amber-950/60 px-1 py-0.5 rounded border border-amber-800/50">
                  {currentUser.rol.replace('_CCRD', '')}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <div className="absolute right-0 mt-1 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 hidden group-hover:block group-focus-within:block z-50">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 border-b border-slate-800 mb-1">
                  Cambiar Perfil / Rol
                </div>
                {allUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => onSwitchUser(u)}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex flex-col transition-colors ${
                      currentUser.id === u.id
                        ? 'bg-blue-600/30 text-blue-200 border border-blue-500/40'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="font-semibold">{u.nombre}</span>
                    <span className="text-[10px] text-slate-400">{u.cargo}</span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[9px] font-mono bg-slate-800 text-amber-400 px-1 py-0.2 rounded border border-slate-700">
                        {u.rol}
                      </span>
                      {u.mfa_activo && (
                        <span className="text-[9px] text-emerald-400 flex items-center gap-0.5">
                          <CheckCircle2 className="w-2.5 h-2.5" /> 2FA Activo
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Profile & Support Modal Opener */}
            <button
              onClick={onOpenUserModal}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs px-3 py-1.5 rounded-lg transition-colors shadow-sm shadow-blue-900/40"
              title="Gestión de usuario, cambio de contraseña, histórico de soporte para desarrollador y 2FA"
            >
              <Key className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Seguridad & 2FA</span>
            </button>
          </div>

        </div>

        {/* Navigation Tabs Bar */}
        <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center space-x-1 overflow-x-auto scrollbar-none text-xs">
          {[
            { id: 'dashboard', label: 'Dashboard Ejecutivo', icon: Activity },
            { id: 'audits', label: 'Portal Auditor', icon: FileText },
            { id: 'findings', label: 'Hallazgos ISSAI & IA', icon: Cpu },
            { id: 'plugins', label: 'Complementos Tecnológicos IA', icon: Sparkles },
            { id: 'entity', label: 'Portal Entidad Auditada', icon: Building2 },
            { id: 'supervisor', label: 'Control Calidad & Firmas PKI', icon: UserCheck },
            { id: 'citizen', label: 'Portal Ciudadano Ley 200-04', icon: Globe2 },
            { id: 'blockchain', label: 'Nodos Hyperledger & Hash', icon: Layers },
            { id: 'reports', label: 'Informes PDF & Excel', icon: FileCode },
            { id: 'architecture', label: 'Arquitectura TOGAF', icon: Shield },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-900/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-300' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
};
