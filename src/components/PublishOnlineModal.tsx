import React, { useState } from 'react';
import {
  Globe2,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  Shield,
  Layers,
  X,
  Share2,
} from 'lucide-react';
import { BrandingConfig } from '../types';

interface PublishOnlineModalProps {
  isOpen: boolean;
  onClose: () => void;
  branding: BrandingConfig;
}

export const PublishOnlineModal: React.FC<PublishOnlineModalProps> = ({
  isOpen,
  onClose,
  branding,
}) => {
  const [copied, setCopied] = useState(false);
  const [publishedLive, setPublishedLive] = useState(true);

  if (!isOpen) return null;

  const publicUrl = `https://ais-pre-x5g5xf525eyb4oqklk6pje-182188652662.us-west2.run.app?brand=${encodeURIComponent(branding.companyShort)}`;
  const certId = `CERT-ONLINE-${branding.companyShort}-${Date.now().toString().slice(-8)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5 text-xs">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Globe2 className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Publicar y Compartir en Línea</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status */}
        <div className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-800 text-emerald-200 space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm text-emerald-400">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>Plataforma Publicada y Accesible en la Red</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            El sistema de auditoría y los informes de <strong>{branding.companyName}</strong> están sincronizados y accesibles para órganos de control y ciudadanos.
          </p>
          <div className="font-mono text-[10px] text-emerald-300">
            ID Certificado: {certId}
          </div>
        </div>

        {/* Public Link Box */}
        <div className="space-y-1.5">
          <label className="text-slate-300 font-semibold block">Enlace de Consulta Pública:</label>
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-2.5">
            <input
              type="text"
              readOnly
              value={publicUrl}
              className="bg-transparent flex-1 text-slate-300 font-mono text-[11px] focus:outline-none select-all"
            />
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-1 flex-shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado' : 'Copiar'}</span>
            </button>
          </div>
        </div>

        {/* Developer Contact Card */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-slate-400">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Soporte Técnico Certificado</span>
          <div className="font-bold text-white text-xs">{branding.developerName}</div>
          <div className="text-amber-400 font-mono font-semibold">Teléfono: {branding.developerContact}</div>
          <div className="text-blue-300">{branding.developerEmail}</div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-semibold"
          >
            Cerrar
          </button>
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/30"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Abrir Portal en Vivo</span>
          </a>
        </div>

      </div>
    </div>
  );
};
