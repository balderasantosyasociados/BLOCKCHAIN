import React, { useState } from 'react';
import {
  UserCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  Shield,
  Layers,
  Key,
  Award,
  Sparkles,
  Clock,
  Send,
  Building,
  RefreshCw,
  Scale,
  DollarSign,
  Check,
  AlertTriangle,
  ChevronRight,
  HelpCircle,
  FileCheck,
} from 'lucide-react';
import {
  AuditRecord,
  FindingRecord,
  AuditReply,
  DigitalSignatureInfo,
  SupportedCurrency,
  SupportedLanguage,
} from '../types';
import { formatCurrency } from '../services/i18n';
import { blockchainService } from '../services/blockchain';
import { requestAIAnalyzeReplica, AnalyzeReplicaResult } from '../services/aiService';

interface SupervisorPortalProps {
  audits: AuditRecord[];
  findings: FindingRecord[];
  replies: AuditReply[];
  onUpdateAuditFirmas: (auditId: string, firmas: AuditRecord['firmas']) => void;
  onUpdateReplyVerdict: (replyId: string, verdict: 'Aceptada' | 'Parcialmente aceptada' | 'No aceptada', fund: string) => void;
  currency: SupportedCurrency;
  lang: SupportedLanguage;
}

export const SupervisorPortal: React.FC<SupervisorPortalProps> = ({
  audits,
  findings,
  replies,
  onUpdateAuditFirmas,
  onUpdateReplyVerdict,
  currency,
  lang,
}) => {
  const [selectedAuditId, setSelectedAuditId] = useState<string>(audits[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'firmas' | 'replicas'>('replicas');
  const [signatureSuccess, setSignatureSuccess] = useState<string | null>(null);

  // Verdict state for reply
  const [selectedReply, setSelectedReply] = useState<AuditReply | null>(replies[0] || null);
  const [verdictType, setVerdictType] = useState<'Aceptada' | 'Parcialmente aceptada' | 'No aceptada'>('Parcialmente aceptada');
  const [verdictFund, setVerdictFund] = useState(
    'Conforme a las evidencias presentadas y el análisis normativo de la Ley 340-06, se acoge parcialmente la justificación técnica ajustando el monto observado.'
  );

  // Gemini AI Analysis state
  const [aiIsAnalyzing, setAiIsAnalyzing] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<AnalyzeReplicaResult | null>(null);
  const [aiAutoApplied, setAiAutoApplied] = useState(false);

  const currentAudit = audits.find((a) => a.id === selectedAuditId);
  const linkedFinding = findings.find((f) => f.id === selectedReply?.hallazgo_id);

  // Trigger Gemini AI comparative analysis
  const handleRunAIAnalysis = async () => {
    if (!selectedReply) return;
    setAiIsAnalyzing(true);
    setAiAutoApplied(false);

    try {
      const result = await requestAIAnalyzeReplica({
        findingTitle: linkedFinding?.titulo || 'Hallazgo de Auditoría',
        findingCondition: linkedFinding?.condicion || 'Condición observada',
        findingCriterion: linkedFinding?.criterio || 'Criterio legal',
        findingCause: linkedFinding?.causa,
        findingEffect: linkedFinding?.efecto,
        findingRecommendation: linkedFinding?.recomendacion,
        observedAmount: linkedFinding?.monto_observado,
        replicaText: selectedReply.texto_replica,
        evidenceNames: selectedReply.evidencias_adjuntas,
        entityName: selectedReply.entidad_nombre,
      });

      setAiAnalysisResult(result);

      // Automatically categorize and populate the supervisor's verdict
      setVerdictType(result.dictamen);
      setVerdictFund(result.fundamentacion);
      setAiAutoApplied(true);
    } catch (err) {
      console.error('Error during AI reply analysis:', err);
    } finally {
      setAiIsAnalyzing(false);
    }
  };

  const handleSignTier = async (tier: 'auditor' | 'supervisor' | 'director' | 'pleno') => {
    if (!currentAudit) return;

    const tierTitles: Record<string, { cargo: string; name: string }> = {
      auditor: { cargo: 'Auditor Gubernamental Principal', name: 'Lic. Pedro Baldera' },
      supervisor: { cargo: 'Directora de Control de Calidad', name: 'Dra. Altagracia Peña Morales' },
      director: { cargo: 'Director General de Auditoría', name: 'Lic. José Ramírez' },
      pleno: { cargo: 'Miembro del Pleno CCRD', name: 'Mag. Ramón Henríquez' },
    };

    const signer = tierTitles[tier];
    const newFirmas = { ...currentAudit.firmas, [tier]: true };

    const payload = JSON.stringify({
      auditoria: currentAudit.codigo,
      firmante: signer.name,
      cargo: signer.cargo,
      tier,
      algoritmo: 'RSA-4096 / SHA-256',
      ac_raiz: 'INDOTEL-PKI-RD-X509',
    });

    await blockchainService.commitTransaction(
      'FIRMAR_X509',
      signer.name,
      'SUPERVISOR_CCRD',
      'AuditChaincode:SignDocument',
      `Firma Digital X.509 Nivel ${tier.toUpperCase()} para ${currentAudit.codigo}`,
      payload
    );

    onUpdateAuditFirmas(currentAudit.id, newFirmas);
    setSignatureSuccess(`Firma de ${signer.name} estampada con éxito en Hyperledger Fabric.`);
    setTimeout(() => setSignatureSuccess(null), 4000);
  };

  const handleApplyVerdict = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReply) return;

    await blockchainService.commitTransaction(
      'DICTAMINAR_REPLICA',
      'Dra. Altagracia Peña Morales',
      'SUPERVISOR_CCRD',
      'ReplyChaincode:ApproveReply',
      `Dictamen ${verdictType} para réplica ${selectedReply.id}`,
      JSON.stringify({ verdict: verdictType, fund: verdictFund })
    );

    onUpdateReplyVerdict(selectedReply.id, verdictType, verdictFund);
    setSignatureSuccess(`Dictamen de réplica grabado exitosamente en el Ledger Blockchain con firma de supervisor.`);
    setTimeout(() => setSignatureSuccess(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-white">
              Portal Supervisor & Pleno CCRD • Control de Calidad y Firmas X.509
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Supervisión técnica, dictamen automatizado de réplicas con IA Gemini y flujo escalonado de 4 firmas digitales PKI INDOTEL.
          </p>
        </div>

        {/* Tab switch between PKI Signatures and Replies Quality */}
        <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('replicas')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'replicas'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Dictaminar Réplicas con IA ({replies.length})
          </button>
          <button
            onClick={() => setActiveTab('firmas')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'firmas'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Firmas Digitales PKI
          </button>
        </div>
      </div>

      {signatureSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2 shadow-lg animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{signatureSuccess}</span>
        </div>
      )}

      {/* Main Tab 1: PKI Digital Signatures 4-Tier */}
      {activeTab === 'firmas' && (
        <div className="space-y-6">
          {/* Audit Selector */}
          <div className="flex items-center gap-3 bg-slate-900 p-3.5 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400 font-semibold whitespace-nowrap">Seleccionar Expediente:</span>
            <select
              value={selectedAuditId}
              onChange={(e) => setSelectedAuditId(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-white font-medium flex-1 focus:outline-none focus:border-blue-500"
            >
              {audits.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.codigo} - {a.nombre} ({a.siglas})
                </option>
              ))}
            </select>
          </div>

          {currentAudit && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <span className="font-mono text-xs font-bold text-blue-400">{currentAudit.codigo}</span>
                  <h3 className="text-base font-bold text-white mt-0.5">{currentAudit.nombre}</h3>
                  <span className="text-xs text-slate-400">{currentAudit.entidad} • {currentAudit.periodo_auditado}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Monto Observado</span>
                  <span className="font-mono text-base font-bold text-amber-400">
                    {formatCurrency(currentAudit.monto_observado, currency)}
                  </span>
                </div>
              </div>

              {/* 4 Tiers of Digital Signature Cards */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Cadena Institucional de Firma Electrónica Cualificada (Ley 126-02)</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Tier 1: Auditor Encargado */}
                  <div className={`p-4 rounded-xl border transition-all text-xs space-y-3 ${
                    currentAudit.firmas.auditor
                      ? 'bg-slate-950/90 border-emerald-800/80'
                      : 'bg-slate-950/50 border-slate-800'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">1. Auditor Gubernamental Encargado</span>
                      {currentAudit.firmas.auditor ? (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Firmado
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                          Pendiente
                        </span>
                      )}
                    </div>
                    <div className="space-y-1 text-slate-400 text-[11px]">
                      <div>Firmante: <strong className="text-white">{currentAudit.auditor_lider}</strong></div>
                      <div>Certificado: <span className="font-mono text-blue-300">DO-PKI-CCRD-AUD-2025</span></div>
                      <div>Algoritmo: <span className="font-mono text-slate-300">RSA-4096 / SHA-256</span></div>
                    </div>
                    {!currentAudit.firmas.auditor && (
                      <button
                        onClick={() => handleSignTier('auditor')}
                        className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md"
                      >
                        Estampar Firma de Auditor
                      </button>
                    )}
                  </div>

                  {/* Tier 2: Supervisor de Control de Calidad */}
                  <div className={`p-4 rounded-xl border transition-all text-xs space-y-3 ${
                    currentAudit.firmas.supervisor
                      ? 'bg-slate-950/90 border-emerald-800/80'
                      : 'bg-slate-950/50 border-slate-800'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">2. Supervisor de Control de Calidad</span>
                      {currentAudit.firmas.supervisor ? (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Firmado
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                          Pendiente
                        </span>
                      )}
                    </div>
                    <div className="space-y-1 text-slate-400 text-[11px]">
                      <div>Firmante: <strong className="text-white">{currentAudit.supervisor}</strong></div>
                      <div>Certificado: <span className="font-mono text-blue-300">DO-PKI-CCRD-SUP-2025</span></div>
                      <div>Validación ISSAI: <span className="font-mono text-emerald-400">ISSAI 100/200 OK</span></div>
                    </div>
                    {!currentAudit.firmas.supervisor && (
                      <button
                        onClick={() => handleSignTier('supervisor')}
                        disabled={!currentAudit.firmas.auditor}
                        className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md disabled:opacity-40"
                      >
                        Estampar Firma de Control de Calidad
                      </button>
                    )}
                  </div>

                  {/* Tier 3: Director de Auditoría */}
                  <div className={`p-4 rounded-xl border transition-all text-xs space-y-3 ${
                    currentAudit.firmas.director
                      ? 'bg-slate-950/90 border-emerald-800/80'
                      : 'bg-slate-950/50 border-slate-800'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">3. Director General de Auditoría</span>
                      {currentAudit.firmas.director ? (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Firmado
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                          Pendiente
                        </span>
                      )}
                    </div>
                    <div className="space-y-1 text-slate-400 text-[11px]">
                      <div>Firmante: <strong className="text-white">Lic. José Ramírez</strong></div>
                      <div>Certificado: <span className="font-mono text-blue-300">DO-PKI-CCRD-DIR-2025</span></div>
                      <div>Visto Bueno: <span className="font-mono text-slate-300">Conforme a Ley 10-04</span></div>
                    </div>
                    {!currentAudit.firmas.director && (
                      <button
                        onClick={() => handleSignTier('director')}
                        disabled={!currentAudit.firmas.supervisor}
                        className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md disabled:opacity-40"
                      >
                        Estampar Firma de Dirección
                      </button>
                    )}
                  </div>

                  {/* Tier 4: Miembro del Pleno CCRD */}
                  <div className={`p-4 rounded-xl border transition-all text-xs space-y-3 ${
                    currentAudit.firmas.pleno
                      ? 'bg-slate-950/90 border-emerald-800/80'
                      : 'bg-slate-950/50 border-slate-800'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">4. Miembro del Pleno CCRD</span>
                      {currentAudit.firmas.pleno ? (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Aprobado Pleno
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                          Pendiente
                        </span>
                      )}
                    </div>
                    <div className="space-y-1 text-slate-400 text-[11px]">
                      <div>Firmante: <strong className="text-white">Mag. Ramón Henríquez</strong></div>
                      <div>Certificado: <span className="font-mono text-blue-300">DO-PKI-CCRD-PLENO-2025</span></div>
                      <div>Efecto: <span className="font-mono text-amber-400">Publicación Oficial Definitiva</span></div>
                    </div>
                    {!currentAudit.firmas.pleno && (
                      <button
                        onClick={() => handleSignTier('pleno')}
                        disabled={!currentAudit.firmas.director}
                        className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 disabled:opacity-40"
                      >
                        Aprobar por el Pleno & Publicar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Tab 2: Replies Verdict with Integrated Gemini AI Analysis */}
      {activeTab === 'replicas' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Replies List */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Réplicas Notificadas ({replies.length})
              </h3>
              <span className="text-[10px] font-mono text-amber-400 bg-amber-950 px-1.5 py-0.5 rounded">
                Plazo Ley 10-04
              </span>
            </div>

            <div className="space-y-2">
              {replies.map((r) => {
                const isSelected = selectedReply?.id === r.id;
                const finding = findings.find((f) => f.id === r.hallazgo_id);

                return (
                  <button
                    key={r.id}
                    onClick={() => {
                      setSelectedReply(r);
                      setAiAnalysisResult(null);
                      setAiAutoApplied(false);
                      if (r.dictamen_supervisor !== 'Pendiente de Evaluación') {
                        setVerdictType(r.dictamen_supervisor as any);
                      }
                      if (r.fundamentacion_dictamen) {
                        setVerdictFund(r.fundamentacion_dictamen);
                      }
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition-all text-xs space-y-2 ${
                      isSelected
                        ? 'bg-blue-600/20 border-blue-500 text-white shadow-md'
                        : 'bg-slate-950/70 border-slate-800/80 text-slate-300 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{r.entidad_nombre}</span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                        r.dictamen_supervisor === 'Aceptada'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : r.dictamen_supervisor === 'Parcialmente aceptada'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}>
                        {r.dictamen_supervisor}
                      </span>
                    </div>

                    <div className="text-[11px] text-blue-300 font-mono font-semibold">
                      {finding?.codigo || 'HAL-REF'}
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-2 italic">"{r.texto_replica}"</p>
                    
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-900">
                      <span>{r.fecha_radicacion.split(' ')[0]}</span>
                      <span className="font-mono text-emerald-400">
                        {r.evidencias_adjuntas.length} evidencias
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right (2 Cols): Comprehensive Comparison & Gemini AI Analysis Module */}
          {selectedReply && (
            <div className="lg:col-span-2 space-y-5">
              
              {/* Card 1: Comparison between Finding vs Entity's Reply */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Cotejo Probatorio de Expediente
                    </span>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Scale className="w-5 h-5 text-amber-400" />
                      <span>{selectedReply.entidad_nombre} • {linkedFinding?.codigo || 'HAL-01'}</span>
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded border border-emerald-800">
                    Ledger Tx: {selectedReply.tx_id.substring(0, 16)}...
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {/* Left Box: Original Finding Criteria */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-900 pb-1.5">
                      <span className="font-bold text-amber-400 uppercase tracking-wider text-[10px] flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" />
                        <span>1. Hallazgo de Auditoría CCRD</span>
                      </span>
                      <span className="font-mono font-bold text-amber-400 text-[11px]">
                        {linkedFinding ? formatCurrency(linkedFinding.monto_observado, currency) : ''}
                      </span>
                    </div>
                    <div className="space-y-1.5 text-slate-300">
                      <div>
                        <strong className="text-white block text-[11px]">{linkedFinding?.titulo}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">CONDICIÓN OBSERVADA:</span>
                        <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-3">
                          {linkedFinding?.condicion}
                        </p>
                      </div>
                      <div className="pt-1 border-t border-slate-900">
                        <span className="text-blue-400 block text-[10px] font-bold">CRITERIO LEGAL VULNERADO:</span>
                        <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-3">
                          {linkedFinding?.criterio}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right Box: Entity's Reply & Evidences */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-blue-900/40 space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-900 pb-1.5">
                      <span className="font-bold text-blue-400 uppercase tracking-wider text-[10px] flex items-center gap-1">
                        <Building className="w-3.5 h-3.5" />
                        <span>2. Réplica & Descargo Institucional</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {selectedReply.fecha_radicacion.split(' ')[0]}
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="text-[11px] text-slate-400">
                        Radicado por: <strong className="text-white">{selectedReply.representante_legal}</strong> ({selectedReply.cargo_representante})
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">ALEGATOS DEL DESCARGO:</span>
                        <p className="text-[11px] text-slate-200 leading-relaxed italic bg-slate-900/70 p-2 rounded border border-slate-800">
                          "{selectedReply.texto_replica}"
                        </p>
                      </div>
                      <div className="pt-1 border-t border-slate-900">
                        <span className="text-emerald-400 block text-[10px] font-bold">EVIDENCIAS DIGITALES ADJUNTAS:</span>
                        <div className="space-y-0.5 mt-1">
                          {selectedReply.evidencias_adjuntas.map((ev, i) => (
                            <div key={i} className="flex items-center gap-1.5 text-[10px] text-slate-300 font-mono">
                              <FileCheck className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                              <span className="truncate">{ev}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Interactive Gemini AI Analysis Engine */}
              <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-blue-800/60 rounded-xl p-5 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 font-black shadow-md">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>Motor de Análisis Normativo Gemini AI</span>
                        <span className="text-[10px] font-mono text-amber-300 bg-amber-950/70 border border-amber-800/60 px-2 py-0.5 rounded">
                          gemini-3.8-flash • Normas ISSAI
                        </span>
                      </h4>
                      <p className="text-xs text-slate-400">
                        Compara la réplica contra la Ley 10-04, Ley 340-06 y estándares internacionales, clasificando automáticamente el veredicto.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleRunAIAnalysis}
                    disabled={aiIsAnalyzing}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/25 disabled:opacity-50 flex-shrink-0"
                  >
                    <Sparkles className={`w-4 h-4 ${aiIsAnalyzing ? 'animate-spin' : ''}`} />
                    <span>{aiIsAnalyzing ? 'Analizando Réplica con Gemini...' : 'Analizar Réplica con Gemini AI'}</span>
                  </button>
                </div>

                {/* AI Analysis Result Showcase */}
                {aiAnalysisResult && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    {/* Verdict Banner */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Categorization Box */}
                      <div className={`p-4 rounded-xl border flex flex-col justify-between ${
                        aiAnalysisResult.dictamen === 'Aceptada'
                          ? 'bg-emerald-950/70 border-emerald-700 text-emerald-200'
                          : aiAnalysisResult.dictamen === 'Parcialmente aceptada'
                          ? 'bg-amber-950/70 border-amber-700 text-amber-200'
                          : 'bg-rose-950/70 border-rose-700 text-rose-200'
                      }`}>
                        <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">
                          Categorización Automática
                        </span>
                        <div className="text-lg font-black mt-1 flex items-center gap-2">
                          {aiAnalysisResult.dictamen === 'Aceptada' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                          {aiAnalysisResult.dictamen === 'Parcialmente aceptada' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
                          {aiAnalysisResult.dictamen === 'No aceptada' && <XCircle className="w-5 h-5 text-rose-400" />}
                          <span>{aiAnalysisResult.dictamen}</span>
                        </div>
                        <span className="text-[10px] mt-2 opacity-90">
                          Aplicado automáticamente al dictamen del supervisor
                        </span>
                      </div>

                      {/* Residual Risk */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                          Riesgo Residual del Caso
                        </span>
                        <div className="text-base font-bold text-white mt-1 flex items-center gap-1.5">
                          <Shield className={`w-4 h-4 ${
                            aiAnalysisResult.riesgoResidual === 'Mitigado' ? 'text-emerald-400' :
                            aiAnalysisResult.riesgoResidual === 'Moderado' ? 'text-amber-400' : 'text-rose-400'
                          }`} />
                          <span>Riesgo {aiAnalysisResult.riesgoResidual}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 mt-2">
                          Evaluación de impacto financiero remanente
                        </span>
                      </div>

                      {/* Monetary Adjustment */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                          Ajuste Cuantitativo Sugerido
                        </span>
                        <div className="text-xs font-bold text-amber-400 mt-1 line-clamp-2">
                          {aiAnalysisResult.ajusteMontoObservado}
                        </div>
                        <span className="text-[10px] text-slate-500 mt-2">
                          Acción: {aiAnalysisResult.accionRequerida}
                        </span>
                      </div>
                    </div>

                    {/* Criteria Evaluation Checklist */}
                    {aiAnalysisResult.criteriosEvaluados && aiAnalysisResult.criteriosEvaluados.length > 0 && (
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                        <span className="text-xs font-bold text-white flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Cotejo de Criterios & Suficiencia Probatoria (Punto por Punto)</span>
                        </span>
                        <div className="space-y-2">
                          {aiAnalysisResult.criteriosEvaluados.map((item, idx) => (
                            <div
                              key={idx}
                              className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-start justify-between gap-3 text-xs"
                            >
                              <div className="space-y-0.5">
                                <span className="font-semibold text-slate-200 block">{item.criterio}</span>
                                <span className="text-[11px] text-slate-400 block">{item.observacion}</span>
                              </div>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 flex-shrink-0 ${
                                item.cumple
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                  : 'bg-rose-950 text-rose-300 border border-rose-800'
                              }`}>
                                {item.cumple ? <Check className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                {item.cumple ? 'Acreditado' : 'No desvirtuado'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Adjusted Recommendation */}
                    {aiAnalysisResult.recomendacionAjustada && (
                      <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-900/60 text-xs text-slate-300">
                        <strong className="text-blue-300 block mb-1">
                          Recomendación Ajustada para el Informe Definitivo (Propuesta por IA):
                        </strong>
                        <p className="text-[11px] leading-relaxed text-slate-200">
                          {aiAnalysisResult.recomendacionAjustada}
                        </p>
                      </div>
                    )}

                    {aiAutoApplied && (
                      <div className="p-3 rounded-lg bg-emerald-950/50 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                        <span>
                          La decisión "{aiAnalysisResult.dictamen}" y la fundamentación jurídica han sido cargadas automáticamente en el formulario inferior para su revisión y firma.
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Card 3: Supervisor Formal Verdict & Blockchain Commit */}
              <form
                onSubmit={handleApplyVerdict}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4 text-xs"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-amber-400" />
                    <span>Resolución Definitiva del Supervisor de Control de Calidad</span>
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400">
                    Firmante: Dra. Altagracia Peña Morales
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-slate-300 font-semibold">
                      Decisión / Dictamen Técnico Vinculante:
                    </label>
                    {aiAnalysisResult && (
                      <span className="text-[10px] text-amber-400 font-mono flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Sugerido por IA: <strong>{aiAnalysisResult.dictamen}</strong>
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {(['Aceptada', 'Parcialmente aceptada', 'No aceptada'] as const).map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setVerdictType(v)}
                        className={`py-2.5 px-3 rounded-xl font-bold text-xs border transition-all flex items-center justify-center gap-1.5 ${
                          verdictType === v
                            ? v === 'Aceptada'
                              ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/30 ring-2 ring-emerald-400/50'
                              : v === 'Parcialmente aceptada'
                              ? 'bg-amber-600 text-white border-amber-500 shadow-md shadow-amber-600/30 ring-2 ring-amber-400/50'
                              : 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-600/30 ring-2 ring-rose-400/50'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                        {verdictType === v && <Check className="w-3.5 h-3.5" />}
                        <span>{v}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-300 font-semibold">
                      Fundamentación Técnica y Jurídica del Dictamen (Motivación Legal):
                    </label>
                    <span className="text-[10px] text-slate-500">Editable antes de grabar</span>
                  </div>
                  <textarea
                    rows={4}
                    required
                    value={verdictFund}
                    onChange={(e) => setVerdictFund(e.target.value)}
                    placeholder="Escribe la motivación jurídica o utiliza la generada automáticamente por Gemini AI..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 font-sans text-xs leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <div className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                    <Layers className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Inmutable en Hyperledger Fabric (ReplyChaincode)</span>
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all"
                  >
                    <Send className="w-4 h-4" />
                    <span>Grabar Dictamen en Ledger Blockchain</span>
                  </button>
                </div>
              </form>

            </div>
          )}
        </div>
      )}
    </div>
  );
};
