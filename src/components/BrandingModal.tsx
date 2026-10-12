import React, { useState } from 'react';
import {
  Building2,
  User,
  Phone,
  Mail,
  Shield,
  Check,
  X,
  Sparkles,
  RefreshCw,
  Award,
} from 'lucide-react';
import { BrandingConfig } from '../types';

interface BrandingModalProps {
  isOpen: boolean;
  onClose: () => void;
  branding: BrandingConfig;
  onUpdateBranding: (newBranding: BrandingConfig) => void;
}

export const BrandingModal: React.FC<BrandingModalProps> = ({
  isOpen,
  onClose,
  branding,
  onUpdateBranding,
}) => {
  const [companyName, setCompanyName] = useState(branding.companyName);
  const [companyShort, setCompanyShort] = useState(branding.companyShort);
  const [subtitle, setSubtitle] = useState(branding.subtitle);
  const [developerName, setDeveloperName] = useState(branding.developerName);
  const [developerContact, setDeveloperContact] = useState(branding.developerContact);
  const [developerEmail, setDeveloperEmail] = useState(branding.developerEmail);
  const [developerRole, setDeveloperRole] = useState(branding.developerRole);
  const [institutionLocation, setInstitutionLocation] = useState(branding.institutionLocation);

  if (!isOpen) return null;

  const handleApplyPreset = (mode: 'BALDERA_SANTOS' | 'CAMARA_DE_CUENTAS') => {
    if (mode === 'BALDERA_SANTOS') {
      setCompanyName('Baldera Santos y Asociados');
      setCompanyShort('BSA');
      setSubtitle('Firma Consultora Legal, Financiera & Auditoría Forense con Blockchain');
      setDeveloperName('Lic. Pedro Baldera');
      setDeveloperContact('1-829-771-7390');
      setDeveloperEmail('licpedrobaldera@gmail.com');
      setDeveloperRole('Arquitecto de Software & Auditor Forense Senior');
      setInstitutionLocation('Santo Domingo, República Dominicana');
    } else {
      setCompanyName('Cámara de Cuentas de la República Dominicana (CCRD)');
      setCompanyShort('CCRD');
      setSubtitle('Órgano Superior de Control Externo de los Recursos Públicos • Ley 10-04');
      setDeveloperName('Lic. Pedro Baldera');
      setDeveloperContact('1-829-771-7390');
      setDeveloperEmail('licpedrobaldera@gmail.com');
      setDeveloperRole('Director de Desarrollo & Auditor Gubernamental');
      setInstitutionLocation('Santo Domingo, Distrito Nacional, Rep. Dom.');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateBranding({
      brandMode: companyShort === 'BSA' ? 'BALDERA_SANTOS' : 'CAMARA_DE_CUENTAS',
      companyName,
      companyShort,
      subtitle,
      developerName,
      developerContact,
      developerEmail,
      developerRole,
      institutionLocation,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto p-6 shadow-2xl space-y-5 text-xs">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-950 text-amber-400 border border-blue-800/60">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Personalización Institucional & Perfil del Desarrollador
              </h3>
              <p className="text-slate-400 text-xs">
                Cambia la identidad entre Baldera Santos y Asociados o Cámara de Cuentas RD y edita los datos de contacto.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets */}
        <div className="space-y-2">
          <label className="text-slate-300 font-bold block">Modos Rápidos Preconfigurados:</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleApplyPreset('BALDERA_SANTOS')}
              className={`p-3 rounded-xl border text-left transition-all ${
                companyShort === 'BSA'
                  ? 'bg-blue-600/30 border-blue-500 text-white shadow-md'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="font-bold text-amber-400 flex items-center gap-1.5">
                <Award className="w-4 h-4" />
                <span>Baldera Santos y Asociados</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Firma privada de consultores, peritajes forenses y auditoría con blockchain.
              </p>
            </button>

            <button
              type="button"
              onClick={() => handleApplyPreset('CAMARA_DE_CUENTAS')}
              className={`p-3 rounded-xl border text-left transition-all ${
                companyShort === 'CCRD'
                  ? 'bg-blue-600/30 border-blue-500 text-white shadow-md'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="font-bold text-blue-400 flex items-center gap-1.5">
                <Shield className="w-4 h-4" />
                <span>Cámara de Cuentas RD (CCRD)</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Órgano Superior de Control Externo de la República Dominicana (Ley 10-04).
              </p>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">Nombre de la Firma / Entidad</label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-semibold focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Siglas / Prefijo</label>
              <input
                type="text"
                required
                value={companyShort}
                onChange={(e) => setCompanyShort(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono uppercase focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Subtítulo / Misión Institucional</label>
            <input
              type="text"
              required
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Developer Specific Section */}
          <div className="p-4 rounded-xl bg-slate-950 border border-amber-900/50 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
              <h4 className="font-bold text-amber-400 flex items-center gap-2 text-xs">
                <User className="w-4 h-4" />
                <span>Perfil del Desarrollador & Soporte Técnico Oficial</span>
              </h4>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                Verificado
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Nombre del Desarrollador</label>
                <input
                  type="text"
                  required
                  value={developerName}
                  onChange={(e) => setDeveloperName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-medium mb-1">Teléfono / No. de Contacto</label>
                <input
                  type="text"
                  required
                  value={developerContact}
                  onChange={(e) => setDeveloperContact(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-amber-300 font-mono font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  required
                  value={developerEmail}
                  onChange={(e) => setDeveloperEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-medium mb-1">Rol / Especialidad</label>
                <input
                  type="text"
                  required
                  value={developerRole}
                  onChange={(e) => setDeveloperRole(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-600/30"
            >
              Guardar Cambios de Identidad
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
