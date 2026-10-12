import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  Plus,
  Shield,
  Layers,
  Upload,
  FileCheck,
  AlertTriangle,
  DollarSign,
  Search,
  CheckCircle2,
  X,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FolderArchive,
} from 'lucide-react';
import {
  AuditRecord,
  FindingRecord,
  DigitalEvidence,
  RiskLevel,
  SupportedCurrency,
  SupportedLanguage,
} from '../types';
import { formatCurrency } from '../services/i18n';
import { requestAIGenerateFinding } from '../services/aiService';
import { blockchainService, computeSHA256, computeSHA512 } from '../services/blockchain';

interface FindingsViewProps {
  findings: FindingRecord[];
  audits: AuditRecord[];
  evidences: DigitalEvidence[];
  onAddFinding: (finding: FindingRecord) => void;
  onAddEvidence: (evidence: DigitalEvidence) => void;
  onOpenFindingEditor?: (finding: FindingRecord) => void;
  currency: SupportedCurrency;
  lang: SupportedLanguage;
  preselectedAuditId?: string;
}

export const FindingsView: React.FC<FindingsViewProps> = ({
  findings,
  audits,
  evidences,
  onAddFinding,
  onAddEvidence,
  onOpenFindingEditor,
  currency,
  lang,
  preselectedAuditId,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRisk, setSelectedRisk] = useState<string>('all');
  const [selectedFinding, setSelectedFinding] = useState<FindingRecord | null>(null);
  const [showAIGeneratorModal, setShowAIGeneratorModal] = useState(false);
  const [showEvidenceUploadModal, setShowEvidenceUploadModal] = useState(false);
  const [expandedFindingId, setExpandedFindingId] = useState<string | null>(null);

  // AI Generator Form state
  const [aiAuditId, setAiAuditId] = useState<string>(preselectedAuditId || audits[0]?.id || '');
  const [aiTitle, setAiTitle] = useState('');
  const [aiObservation, setAiObservation] = useState('');
  const [aiIsLoading, setAiIsLoading] = useState(false);

  // Drafted ISSAI values (editable by auditor)
  const [draftCondicion, setDraftCondicion] = useState('');
  const [draftCriterio, setDraftCriterio] = useState('');
  const [draftCausa, setDraftCausa] = useState('');
  const [draftEfecto, setDraftEfecto] = useState('');
  const [draftRecomendacion, setDraftRecomendacion] = useState('');
  const [draftRiesgo, setDraftRiesgo] = useState<RiskLevel>('Alto');
  const [draftMonto, setDraftMonto] = useState(15000000);

  // Evidence upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadCategory, setUploadCategory] = useState<DigitalEvidence['categoria']>('Contrato');
  const [uploadProgress, setUploadProgress] = useState(false);
  const [calculatedHashes, setCalculatedHashes] = useState<{ sha256: string; sha512: string } | null>(null);

  const filteredFindings = findings.filter((f) => {
    const matchesSearch =
      f.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.criterio.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = selectedRisk === 'all' || f.riesgo === selectedRisk;
    return matchesSearch && matchesRisk;
  });

  const handleGenerateWithAI = async () => {
    const selectedAudit = audits.find((a) => a.id === aiAuditId);
    setAiIsLoading(true);
    try {
      const result = await requestAIGenerateFinding({
        title: aiTitle || 'Irregularidad en adquisiciones',
        entity: selectedAudit?.entidad || 'Entidad Pública',
        rawObservation: aiObservation || 'Contrataciones fraccionadas y desembolsos sin soporte de entrega conforme',
        auditType: selectedAudit?.tipo || 'Auditoría Financiera y de Cumplimiento',
        legalFramework: 'Ley 10-04, Ley 340-06, Ley 126-02, Ley 172-13, ISSAI 200/400',
      });

      setDraftCondicion(result.condicion);
      setDraftCriterio(result.criterio);
      setDraftCausa(result.causa);
      setDraftEfecto(result.efecto);
      setDraftRecomendacion(result.recomendacion);
      setDraftRiesgo(result.riesgoSugerido);
      if (result.montoObservadoEstimadoDOP) {
        setDraftMonto(result.montoObservadoEstimadoDOP);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAiIsLoading(false);
    }
  };

  const handleSaveFinding = async () => {
    const selectedAudit = audits.find((a) => a.id === aiAuditId);
    const findingCode = `HAL-${String(findings.length + 1).padStart(2, '0')}-${selectedAudit?.siglas || 'CCRD'}`;

    const payload = JSON.stringify({
      codigo: findingCode,
      titulo: aiTitle || 'Hallazgo de Auditoría ISSAI',
      condicion: draftCondicion,
      criterio: draftCriterio,
      causa: draftCausa,
      efecto: draftEfecto,
      recomendacion: draftRecomendacion,
      riesgo: draftRiesgo,
      monto: draftMonto,
    });

    // Commit to Hyperledger Fabric
    const { tx, block } = await blockchainService.commitTransaction(
      'CREAR_HALLAZGO',
      'Lic. Pedro Baldera',
      'AUDITOR_CCRD',
      'FindingChaincode:CreateFinding',
      `Registro de Hallazgo ${findingCode} en ${selectedAudit?.siglas || 'Entidad'}`,
      payload
    );

    const newFinding: FindingRecord = {
      id: 'hal-' + Date.now(),
      auditoria_id: aiAuditId,
      codigo: findingCode,
      titulo: aiTitle || 'Hallazgo de Auditoría ISSAI',
      condicion: draftCondicion,
      criterio: draftCriterio,
      causa: draftCausa,
      efecto: draftEfecto,
      recomendacion: draftRecomendacion,
      riesgo: draftRiesgo,
      monto_observado: Number(draftMonto),
      estado: 'Abierto',
      fecha_registro: new Date().toISOString().split('T')[0],
      blockchain_hash: tx.payload_hash,
      tx_id: tx.tx_id,
      bloque_numero: block.block_number,
      evidencias_count: 0,
      replica_registrada: false,
    };

    onAddFinding(newFinding);
    setShowAIGeneratorModal(false);
    setSelectedFinding(newFinding);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
      const buffer = await file.arrayBuffer();
      const sha256 = await computeSHA256(buffer);
      const sha512 = await computeSHA512(buffer);
      setCalculatedHashes({ sha256, sha512 });
    }
  };

  const handleConfirmEvidenceUpload = async () => {
    if (!uploadFile || !calculatedHashes || !selectedFinding) return;

    setUploadProgress(true);

    const payload = JSON.stringify({
      archivo: uploadFile.name,
      sha256: calculatedHashes.sha256,
      tamano: uploadFile.size,
      hallazgo: selectedFinding.codigo,
    });

    const { tx } = await blockchainService.commitTransaction(
      'REGISTRAR_EVIDENCIA',
      'Lic. Pedro Baldera',
      'AUDITOR_CCRD',
      'EvidenceChaincode:RegisterEvidence',
      `Custodia digital inmutable de ${uploadFile.name}`,
      payload
    );

    const newEvidence: DigitalEvidence = {
      id: 'evi-' + Date.now(),
      hallazgo_id: selectedFinding.id,
      codigo_evidencia: `EVI-${String(evidences.length + 1).padStart(2, '0')}-${selectedFinding.codigo}`,
      documento_nombre: uploadFile.name,
      tamano_bytes: uploadFile.size,
      tamano_formateado: `${(uploadFile.size / 1024 / 1024).toFixed(2)} MB`,
      tipo_mime: uploadFile.type || 'application/pdf',
      categoria: uploadCategory,
      sha256: calculatedHashes.sha256,
      sha512: calculatedHashes.sha512,
      timestamp_rfc3161: new Date().toISOString(),
      firma_digital: {
        firmante: 'Lic. Pedro Baldera',
        cargo: 'Auditor Gubernamental Principal CCRD',
        institucion: 'Cámara de Cuentas de la República Dominicana',
        algoritmo: 'RSA-4096 / SHA-256',
        serial_certificado: 'DO-PKI-CCRD-2025-99812-X509',
        emisor_ac: 'Autoridad Certificadora Raíz del Estado Dominicano - INDOTEL',
        fecha_firma: new Date().toLocaleString('es-DO'),
        sello_tiempo_rfc3161: `TSA-CCRD-${Date.now()}`,
        valida: true,
      },
      blockchain_id: `hlf-asset-${Date.now()}`,
      nodo_custodia: 'peer0.ccrd.gob.do',
      estado_custodia: 'Cadena de Custodia Intacta',
      fecha_subida: new Date().toISOString().split('T')[0],
      subido_por: 'Lic. Pedro Baldera',
    };

    onAddEvidence(newEvidence);
    setUploadProgress(false);
    setShowEvidenceUploadModal(false);
    setUploadFile(null);
    setCalculatedHashes(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & AI Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>Módulo de Hallazgos ISSAI & Generador IA Gemini</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Estructuración rigurosa bajo normas ISSAI: Condición, Criterio, Causa, Efecto y Recomendación vinculada a leyes dominicanas.
          </p>
        </div>

        <button
          onClick={() => {
            setShowAIGeneratorModal(true);
            if (!draftCondicion) {
              setAiTitle('Irregularidad en compras públicas sin concurso');
              setAiObservation('Se constataron órdenes de compra consecutivas sin informe pericial previo ni aprobación del Comité de Compras.');
            }
          }}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20"
        >
          <Sparkles className="w-4 h-4" />
          <span>Generar Hallazgo con IA Gemini</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por código de hallazgo, título o norma citada (ej. Ley 340-06, Ley 10-04)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        <select
          value={selectedRisk}
          onChange={(e) => setSelectedRisk(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
        >
          <option value="all">Todos los Niveles de Riesgo</option>
          <option value="Crítico">Crítico</option>
          <option value="Alto">Alto</option>
          <option value="Medio">Medio</option>
          <option value="Bajo">Bajo</option>
        </select>
      </div>

      {/* Findings List */}
      <div className="space-y-4">
        {filteredFindings.map((finding) => {
          const audit = audits.find((a) => a.id === finding.auditoria_id);
          const findingEvidences = evidences.filter((e) => e.hallazgo_id === finding.id);
          const isExpanded = expandedFindingId === finding.id;

          return (
            <div
              key={finding.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 shadow-lg transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-amber-400">
                      {finding.codigo}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
                      {audit?.siglas || 'CCRD'}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      finding.riesgo === 'Crítico'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : finding.riesgo === 'Alto'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-blue-950 text-blue-300 border border-blue-800'
                    }`}>
                      Riesgo {finding.riesgo}
                    </span>
                    <span className="text-[10px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {finding.estado}
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    {finding.titulo}
                  </h3>
                </div>

                <div className="sm:text-right flex-shrink-0">
                  <span className="text-base font-bold text-amber-400 font-mono block">
                    {formatCurrency(finding.monto_observado, currency)}
                  </span>
                  <span className="text-[10px] text-slate-400">Monto Observado</span>
                </div>
              </div>

              {/* ISSAI 5 Elements breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-1">
                    1. Condición (Situación Observada)
                  </span>
                  <p className="text-slate-300 text-[11px] leading-relaxed line-clamp-3">
                    {finding.condicion}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block mb-1">
                    2. Criterio (Marco Legal & Leyes de RD)
                  </span>
                  <p className="text-slate-300 text-[11px] leading-relaxed line-clamp-3">
                    {finding.criterio}
                  </p>
                </div>
              </div>

              {/* Collapsible Elements: Causa, Efecto, Recomendación */}
              {isExpanded && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-2 border-t border-slate-800">
                  <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 block mb-1">
                      3. Causa (Falla Control)
                    </span>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {finding.causa}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400 block mb-1">
                      4. Efecto (Impacto Patrimonial)
                    </span>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {finding.efecto}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                      5. Recomendación Vinculante
                    </span>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {finding.recomendacion}
                    </p>
                  </div>
                </div>
              )}

              {/* Digital Evidence Attached & Blockchain Footprint */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-xs">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setExpandedFindingId(isExpanded ? null : finding.id)}
                    className="text-slate-400 hover:text-white flex items-center gap-1 font-medium text-[11px]"
                  >
                    <span>{isExpanded ? 'Ocultar Causa/Efecto' : 'Ver Detalle ISSAI Completo'}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                    <FileCheck className="w-3.5 h-3.5 text-blue-400" />
                    <span>{findingEvidences.length} Evidencias Criptográficas</span>
                  </div>

                  <div className="hidden sm:flex items-center gap-1.5 text-emerald-400 text-[11px] font-mono">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Bloque #{finding.bloque_numero}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {onOpenFindingEditor && (
                    <button
                      onClick={() => onOpenFindingEditor(finding)}
                      className="px-2.5 py-1.5 rounded-lg bg-indigo-900/40 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-700/50 text-[11px] font-semibold flex items-center gap-1"
                      title="Ver en pantalla, modificar, editar y ver carpeta de versiones"
                    >
                      <FolderArchive className="w-3.5 h-3.5 text-amber-300" />
                      <span>Editar & Versiones ({finding.version_actual || 'v1.0'})</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setSelectedFinding(finding);
                      setShowEvidenceUploadModal(true);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/40 text-[11px] font-semibold flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Cargar Soporte / Custodia</span>
                  </button>
                  <button
                    onClick={() => setSelectedFinding(finding)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold"
                  >
                    Ver Ledger
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Finding Generator Modal */}
      {showAIGeneratorModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">
                  Generador Asistido de Hallazgos ISSAI con Gemini AI
                </h3>
              </div>
              <button
                onClick={() => setShowAIGeneratorModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Auditoría Destino</label>
                  <select
                    value={aiAuditId}
                    onChange={(e) => setAiAuditId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    {audits.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.codigo} - {a.siglas}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Título Preliminar</label>
                  <input
                    type="text"
                    value={aiTitle}
                    onChange={(e) => setAiTitle(e.target.value)}
                    placeholder="Ej. Fraccionamiento de Compras de Equipos Informáticos"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Hechos Detectados / Observación en Campo (Lenguaje Natural)
                </label>
                <textarea
                  rows={3}
                  value={aiObservation}
                  onChange={(e) => setAiObservation(e.target.value)}
                  placeholder="Describe lo observado por los auditores (ej. Se detectaron 8 órdenes de compra por DOP 40 millones emitidas en la misma quincena al mismo proveedor sin pasar por licitación pública)..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleGenerateWithAI}
                  disabled={aiIsLoading}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold flex items-center gap-2 shadow-md transition-all disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{aiIsLoading ? 'Analizando con Gemini...' : 'Estructurar con IA Gemini'}</span>
                </button>
              </div>

              {/* Generated Components Editable Section */}
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span>Estructura Oficial ISSAI (Revisión & Edición)</span>
                </h4>

                <div>
                  <label className="block text-amber-400 font-semibold mb-1">1. Condición</label>
                  <textarea
                    rows={2}
                    value={draftCondicion}
                    onChange={(e) => setDraftCondicion(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-blue-400 font-semibold mb-1">2. Criterio (Leyes & Normas de RD)</label>
                  <textarea
                    rows={2}
                    value={draftCriterio}
                    onChange={(e) => setDraftCriterio(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-rose-400 font-semibold mb-1">3. Causa</label>
                    <textarea
                      rows={2}
                      value={draftCausa}
                      onChange={(e) => setDraftCausa(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-orange-400 font-semibold mb-1">4. Efecto</label>
                    <textarea
                      rows={2}
                      value={draftEfecto}
                      onChange={(e) => setDraftEfecto(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-emerald-400 font-semibold mb-1">5. Recomendación Vinculante</label>
                  <textarea
                    rows={2}
                    value={draftRecomendacion}
                    onChange={(e) => setDraftRecomendacion(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Nivel de Riesgo</label>
                    <select
                      value={draftRiesgo}
                      onChange={(e) => setDraftRiesgo(e.target.value as RiskLevel)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                    >
                      <option value="Crítico">Crítico</option>
                      <option value="Alto">Alto</option>
                      <option value="Medio">Medio</option>
                      <option value="Bajo">Bajo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Monto Observado Estimado (DOP)</label>
                    <input
                      type="number"
                      value={draftMonto}
                      onChange={(e) => setDraftMonto(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAIGeneratorModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveFinding}
                  disabled={!draftCondicion}
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-600/30 disabled:opacity-50"
                >
                  Registrar & Grabar en Hyperledger Fabric
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Digital Evidence Uploader Modal with Real Crypto Hashing */}
      {showEvidenceUploadModal && selectedFinding && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">
                  Custodia Digital de Evidencia ({selectedFinding.codigo})
                </h3>
              </div>
              <button
                onClick={() => setShowEvidenceUploadModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Categoría Documental</label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value as DigitalEvidence['categoria'])}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                >
                  <option value="Contrato">Contrato u Orden de Compra</option>
                  <option value="Comprobante de Pago">Comprobante de Pago / Libramiento</option>
                  <option value="Acta de Recepción">Acta de Recepción / Conforme</option>
                  <option value="Informe Pericial">Informe Pericial / Técnico</option>
                  <option value="Registro Contable">Registro Contable SIGEF</option>
                  <option value="Correspondencia">Correspondencia Oficial</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Seleccionar Documento (PDF, Word, Excel, Imagen, ZIP)
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-300 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
                />
              </div>

              {calculatedHashes && (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-900/50 space-y-2 font-mono text-[11px]">
                  <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Cálculo Criptográfico Exitoso (Web Crypto API)</span>
                  </div>
                  <div className="space-y-1 text-slate-300 break-all">
                    <div>
                      <span className="text-slate-500 block text-[10px]">HASH SHA-256:</span>
                      <span className="text-blue-300">{calculatedHashes.sha256}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">HASH SHA-512:</span>
                      <span className="text-amber-300">{calculatedHashes.sha512.substring(0, 64)}...</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">SELLO DE TIEMPO RFC 3161:</span>
                      <span className="text-slate-200">{new Date().toISOString()}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEvidenceUploadModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmEvidenceUpload}
                  disabled={!calculatedHashes || uploadProgress}
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-600/30 disabled:opacity-50"
                >
                  {uploadProgress ? 'Sellando en Blockchain...' : 'Sellar y Registrar Evidencia'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
