import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  Table,
  Shield,
  Layers,
  CheckCircle2,
  Calendar,
  DollarSign,
  FileSpreadsheet,
  Building,
} from 'lucide-react';
import { AuditRecord, FindingRecord, SupportedCurrency, SupportedLanguage } from '../types';
import { formatCurrency } from '../services/i18n';

interface ReportsViewProps {
  audits: AuditRecord[];
  findings: FindingRecord[];
  currency: SupportedCurrency;
  lang: SupportedLanguage;
  initialSelectedAudit?: AuditRecord;
  initialReportType?: 'financiero' | 'legal' | 'forense';
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  audits,
  findings,
  currency,
  lang,
  initialSelectedAudit,
  initialReportType = 'financiero',
}) => {
  const [selectedAuditId, setSelectedAuditId] = useState<string>(
    initialSelectedAudit?.id || audits[0]?.id || ''
  );
  const [reportType, setReportType] = useState<'financiero' | 'legal' | 'forense'>(initialReportType);

  const currentAudit = audits.find((a) => a.id === selectedAuditId) || audits[0];
  const auditFindings = findings.filter((f) => f.auditoria_id === currentAudit?.id);

  // Export to structured CSV/Excel
  const handleExportCSV = () => {
    if (!currentAudit) return;

    const headers = [
      'Código Expediente',
      'Entidad Auditada',
      'Tipo de Auditoría',
      'Código Hallazgo',
      'Título del Hallazgo',
      'Nivel de Riesgo',
      'Monto Observado (DOP)',
      'Estado',
      'Blockchain TxID',
      'Hash SHA256',
    ];

    const rows = auditFindings.map((f) => [
      currentAudit.codigo,
      `"${currentAudit.entidad}"`,
      currentAudit.tipo,
      f.codigo,
      `"${f.titulo.replace(/"/g, '""')}"`,
      f.riesgo,
      f.monto_observado,
      f.estado,
      f.tx_id,
      f.blockchain_hash,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SITA-CCRD_${currentAudit.codigo}_${reportType.toUpperCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Configuration */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-white">
              Generador Oficial de Informes • Financiero, Legal & Forense
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Emisión de dictámenes técnicos certificados listos para impresión oficial, firma digital o exportación a Excel / CSV.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
          >
            <Download className="w-4 h-4" />
            <span>Descargar Excel / CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/30"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / Guardar PDF</span>
          </button>
        </div>
      </div>

      {/* Selectors Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 print:hidden">
        <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs">
          <label className="block text-slate-400 font-semibold mb-1">Expediente de Auditoría:</label>
          <select
            value={selectedAuditId}
            onChange={(e) => setSelectedAuditId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-white font-medium focus:outline-none focus:border-blue-500"
          >
            {audits.map((a) => (
              <option key={a.id} value={a.id}>
                {a.codigo} - {a.siglas} ({a.nombre.substring(0, 50)}...)
              </option>
            ))}
          </select>
        </div>

        <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs">
          <label className="block text-slate-400 font-semibold mb-1">Tipo de Dictamen:</label>
          <div className="grid grid-cols-3 gap-2">
            {(['financiero', 'legal', 'forense'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setReportType(t)}
                className={`py-1.5 rounded-lg capitalize font-bold text-xs transition-colors ${
                  reportType === t
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                Informe {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Official Printable Report Canvas */}
      {currentAudit && (
        <div className="bg-white text-slate-900 rounded-2xl p-8 sm:p-12 shadow-2xl border border-slate-200 max-w-4xl mx-auto space-y-8 font-sans print:p-0 print:border-none print:shadow-none print:rounded-none">
          
          {/* Official Dominican Header */}
          <div className="border-b-2 border-slate-900 pb-6 text-center space-y-1.5">
            <div className="text-[11px] font-extrabold uppercase tracking-widest text-[#002F6C]">
              REPÚBLICA DOMINICANA
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              CÁMARA DE CUENTAS DE LA REPÚBLICA DOMINICANA
            </div>
            <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              ÓRGANO SUPERIOR DE CONTROL EXTERNO DE LOS RECURSOS PÚBLICOS • LEY NO. 10-04
            </div>
            <div className="inline-block mt-2 px-3 py-1 rounded bg-slate-100 border border-slate-300 font-mono text-xs font-bold text-slate-800">
              EXPEDIENTE OFICIAL NO. {currentAudit.codigo}
            </div>
          </div>

          {/* Title & Scope */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
              <span>Fecha de Emisión: {new Date().toLocaleDateString('es-DO')}</span>
              <span>Sello Inmutable: HLF-CCRD-SEC-2025</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 text-center uppercase tracking-wide">
              INFORME {reportType.toUpperCase()} DE AUDITORÍA
            </h3>
            <p className="text-sm font-semibold text-slate-700 text-center">
              "{currentAudit.nombre}"
            </p>
          </div>

          {/* General Information Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block">Entidad Fiscalizada:</span>
              <strong className="text-slate-900 text-sm">{currentAudit.entidad}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Período Auditado:</span>
              <strong className="text-slate-900 text-sm">{currentAudit.periodo_auditado}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Tipo de Auditoría:</span>
              <strong className="text-slate-900">{currentAudit.tipo} (ISSAI)</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Equipo Responsable:</span>
              <strong className="text-slate-900">{currentAudit.auditor_lider} (Líder) / {currentAudit.supervisor}</strong>
            </div>
          </div>

          {/* Financial Summary Table */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
              1. Resumen Ejecutivo Cuantitativo
            </h4>
            <table className="w-full text-xs text-left border border-slate-200">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Concepto</th>
                  <th className="p-2.5 text-right">Monto Estimado</th>
                  <th className="p-2.5 text-right">% Relativo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono">
                <tr>
                  <td className="p-2.5 font-sans">Monto Total Presupuestario Examinado</td>
                  <td className="p-2.5 text-right font-bold">{formatCurrency(currentAudit.monto_examinado, currency)}</td>
                  <td className="p-2.5 text-right">100.0%</td>
                </tr>
                <tr className="bg-amber-50/50">
                  <td className="p-2.5 font-sans font-semibold text-amber-900">Monto Total con Observaciones / Irregularidades</td>
                  <td className="p-2.5 text-right font-bold text-amber-900">{formatCurrency(currentAudit.monto_observado, currency)}</td>
                  <td className="p-2.5 text-right text-amber-900">
                    {((currentAudit.monto_observado / currentAudit.monto_examinado) * 100).toFixed(1)}%
                  </td>
                </tr>
                <tr className="bg-emerald-50/50">
                  <td className="p-2.5 font-sans font-semibold text-emerald-900">Monto Aclarado / Reembolsado al Erario</td>
                  <td className="p-2.5 text-right font-bold text-emerald-900">{formatCurrency(currentAudit.monto_recuperado, currency)}</td>
                  <td className="p-2.5 text-right text-emerald-900">
                    {((currentAudit.monto_recuperado / currentAudit.monto_observado) * 100).toFixed(1)}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Detailed ISSAI Findings Table */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
              2. Detalle de Hallazgos Estructurados (Normas ISSAI)
            </h4>

            <div className="space-y-4">
              {auditFindings.map((f, i) => (
                <div key={f.id} className="border border-slate-200 rounded-lg p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-blue-900">{f.codigo} - {f.titulo}</span>
                    <span className="font-bold text-amber-900 font-mono">{formatCurrency(f.monto_observado, currency)}</span>
                  </div>
                  <div className="space-y-1 text-slate-700">
                    <div><strong>Condición:</strong> {f.condicion}</div>
                    <div><strong>Criterio Legal:</strong> {f.criterio}</div>
                    <div><strong>Causa:</strong> {f.causa}</div>
                    <div><strong>Efecto:</strong> {f.efecto}</div>
                    <div><strong>Recomendación Vinculante:</strong> {f.recomendacion}</div>
                  </div>
                  <div className="font-mono text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                    Hash Blockchain: {f.blockchain_hash}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Digital Signatures 4 Tiers Official Box */}
          <div className="space-y-4 pt-6 border-t-2 border-slate-900">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider text-center">
              Firmas Digitales PKI de Validación y Publicación (Ley 126-02)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-xs">
              <div className="border-t border-slate-400 pt-2">
                <span className="font-bold block text-slate-900">{currentAudit.auditor_lider}</span>
                <span className="text-[10px] text-slate-600 block">Auditor Encargado</span>
                <span className="text-[9px] font-mono text-emerald-700 font-semibold">Firma X.509 Válida</span>
              </div>
              <div className="border-t border-slate-400 pt-2">
                <span className="font-bold block text-slate-900">{currentAudit.supervisor}</span>
                <span className="text-[10px] text-slate-600 block">Supervisor Calidad</span>
                <span className="text-[9px] font-mono text-emerald-700 font-semibold">Firma X.509 Válida</span>
              </div>
              <div className="border-t border-slate-400 pt-2">
                <span className="font-bold block text-slate-900">Lic. José Ramírez</span>
                <span className="text-[10px] text-slate-600 block">Director de Auditoría</span>
                <span className="text-[9px] font-mono text-slate-500 font-semibold">
                  {currentAudit.firmas.director ? 'Firma X.509 Válida' : 'Pendiente'}
                </span>
              </div>
              <div className="border-t border-slate-400 pt-2">
                <span className="font-bold block text-slate-900">Mag. Ramón Henríquez</span>
                <span className="text-[10px] text-slate-600 block">Miembro del Pleno</span>
                <span className="text-[9px] font-mono text-slate-500 font-semibold">
                  {currentAudit.firmas.pleno ? 'Aprobado Pleno' : 'Pendiente'}
                </span>
              </div>
            </div>
          </div>

          {/* QR & Verification Footnote */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center justify-between text-[11px] font-mono text-slate-600">
            <div>
              <span>ID Transacción Blockchain: <strong>{currentAudit.blockchain_tx_id}</strong></span>
              <br />
              <span>Verificación en línea: https://ccrd.gob.do/verificar/{currentAudit.codigo}</span>
            </div>
            <div className="w-12 h-12 bg-slate-900 text-white flex items-center justify-center font-bold text-[10px] rounded">
              QR CCRD
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
