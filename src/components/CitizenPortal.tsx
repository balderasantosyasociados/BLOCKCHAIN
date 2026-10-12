import React, { useState } from 'react';
import {
  Globe2,
  Search,
  CheckCircle2,
  FileText,
  Download,
  Shield,
  Layers,
  TrendingUp,
  DollarSign,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { AuditRecord, FindingRecord, SupportedCurrency, SupportedLanguage } from '../types';
import { formatCurrency } from '../services/i18n';
import { blockchainService } from '../services/blockchain';

interface CitizenPortalProps {
  audits: AuditRecord[];
  findings: FindingRecord[];
  currency: SupportedCurrency;
  lang: SupportedLanguage;
  onDownloadReport: (audit: AuditRecord) => void;
}

export const CitizenPortal: React.FC<CitizenPortalProps> = ({
  audits,
  findings,
  currency,
  lang,
  onDownloadReport,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [verifyHashInput, setVerifyHashInput] = useState('');
  const [verificationResult, setVerificationResult] = useState<any | null>(null);

  const publishedAudits = audits.filter(
    (a) => a.estado === 'Informe Definitivo Publicado' || a.estado === 'En Aprobación Pleno'
  );

  const filteredAudits = publishedAudits.filter((a) => {
    return (
      a.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.entidad.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleVerifyHash = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyHashInput.trim()) return;

    const res = blockchainService.verifyHash(verifyHashInput.trim());
    setVerificationResult({
      searched: verifyHashInput.trim(),
      ...res,
    });
  };

  return (
    <div className="space-y-6">
      {/* Citizen Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border border-blue-900/60 rounded-2xl p-6 shadow-2xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/40 border border-blue-700/60 text-xs font-semibold text-blue-300">
          <Globe2 className="w-3.5 h-3.5 text-amber-400" />
          <span>Portal de Transparencia Ciudadana • Ley General 200-04</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
          Rendición de Cuentas & Control Social con Evidencia Inmutable
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
          Acceso libre y abierto a los informes definitivos de auditoría de la Cámara de Cuentas de la República Dominicana, seguimiento al uso de fondos públicos y verificador criptográfico de autenticidad documental en Blockchain.
        </p>
      </div>

      {/* Public Cryptographic Verifier Widget */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Validador Público de Autenticidad Documental (Verificador SHA-256)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Ingresa cualquier código de informe, hash SHA-256 o ID de transacción para verificar si el documento fue emitido por la Cámara de Cuentas y su integridad en la red Hyperledger Fabric.
          </p>
        </div>

        <form onSubmit={handleVerifyHash} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Pega aquí el hash SHA-256 del PDF o el ID de transacción (ej. 3a7f82b1... o tx-ccrd-89a1...)"
            value={verifyHashInput}
            onChange={(e) => setVerifyHashInput(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/30"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Verificar en Blockchain</span>
          </button>
        </form>

        {verificationResult && (
          <div className={`p-4 rounded-xl border text-xs space-y-2 animate-in fade-in ${
            verificationResult.found
              ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200'
              : 'bg-rose-950/40 border-rose-800 text-rose-200'
          }`}>
            {verificationResult.found ? (
              <div className="space-y-1.5 font-mono">
                <div className="flex items-center gap-2 text-sm font-bold text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>DOCUMENTO AUTÉNTICO E INMUTABLE REGISTRADO EN LEDGER</span>
                </div>
                <div className="text-[11px] text-slate-300">
                  <div><strong>Bloque #:</strong> {verificationResult.block?.block_number}</div>
                  <div><strong>Hash de Bloque:</strong> {verificationResult.block?.block_hash}</div>
                  <div><strong>ID Transacción:</strong> {verificationResult.tx?.tx_id}</div>
                  <div><strong>Fecha de Sellado RFC 3161:</strong> {verificationResult.tx?.timestamp}</div>
                  <div><strong>Nodo Notario:</strong> {verificationResult.tx?.nodo_peer}</div>
                  <div><strong>Detalle:</strong> {verificationResult.tx?.detalles}</div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                <span>
                  El hash o identificador buscado no se encuentra en el Ledger público de la Cámara de Cuentas. Verifique que no haya sido alterado.
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Public Reports Search & Grid */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-400" />
            <span>Informes de Auditoría Publicados para Consulta Libre</span>
          </h3>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por institución o palabra clave..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAudits.map((audit) => {
            const auditFindings = findings.filter((f) => f.auditoria_id === audit.id);
            return (
              <div
                key={audit.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-blue-400">{audit.codigo}</span>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded">
                      Auditoría Final Concluida
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-1.5">{audit.nombre}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{audit.entidad} • {audit.periodo_auditado}</p>

                  <div className="mt-3 p-3 rounded-lg bg-slate-950 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Fondo Examinado</span>
                      <strong className="text-white font-mono">{formatCurrency(audit.monto_examinado, currency)}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Monto Aclarado / Recuperado</span>
                      <strong className="text-emerald-400 font-mono">{formatCurrency(audit.monto_recuperado, currency)}</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                    <Layers className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="font-mono">Bloque #{audit.bloque_genesis}</span>
                  </div>

                  <button
                    onClick={() => onDownloadReport(audit)}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center gap-1.5 shadow-md shadow-blue-600/30"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar Informe PDF</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
