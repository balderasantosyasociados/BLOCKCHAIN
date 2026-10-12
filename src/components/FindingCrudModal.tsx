import React, { useState } from 'react';
import {
  FileText,
  Edit3,
  Trash2,
  Save,
  RotateCcw,
  History,
  FolderArchive,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Layers,
  X,
  Plus,
  Search,
  DollarSign,
  Shield,
  Copy,
  ChevronRight,
} from 'lucide-react';
import { FindingRecord, FindingVersion, RiskLevel, SupportedCurrency } from '../types';
import { formatCurrency } from '../services/i18n';
import { blockchainService, computeSHA256 } from '../services/blockchain';

interface FindingCrudModalProps {
  isOpen: boolean;
  onClose: () => void;
  findings: FindingRecord[];
  onUpdateFinding: (updatedFinding: FindingRecord) => void;
  onDeleteFinding: (findingId: string) => void;
  currency: SupportedCurrency;
  developerName: string;
}

export const FindingCrudModal: React.FC<FindingCrudModalProps> = ({
  isOpen,
  onClose,
  findings,
  onUpdateFinding,
  onDeleteFinding,
  currency,
  developerName,
}) => {
  const [selectedFindingId, setSelectedFindingId] = useState<string>(findings[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'editor' | 'historico_carpeta'>('editor');
  const [searchTerm, setSearchTerm] = useState('');

  const currentFinding = findings.find((f) => f.id === selectedFindingId) || findings[0];

  // Editable fields
  const [editTitulo, setEditTitulo] = useState(currentFinding?.titulo || '');
  const [editCondicion, setEditCondicion] = useState(currentFinding?.condicion || '');
  const [editCriterio, setEditCriterio] = useState(currentFinding?.criterio || '');
  const [editCausa, setEditCausa] = useState(currentFinding?.causa || '');
  const [editEfecto, setEditEfecto] = useState(currentFinding?.efecto || '');
  const [editRecomendacion, setEditRecomendacion] = useState(currentFinding?.recomendacion || '');
  const [editRiesgo, setEditRiesgo] = useState<RiskLevel>(currentFinding?.riesgo || 'Alto');
  const [editMonto, setEditMonto] = useState<number>(currentFinding?.monto_observado || 0);
  const [changeReason, setChangeReason] = useState('Corrección técnica y ampliación de marco legal');
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'danger' } | null>(null);

  // Sync state when selecting a different finding
  const handleSelectFinding = (finding: FindingRecord) => {
    setSelectedFindingId(finding.id);
    setEditTitulo(finding.titulo);
    setEditCondicion(finding.condicion);
    setEditCriterio(finding.criterio);
    setEditCausa(finding.causa);
    setEditEfecto(finding.efecto);
    setEditRecomendacion(finding.recomendacion);
    setEditRiesgo(finding.riesgo);
    setEditMonto(finding.monto_observado);
    setFeedbackMsg(null);
  };

  if (!isOpen || !currentFinding) return null;

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Archive the previous version into the automated folder
    const prevVersionHash = await computeSHA256(
      `${currentFinding.id}-${currentFinding.titulo}-${currentFinding.monto_observado}-${Date.now()}`
    );

    const archivedSnapshot: FindingVersion = {
      version: currentFinding.version_actual || 'v1.0',
      timestamp: new Date().toLocaleString('es-DO'),
      modificado_por: developerName || 'Lic. Pedro Baldera',
      motivo_cambio: changeReason,
      titulo: currentFinding.titulo,
      condicion: currentFinding.condicion,
      criterio: currentFinding.criterio,
      causa: currentFinding.causa,
      efecto: currentFinding.efecto,
      recomendacion: currentFinding.recomendacion,
      riesgo: currentFinding.riesgo,
      monto_observado: currentFinding.monto_observado,
      hash_version: prevVersionHash,
    };

    const existingHistory = currentFinding.historico_versiones || [];
    const nextVersionNum = `v${(existingHistory.length + 2).toFixed(1)}`;

    // 2. Commit transaction to Hyperledger Fabric
    const updatePayload = JSON.stringify({
      id: currentFinding.id,
      codigo: currentFinding.codigo,
      nueva_version: nextVersionNum,
      motivo: changeReason,
      titulo: editTitulo,
      monto: editMonto,
    });

    const { tx } = await blockchainService.commitTransaction(
      'ACTUALIZAR_HALLAZGO',
      developerName,
      'AUDITOR_CCRD',
      'FindingChaincode:UpdateFinding',
      `Modificación de ${currentFinding.codigo} a versión ${nextVersionNum}`,
      updatePayload
    );

    // 3. Create updated finding object
    const updated: FindingRecord = {
      ...currentFinding,
      titulo: editTitulo,
      condicion: editCondicion,
      criterio: editCriterio,
      causa: editCausa,
      efecto: editEfecto,
      recomendacion: editRecomendacion,
      riesgo: editRiesgo,
      monto_observado: Number(editMonto),
      blockchain_hash: tx.payload_hash,
      version_actual: nextVersionNum,
      historico_versiones: [archivedSnapshot, ...existingHistory],
    };

    onUpdateFinding(updated);
    setFeedbackMsg({
      text: `Hallazgo modificado con éxito a ${nextVersionNum}. La versión anterior fue archivada en la Carpeta Automática.`,
      type: 'success',
    });
    setTimeout(() => setFeedbackMsg(null), 5000);
  };

  const handleRestoreVersion = (version: FindingVersion) => {
    setEditTitulo(version.titulo);
    setEditCondicion(version.condicion);
    setEditCriterio(version.criterio);
    setEditCausa(version.causa);
    setEditEfecto(version.efecto);
    setEditRecomendacion(version.recomendacion);
    setEditRiesgo(version.riesgo);
    setEditMonto(version.monto_observado);
    setChangeReason(`Restauración de contenido desde versión histórica ${version.version}`);
    setActiveTab('editor');
    setFeedbackMsg({
      text: `Contenido cargado desde la versión ${version.version}. Haz clic en Guardar para ratificarla.`,
      type: 'success',
    });
  };

  const handleDelete = () => {
    if (confirm(`¿Estás seguro de eliminar el hallazgo ${currentFinding.codigo}? Esta acción quedará registrada en los logs de seguridad.`)) {
      onDeleteFinding(currentFinding.id);
      onClose();
    }
  };

  const filteredList = findings.filter(
    (f) =>
      f.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.titulo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl max-h-[94vh] overflow-hidden flex flex-col shadow-2xl text-xs">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-950 text-blue-400 border border-blue-800/60">
              <FolderArchive className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Gestión en Pantalla, Edición & Carpeta de Versiones Históricas</span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                  {currentFinding.version_actual || 'v1.0'}
                </span>
              </h3>
              <p className="text-slate-400 text-xs">
                Modifica, corrige o elimina cualquier hallazgo manteniendo el archivo inmutable de cada versión anterior.
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

        {/* Feedback message */}
        {feedbackMsg && (
          <div className={`p-3 px-5 text-xs flex items-center gap-2 border-b ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-950/70 border-emerald-800 text-emerald-300'
              : 'bg-rose-950/70 border-rose-800 text-rose-300'
          }`}>
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{feedbackMsg.text}</span>
          </div>
        )}

        {/* Main Body with Sidebar + Content */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Left Sidebar: Findings list navigation */}
          <div className="w-full md:w-72 bg-slate-950/60 border-r border-slate-800 p-3 flex flex-col gap-2 overflow-y-auto">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar hallazgo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-slate-500"
              />
            </div>

            <div className="space-y-1.5 flex-1 overflow-y-auto">
              {filteredList.map((f) => {
                const isSelected = f.id === currentFinding.id;
                const vCount = f.historico_versiones ? f.historico_versiones.length : 0;
                return (
                  <button
                    key={f.id}
                    onClick={() => handleSelectFinding(f)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all text-xs space-y-1 ${
                      isSelected
                        ? 'bg-blue-600/20 border-blue-500 text-white shadow-md'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-amber-400">{f.codigo}</span>
                      <span className="text-[9px] font-mono bg-slate-800 px-1.5 py-0.2 rounded text-slate-300">
                        {f.version_actual || 'v1.0'}
                      </span>
                    </div>
                    <div className="truncate font-semibold text-slate-200">{f.titulo}</div>
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>Riesgo {f.riesgo}</span>
                      <span>{vCount} vers. históricas</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Area: Form or Version History */}
          <div className="flex-1 flex flex-col overflow-y-auto p-5 space-y-4">
            
            {/* Tab switch between Editor and Version Archive */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('editor')}
                  className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors ${
                    activeTab === 'editor'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editor & Corrección en Pantalla</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('historico_carpeta')}
                  className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors ${
                    activeTab === 'historico_carpeta'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <FolderArchive className="w-3.5 h-3.5" />
                  <span>Carpeta Automática con Historial ({currentFinding.historico_versiones?.length || 0})</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleDelete}
                className="px-3 py-1.5 rounded-lg bg-rose-950/70 hover:bg-rose-900 text-rose-300 border border-rose-800 font-semibold flex items-center gap-1"
                title="Eliminar este hallazgo"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Eliminar</span>
              </button>
            </div>

            {/* TAB 1: In-Place Editor */}
            {activeTab === 'editor' && (
              <form onSubmit={handleSaveChanges} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-slate-300 font-semibold mb-1">Título del Hallazgo</label>
                    <input
                      type="text"
                      required
                      value={editTitulo}
                      onChange={(e) => setEditTitulo(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-semibold focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Monto Observado (DOP)</label>
                    <input
                      type="number"
                      required
                      value={editMonto}
                      onChange={(e) => setEditMonto(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-amber-400 font-mono font-bold focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-amber-400 font-semibold mb-1">1. Condición (Hechos Observados)</label>
                    <textarea
                      rows={3}
                      required
                      value={editCondicion}
                      onChange={(e) => setEditCondicion(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-blue-500 leading-relaxed"
                    />
                  </div>
                  <div>
                    <label className="block text-blue-400 font-semibold mb-1">2. Criterio (Marco Legal Ley 10-04, 340-06)</label>
                    <textarea
                      rows={3}
                      required
                      value={editCriterio}
                      onChange={(e) => setEditCriterio(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-blue-500 leading-relaxed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-rose-400 font-semibold mb-1">3. Causa</label>
                    <textarea
                      rows={2}
                      required
                      value={editCausa}
                      onChange={(e) => setEditCausa(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-orange-400 font-semibold mb-1">4. Efecto</label>
                    <textarea
                      rows={2}
                      required
                      value={editEfecto}
                      onChange={(e) => setEditEfecto(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-emerald-400 font-semibold mb-1">5. Recomendación Vinculante</label>
                  <textarea
                    rows={2}
                    required
                    value={editRecomendacion}
                    onChange={(e) => setEditRecomendacion(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Nivel de Riesgo</label>
                    <select
                      value={editRiesgo}
                      onChange={(e) => setEditRiesgo(e.target.value as RiskLevel)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-bold"
                    >
                      <option value="Crítico">Crítico</option>
                      <option value="Alto">Alto</option>
                      <option value="Medio">Medio</option>
                      <option value="Bajo">Bajo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Motivo de la Modificación / Auditoría
                    </label>
                    <input
                      type="text"
                      required
                      value={changeReason}
                      onChange={(e) => setChangeReason(e.target.value)}
                      placeholder="Ej. Corrección de monto tras peritaje forense..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-blue-600/30"
                  >
                    <Save className="w-4 h-4" />
                    <span>Guardar y Archivar Versión Anterior en Carpeta</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: Automated Folder with Version History */}
            {activeTab === 'historico_carpeta' && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-900/60 text-slate-300 text-xs">
                  <strong className="text-amber-400 block mb-1">
                    Carpeta Automática de Versiones Históricas ({currentFinding.codigo}):
                  </strong>
                  Cada modificación genera un respaldo inmutable con su hash criptográfico. Puedes inspeccionar las versiones anteriores y restaurar cualquier estado previo si es necesario.
                </div>

                {(!currentFinding.historico_versiones || currentFinding.historico_versiones.length === 0) ? (
                  <div className="p-8 text-center text-slate-500 bg-slate-950 rounded-xl border border-slate-800">
                    Aún no hay versiones archivadas para este hallazgo. Se encuentra en su versión inicial {currentFinding.version_actual || 'v1.0'}.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {currentFinding.historico_versiones.map((v, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 font-mono text-xs"
                      >
                        <div className="flex items-center justify-between font-sans">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                              {v.version}
                            </span>
                            <span className="font-bold text-white">{v.titulo}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRestoreVersion(v)}
                            className="px-2.5 py-1 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 border border-blue-500/40 font-semibold text-[11px] flex items-center gap-1"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Restaurar Esta Versión</span>
                          </button>
                        </div>

                        <div className="text-[11px] font-sans text-slate-400 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-900">
                          <div>Fecha: <strong className="text-white">{v.timestamp}</strong></div>
                          <div>Modificado por: <strong className="text-slate-200">{v.modificado_por}</strong></div>
                          <div>Monto: <strong className="text-amber-400">{formatCurrency(v.monto_observado, currency)}</strong></div>
                          <div>Riesgo: <strong className="text-slate-300">{v.riesgo}</strong></div>
                        </div>

                        <div className="text-[11px] font-sans text-slate-300 bg-slate-900 p-2 rounded border border-slate-800">
                          <strong>Motivo del cambio:</strong> {v.motivo_cambio}
                        </div>

                        <div className="text-[10px] text-slate-500 break-all">
                          HASH DE VERSIÓN: {v.hash_version}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};
