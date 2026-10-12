import React, { useState } from 'react';
import {
  Building2,
  FileText,
  Send,
  Sparkles,
  Paperclip,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  ChevronRight,
  Shield,
  FileCheck,
  X,
} from 'lucide-react';
import {
  AuditRecord,
  FindingRecord,
  AuditReply,
  DigitalEvidence,
  SupportedCurrency,
  SupportedLanguage,
} from '../types';
import { formatCurrency } from '../services/i18n';
import { requestAIAnalyzeReplica } from '../services/aiService';
import { blockchainService, computeSHA256 } from '../services/blockchain';

interface AuditedEntityPortalProps {
  audits: AuditRecord[];
  findings: FindingRecord[];
  replies: AuditReply[];
  onAddReply: (reply: AuditReply) => void;
  currency: SupportedCurrency;
  lang: SupportedLanguage;
}

export const AuditedEntityPortal: React.FC<AuditedEntityPortalProps> = ({
  audits,
  findings,
  replies,
  onAddReply,
  currency,
  lang,
}) => {
  const [selectedFinding, setSelectedFinding] = useState<FindingRecord | null>(findings[0] || null);
  const [replyText, setReplyText] = useState('');
  const [repName, setRepName] = useState('Lic. Franklin Rosario');
  const [repCargo, setRepCargo] = useState('Director Jurídico y Representante Legal');
  const [attachedFiles, setAttachedFiles] = useState<string[]>([
    'Decreto_Emergencia_Climatica_Provincias_Sur.pdf',
    'Actas_Entrega_Distritos_Educativos_02_y_05.pdf',
  ]);
  const [newFileName, setNewFileName] = useState('');

  // AI analysis preview
  const [aiAnalysis, setAiAnalysis] = useState<any | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const existingReply = replies.find((r) => r.hallazgo_id === selectedFinding?.id);

  const handleSimulateAI = async () => {
    if (!selectedFinding || !replyText) return;
    setIsAnalyzing(true);
    try {
      const res = await requestAIAnalyzeReplica({
        findingTitle: selectedFinding.titulo,
        findingCondition: selectedFinding.condicion,
        findingCriterion: selectedFinding.criterio,
        replicaText: replyText,
        evidenceNames: attachedFiles,
      });
      setAiAnalysis(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddAttachment = () => {
    if (newFileName.trim()) {
      setAttachedFiles([...attachedFiles, newFileName.trim()]);
      setNewFileName('');
    }
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFinding || !replyText) return;

    const audit = audits.find((a) => a.id === selectedFinding.auditoria_id);

    const payload = JSON.stringify({
      hallazgo: selectedFinding.codigo,
      entidad: audit?.entidad || 'Entidad Auditada',
      representante: repName,
      replica: replyText,
      evidencias: attachedFiles,
    });

    const { tx } = await blockchainService.commitTransaction(
      'RADICAR_REPLICA',
      repName,
      'ENTIDAD_AUDITADA',
      'ReplyChaincode:RegisterReply',
      `Descargo formal a ${selectedFinding.codigo}`,
      payload
    );

    const newReply: AuditReply = {
      id: 'rep-' + Date.now(),
      hallazgo_id: selectedFinding.id,
      entidad_nombre: audit?.entidad || 'Entidad Auditada',
      fecha_radicacion: new Date().toLocaleString('es-DO'),
      representante_legal: repName,
      cargo_representante: repCargo,
      texto_replica: replyText,
      evidencias_adjuntas: attachedFiles,
      dictamen_supervisor: 'Pendiente de Evaluación',
      tx_id: tx.tx_id,
      blockchain_hash: tx.payload_hash,
    };

    onAddReply(newReply);
    setSubmitSuccess(true);
    setTimeout(() => setSubmitSuccess(false), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold text-white">
              Portal de la Entidad Auditada • Gestión de Réplicas & Descargos
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Recepción formal de notificaciones de auditoría, presentación de descargos en plazo legal y radicación criptográfica inmutable.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-3 py-1.5 rounded-lg">
          <Shield className="w-4 h-4" />
          <span>Plazo Legal: 15 Días Hábiles (Ley 10-04)</span>
        </div>
      </div>

      {/* Two Column Layout: Findings selector & Reply form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: List of notified findings */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-800">
            Hallazgos Notificados a Subsanar
          </h3>

          <div className="space-y-2">
            {findings.map((f) => {
              const audit = audits.find((a) => a.id === f.auditoria_id);
              const isSelected = selectedFinding?.id === f.id;
              const hasReplied = replies.some((r) => r.hallazgo_id === f.id);

              return (
                <button
                  key={f.id}
                  onClick={() => {
                    setSelectedFinding(f);
                    const rep = replies.find((r) => r.hallazgo_id === f.id);
                    if (rep) {
                      setReplyText(rep.texto_replica);
                    } else {
                      setReplyText('');
                    }
                  }}
                  className={`w-full text-left p-3 rounded-xl border transition-all text-xs space-y-2 ${
                    isSelected
                      ? 'bg-blue-600/20 border-blue-500 text-white shadow-md'
                      : 'bg-slate-950/70 border-slate-800/80 text-slate-300 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-amber-400">{f.codigo}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      hasReplied
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}>
                      {hasReplied ? 'Réplica Radicada' : 'Pendiente Réplica'}
                    </span>
                  </div>

                  <h4 className="font-semibold text-white line-clamp-2">{f.titulo}</h4>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-900">
                    <span>{audit?.siglas || 'CCRD'}</span>
                    <span className="font-mono text-amber-400 font-bold">
                      {formatCurrency(f.monto_observado, currency)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column (2 Cols): Detail of finding & Formal Reply submission */}
        {selectedFinding ? (
          <div className="lg:col-span-2 space-y-5">
            {/* Finding Overview */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-400">
                      {selectedFinding.codigo}
                    </span>
                    <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-semibold">
                      Riesgo {selectedFinding.riesgo}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1">
                    {selectedFinding.titulo}
                  </h3>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="text-base font-bold text-amber-400 font-mono block">
                    {formatCurrency(selectedFinding.monto_observado, currency)}
                  </span>
                  <span className="text-[10px] text-slate-400">Observación Económica</span>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-2">
                <div>
                  <span className="text-amber-400 font-bold block text-[10px] uppercase">Condición Señalada por CCRD:</span>
                  <p className="text-slate-300 text-[11px] leading-relaxed">{selectedFinding.condicion}</p>
                </div>
                <div>
                  <span className="text-blue-400 font-bold block text-[10px] uppercase">Criterio Legal Vulnerado:</span>
                  <p className="text-slate-300 text-[11px] leading-relaxed">{selectedFinding.criterio}</p>
                </div>
              </div>
            </div>

            {/* Existing Reply Status (if any) */}
            {existingReply && (
              <div className="p-4 rounded-xl bg-slate-950 border border-blue-900/40 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Réplica Previa Registrada en Hyperledger Fabric
                  </span>
                  <span className="font-mono text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                    Dictamen: {existingReply.dictamen_supervisor}
                  </span>
                </div>
                <p className="text-slate-300 text-[11px] bg-slate-900 p-2.5 rounded border border-slate-800">
                  "{existingReply.texto_replica}"
                </p>
                {existingReply.fundamentacion_dictamen && (
                  <div className="p-2.5 rounded bg-blue-950/40 border border-blue-800 text-[11px] text-blue-200">
                    <strong>Dictamen del Supervisor CCRD:</strong> {existingReply.fundamentacion_dictamen}
                  </div>
                )}
              </div>
            )}

            {/* Formal Reply Form */}
            <form onSubmit={handleSubmitReply} className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <Send className="w-4 h-4 text-blue-400" />
                  <span>Radicación Formal de Réplica / Descargo Jurídico</span>
                </h4>
                <span className="text-[10px] font-mono text-slate-400">
                  Cadena Inmutable: peer0.contraloria.gob.do
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Representante Legal / Enlace</label>
                  <input
                    type="text"
                    required
                    value={repName}
                    onChange={(e) => setRepName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Cargo Institucional</label>
                  <input
                    type="text"
                    required
                    value={repCargo}
                    onChange={(e) => setRepCargo(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Fundamentación Técnica y Legal del Descargo (Texto de Réplica)
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Detalla los motivos jurídicos, decretos, justificaciones presupuestarias o circunstancias atenuantes..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Attachments Section */}
              <div className="space-y-2">
                <label className="block text-slate-300 font-semibold">
                  Documentos & Evidencias Adjuntas en Descargo
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nombre o descripción del documento soporte..."
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddAttachment}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center gap-1"
                  >
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>Adjuntar</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-2">
                  {attachedFiles.map((file, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-[11px] text-slate-300 font-mono"
                    >
                      <FileCheck className="w-3 h-3 text-emerald-400" />
                      <span>{file}</span>
                      <button
                        type="button"
                        onClick={() => setAttachedFiles(attachedFiles.filter((_, idx) => idx !== i))}
                        className="text-slate-500 hover:text-rose-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Pre-evaluation with AI Button */}
              <div className="p-3 rounded-lg bg-blue-950/30 border border-blue-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-[11px] text-slate-300">
                  <span className="font-bold text-amber-300 block">Pre-Evaluación Asistida con IA Gemini:</span>
                  Simula cómo evaluará el motor normativo tu réplica antes de radicarla definitivamente.
                </div>
                <button
                  type="button"
                  onClick={handleSimulateAI}
                  disabled={isAnalyzing || !replyText}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-1.5 flex-shrink-0 disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isAnalyzing ? 'Evaluando...' : 'Evaluar Réplica con IA'}</span>
                </button>
              </div>

              {/* AI Pre-evaluation result */}
              {aiAnalysis && (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-900/60 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-400 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" />
                      Pronóstico de Evaluación del Auditor Senior
                    </span>
                    <span className={`font-bold px-2 py-0.5 rounded ${
                      aiAnalysis.dictamen === 'Aceptada'
                        ? 'bg-emerald-950 text-emerald-300'
                        : aiAnalysis.dictamen === 'Parcialmente aceptada'
                        ? 'bg-amber-950 text-amber-300'
                        : 'bg-rose-950 text-rose-300'
                    }`}>
                      {aiAnalysis.dictamen}
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px]">{aiAnalysis.fundamentacion}</p>
                  <div className="text-[10px] text-slate-400 flex justify-between pt-1 border-t border-slate-900">
                    <span>Riesgo Residual: <strong>{aiAnalysis.riesgoResidual}</strong></span>
                    <span>Acción recomendada: <strong>{aiAnalysis.accionRequerida}</strong></span>
                  </div>
                </div>
              )}

              {submitSuccess && (
                <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Réplica formal radicada exitosamente y registrada con Tx inmutable en Hyperledger Fabric.</span>
                </div>
              )}

              <div className="flex justify-end pt-2 border-t border-slate-800">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-blue-600/30"
                >
                  <Send className="w-4 h-4" />
                  <span>Radicar Réplica en Ledger Blockchain</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="lg:col-span-2 flex items-center justify-center p-12 text-slate-500 text-xs bg-slate-900 rounded-xl border border-slate-800">
            Selecciona un hallazgo notificado para radicar descargos.
          </div>
        )}

      </div>
    </div>
  );
};
