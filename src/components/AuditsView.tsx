import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  DollarSign,
  Shield,
  Layers,
  ChevronRight,
  Sparkles,
  Download,
  AlertCircle,
  X,
} from 'lucide-react';
import { AuditRecord, AuditStatus, AuditType, FindingRecord, SupportedCurrency, SupportedLanguage } from '../types';
import { formatCurrency } from '../services/i18n';
import { blockchainService } from '../services/blockchain';

interface AuditsViewProps {
  audits: AuditRecord[];
  findings: FindingRecord[];
  onAddAudit: (audit: AuditRecord) => void;
  currency: SupportedCurrency;
  lang: SupportedLanguage;
  onOpenFindingWithAudit: (auditId: string) => void;
  onGenerateReport: (audit: AuditRecord, reportType: 'financiero' | 'legal' | 'forense') => void;
}

export const AuditsView: React.FC<AuditsViewProps> = ({
  audits,
  findings,
  onAddAudit,
  currency,
  lang,
  onOpenFindingWithAudit,
  onGenerateReport,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedAudit, setSelectedAudit] = useState<AuditRecord | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Audit Form state
  const [newCodigo, setNewCodigo] = useState(`CCRD-AUD-2025-0${audits.length + 15}`);
  const [newNombre, setNewNombre] = useState('');
  const [newEntidad, setNewEntidad] = useState('');
  const [newSiglas, setNewSiglas] = useState('');
  const [newSector, setNewSector] = useState('Salud y Seguridad Social');
  const [newTipo, setNewTipo] = useState<AuditType>('Auditoría Financiera');
  const [newPeriodo, setNewPeriodo] = useState('Ejercicio Fiscal 2024');
  const [newMontoExaminado, setNewMontoExaminado] = useState(500000000);
  const [newAuditorLider, setNewAuditorLider] = useState('Lic. Pedro Baldera');
  const [newSupervisor, setNewSupervisor] = useState('Dra. Altagracia Peña Morales');

  const filteredAudits = audits.filter((a) => {
    const matchesSearch =
      a.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.entidad.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.siglas.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || a.estado === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCreateAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNombre || !newEntidad) return;

    // Commit to Hyperledger Fabric
    const payload = JSON.stringify({
      codigo: newCodigo,
      nombre: newNombre,
      entidad: newEntidad,
      tipo: newTipo,
      monto: newMontoExaminado,
      auditor: newAuditorLider,
    });

    const { tx, block } = await blockchainService.commitTransaction(
      'CREAR_AUDITORIA',
      newAuditorLider,
      'AUDITOR_CCRD',
      'AuditChaincode:CreateAudit',
      `Apertura de Auditoría ${newCodigo} en ${newEntidad}`,
      payload
    );

    const newAudit: AuditRecord = {
      id: 'aud-' + Date.now(),
      codigo: newCodigo,
      nombre: newNombre,
      entidad: newEntidad,
      siglas: newSiglas || newEntidad.substring(0, 6).toUpperCase(),
      sector: newSector,
      tipo: newTipo,
      fecha_inicio: new Date().toISOString().split('T')[0],
      fecha_fin: '2025-12-31',
      periodo_auditado: newPeriodo,
      estado: 'En Ejecución',
      monto_examinado: Number(newMontoExaminado),
      monto_observado: 0,
      monto_recuperado: 0,
      auditor_lider: newAuditorLider,
      supervisor: newSupervisor,
      blockchain_tx_id: tx.tx_id,
      bloque_genesis: block.block_number,
      hallazgos_count: 0,
      recomendaciones_count: 0,
      cumplimiento_pct: 0,
      firmas: {
        auditor: true,
        supervisor: false,
        director: false,
        pleno: false,
      },
    };

    onAddAudit(newAudit);
    setShowCreateModal(false);
    setSelectedAudit(newAudit);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <span>Portal Auditor CCRD • Expedientes Fiscalizadores</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Planificación, ejecución sustantiva y trazabilidad inmutable conforme a la Ley 10-04 y normas ISSAI.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/30"
        >
          <Plus className="w-4 h-4" />
          <span>Aperturar Nueva Auditoría</span>
        </button>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por código (ej. CCRD-AUD-2025-014), entidad o ministerio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="all">Todos los Estados</option>
            <option value="Planificación">Planificación</option>
            <option value="En Ejecución">En Ejecución</option>
            <option value="En Réplicas">En Réplicas</option>
            <option value="En Aprobación Pleno">En Aprobación Pleno</option>
            <option value="Informe Definitivo Publicado">Informe Definitivo Publicado</option>
          </select>
        </div>
      </div>

      {/* Audits Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAudits.map((audit) => {
          const auditFindings = findings.filter((f) => f.auditoria_id === audit.id);
          return (
            <div
              key={audit.id}
              className="bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-xl p-5 shadow-lg transition-all flex flex-col justify-between group space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-400">
                        {audit.codigo}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
                        {audit.sector}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white mt-1 group-hover:text-blue-200 transition-colors">
                      {audit.nombre}
                    </h3>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded flex-shrink-0 ${
                    audit.estado === 'Informe Definitivo Publicado'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : audit.estado === 'En Réplicas'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : 'bg-blue-950 text-blue-300 border border-blue-800'
                  }`}>
                    {audit.estado}
                  </span>
                </div>

                <div className="mt-3 p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Monto Examinado</span>
                    <strong className="text-white font-mono">{formatCurrency(audit.monto_examinado, currency)}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Monto Observado</span>
                    <strong className="text-amber-400 font-mono">{formatCurrency(audit.monto_observado, currency)}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Entidad Fiscalizada</span>
                    <strong className="text-slate-200 truncate block">{audit.entidad}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Período Auditado</span>
                    <strong className="text-slate-300 truncate block">{audit.periodo_auditado}</strong>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-mono">Bloque #{audit.bloque_genesis}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenFindingWithAudit(audit.id)}
                    className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 bg-amber-950/50 border border-amber-800/60 px-2 py-1 rounded"
                  >
                    + Hallazgo IA
                  </button>
                  <button
                    onClick={() => setSelectedAudit(audit)}
                    className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 bg-blue-950/50 border border-blue-800/60 px-2.5 py-1 rounded flex items-center gap-1"
                  >
                    <span>Detalles</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Audit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">Apertura Formal de Auditoría CCRD</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAudit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Código Oficial Expediente</label>
                  <input
                    type="text"
                    required
                    value={newCodigo}
                    onChange={(e) => setNewCodigo(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Tipo de Auditoría ISSAI</label>
                  <select
                    value={newTipo}
                    onChange={(e) => setNewTipo(e.target.value as AuditType)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Auditoría Financiera">Auditoría Financiera (ISSAI 200)</option>
                    <option value="Auditoría de Cumplimiento">Auditoría de Cumplimiento (ISSAI 400)</option>
                    <option value="Auditoría de Gestión">Auditoría de Gestión (ISSAI 300)</option>
                    <option value="Auditoría Forense">Auditoría Forense / Investigativa</option>
                    <option value="Investigación Especial">Investigación Especial</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Título / Objeto de la Auditoría</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Auditoría a las Adquisiciones de Almuerzo Escolar e Insumos Tecnológicos..."
                  value={newNombre}
                  onChange={(e) => setNewNombre(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1">Entidad Auditada (Órgano del Estado)</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Ministerio de la Vivienda y Edificaciones (MIVED)"
                    value={newEntidad}
                    onChange={(e) => setNewEntidad(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Siglas</label>
                  <input
                    type="text"
                    placeholder="Ej. MIVED"
                    value={newSiglas}
                    onChange={(e) => setNewSiglas(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white uppercase focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Sector Gubernamental</label>
                  <select
                    value={newSector}
                    onChange={(e) => setNewSector(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Educación y Cultura">Educación y Cultura</option>
                    <option value="Infraestructura y Transporte">Infraestructura y Transporte</option>
                    <option value="Salud y Seguridad Social">Salud y Seguridad Social</option>
                    <option value="Hacienda y Recaudación">Hacienda y Recaudación</option>
                    <option value="Municipal y Gobiernos Locales">Municipal y Gobiernos Locales</option>
                    <option value="Justicia y Seguridad Nacional">Justicia y Seguridad Nacional</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Período Auditado</label>
                  <input
                    type="text"
                    value={newPeriodo}
                    onChange={(e) => setNewPeriodo(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Monto Presupuestario Examinado (DOP)</label>
                  <input
                    type="number"
                    min="0"
                    value={newMontoExaminado}
                    onChange={(e) => setNewMontoExaminado(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Auditor Líder Asignado</label>
                  <input
                    type="text"
                    value={newAuditorLider}
                    onChange={(e) => setNewAuditorLider(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-blue-950/40 border border-blue-800/60 text-slate-300 text-[11px] flex items-start gap-2">
                <Layers className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <p>
                  Al hacer clic en <strong>Crear y Registrar en Ledger</strong>, el sistema generará un bloque génesis en la red Hyperledger Fabric autenticado con la firma digital X.509 del auditor y distribuido a los nodos de CCRD, Contraloría, DGCP y DIGEIG.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-600/30"
                >
                  Crear y Registrar en Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Selected Audit Details Modal */}
      {selectedAudit && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-6">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-blue-400">
                    {selectedAudit.codigo}
                  </span>
                  <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                    {selectedAudit.tipo}
                  </span>
                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded">
                    {selectedAudit.estado}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white mt-1">
                  {selectedAudit.nombre}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAudit(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Monto Examinado</span>
                <span className="text-base font-bold text-white font-mono">
                  {formatCurrency(selectedAudit.monto_examinado, currency)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Monto Observado</span>
                <span className="text-base font-bold text-amber-400 font-mono">
                  {formatCurrency(selectedAudit.monto_observado, currency)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Monto Recuperado</span>
                <span className="text-base font-bold text-emerald-400 font-mono">
                  {formatCurrency(selectedAudit.monto_recuperado, currency)}
                </span>
              </div>
            </div>

            {/* Blockchain Provenance */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  Custodia Criptográfica en Blockchain Hyperledger Fabric
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                  Bloque Génesis #{selectedAudit.bloque_genesis}
                </span>
              </div>
              <div className="font-mono text-[11px] text-slate-400 break-all bg-slate-900 p-2 rounded border border-slate-800">
                ID Transacción: {selectedAudit.blockchain_tx_id}
              </div>
            </div>

            {/* 4-Tier Digital Signature Status */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Flujo de Firma Digital Institucional X.509 (Ley 126-02)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {[
                  { label: '1. Auditor Líder', signed: selectedAudit.firmas.auditor, role: 'Elaboración' },
                  { label: '2. Supervisor', signed: selectedAudit.firmas.supervisor, role: 'Control Calidad' },
                  { label: '3. Dir. Auditoría', signed: selectedAudit.firmas.director, role: 'Validación' },
                  { label: '4. Pleno CCRD', signed: selectedAudit.firmas.pleno, role: 'Aprobación Final' },
                ].map((s, i) => (
                  <div
                    key={i}
                    className={`p-2.5 rounded-lg border flex flex-col justify-between ${
                      s.signed
                        ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-500'
                    }`}
                  >
                    <span className="font-semibold text-[11px]">{s.label}</span>
                    <span className="text-[10px] mt-1">{s.role}</span>
                    <div className="mt-2 flex items-center gap-1 text-[10px] font-bold">
                      {s.signed ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Firmado Digital</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>Pendiente</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Export Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800 text-xs">
              <div className="flex gap-2">
                <button
                  onClick={() => onGenerateReport(selectedAudit, 'financiero')}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Informe Financiero (PDF)</span>
                </button>
                <button
                  onClick={() => onGenerateReport(selectedAudit, 'legal')}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Informe Legal & Forense</span>
                </button>
              </div>

              <button
                onClick={() => {
                  const id = selectedAudit.id;
                  setSelectedAudit(null);
                  onOpenFindingWithAudit(id);
                }}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Agregar Hallazgo ISSAI</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
