import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  FileText,
  ShieldAlert,
  Layers,
  ArrowUpRight,
  ExternalLink,
  Sparkles,
  Building,
  Filter,
  Download,
  Clock,
} from 'lucide-react';
import { AuditRecord, FindingRecord, SupportedCurrency, SupportedLanguage } from '../types';
import { formatCurrency } from '../services/i18n';

interface DashboardViewProps {
  audits: AuditRecord[];
  findings: FindingRecord[];
  currency: SupportedCurrency;
  lang: SupportedLanguage;
  onNavigateTab: (tab: string) => void;
  onSelectAudit: (audit: AuditRecord) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  audits,
  findings,
  currency,
  lang,
  onNavigateTab,
  onSelectAudit,
}) => {
  const totalExamined = audits.reduce((acc, a) => acc + a.monto_examinado, 0);
  const totalObserved = audits.reduce((acc, a) => acc + a.monto_observado, 0);
  const totalRecovered = audits.reduce((acc, a) => acc + a.monto_recuperado, 0);
  const criticalFindings = findings.filter((f) => f.riesgo === 'Crítico');
  const avgCompliance = Math.round(
    audits.reduce((acc, a) => acc + a.cumplimiento_pct, 0) / (audits.length || 1)
  );

  return (
    <div className="space-y-6">
      {/* Top Hero Banner with Institutional Context */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border border-blue-900/50 p-6 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-900/50 border border-blue-700/60 text-xs font-semibold text-blue-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Piloto Nacional Blockchain Hyperledger Fabric & IA Gemini</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Centro de Mando & Control Fiscalizador CCRD
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Monitoreo en tiempo real de fondos públicos, custodia digital de evidencias y expedientes electrónicos inmutables bajo estándares internacionales ISSAI / INTOSAI y Ley 10-04.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onNavigateTab('findings')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-amber-500/20"
            >
              <Sparkles className="w-4 h-4" />
              <span>Redactar Hallazgo con IA</span>
            </button>
            <button
              onClick={() => onNavigateTab('audits')}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20"
            >
              <FileText className="w-4 h-4" />
              <span>Gestionar Auditorías</span>
            </button>
            <button
              onClick={() => onNavigateTab('blockchain')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center gap-2 transition-all"
            >
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Explorar Nodos HLF</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Active Audits */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg hover:border-blue-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Auditorías en Curso</span>
            <div className="p-2 rounded-lg bg-blue-950/80 text-blue-400 border border-blue-800/40">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{audits.length}</span>
            <span className="text-xs text-blue-400 font-medium">5 Sectores del Estado</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Examinado: {formatCurrency(totalExamined, currency)}</span>
          </div>
        </div>

        {/* KPI 2: Observed Amount */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Monto Observado</span>
            <div className="p-2 rounded-lg bg-amber-950/80 text-amber-400 border border-amber-800/40">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-amber-400">
              {formatCurrency(totalObserved, currency)}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>En 3 procesos de réplica</span>
            <span className="text-amber-400 font-medium">{( (totalObserved / totalExamined) * 100 ).toFixed(1)}% examinado</span>
          </div>
        </div>

        {/* KPI 3: Recovered Amount */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Monto Aclarado / Recuperado</span>
            <div className="p-2 rounded-lg bg-emerald-950/80 text-emerald-400 border border-emerald-800/40">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-emerald-400">
              {formatCurrency(totalRecovered, currency)}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Con descargo certificado</span>
            <span className="text-emerald-400 font-medium">{( (totalRecovered / totalObserved) * 100 ).toFixed(1)}% recuperado</span>
          </div>
        </div>

        {/* KPI 4: Compliance & Critical Findings */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg hover:border-rose-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Hallazgos & Recomendaciones</span>
            <div className="p-2 rounded-lg bg-rose-950/80 text-rose-400 border border-rose-800/40">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{findings.length}</span>
            <span className="text-xs font-bold text-rose-400 bg-rose-950/60 border border-rose-800/60 px-1.5 py-0.5 rounded">
              {criticalFindings.length} Críticos
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Avance Recomendaciones</span>
            <span className="text-blue-400 font-bold">{avgCompliance}%</span>
          </div>
        </div>
      </div>

      {/* Automated Irregularity Alerts Banner (Auditoría Continua) */}
      <div className="bg-gradient-to-r from-rose-950/60 via-slate-900 to-slate-900 border border-rose-800/60 rounded-xl p-4 sm:p-5 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-rose-400 animate-pulse" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Alertas Automáticas de Irregularidad Financiera & Cumplimiento Normativo (Motor IA)
            </h3>
          </div>
          <span className="text-[11px] text-rose-300 font-mono bg-rose-950 px-2 py-0.5 rounded border border-rose-800">
            3 Alertas Prioritarias
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-slate-900/80 border border-rose-900/40 hover:border-rose-600/60 transition-colors">
            <div className="flex items-center justify-between text-xs font-semibold text-rose-400">
              <span>MINERD • Compras Menores</span>
              <span className="text-[10px] font-mono bg-rose-950 px-1.5 py-0.5 rounded">Ley 340-06</span>
            </div>
            <p className="text-xs text-slate-300 mt-1.5">
              Patrón detectado: 12 órdenes consecutivas a un mismo proveedor en 35 días por DOP 78.5M. Probable fraccionamiento para eludir licitación pública.
            </p>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
              <span className="text-amber-400 font-semibold">Monto: {formatCurrency(78500000, currency)}</span>
              <button
                onClick={() => onNavigateTab('findings')}
                className="text-blue-400 hover:text-blue-300 flex items-center gap-0.5 font-medium"
              >
                Ver Hallazgo <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/80 border border-amber-900/40 hover:border-amber-600/60 transition-colors">
            <div className="flex items-center justify-between text-xs font-semibold text-amber-400">
              <span>MOPC • Pavimentación Norte</span>
              <span className="text-[10px] font-mono bg-amber-950 px-1.5 py-0.5 rounded">Forense / Obras</span>
            </div>
            <p className="text-xs text-slate-300 mt-1.5">
              Sobreprecio unitario del 24% detectado en asfalto AC-30 vs tarifas oficiales del Catálogo DGCP. Discrepancia en ensayos de laboratorio.
            </p>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
              <span className="text-amber-400 font-semibold">Monto: {formatCurrency(312000000, currency)}</span>
              <button
                onClick={() => onNavigateTab('audits')}
                className="text-blue-400 hover:text-blue-300 flex items-center gap-0.5 font-medium"
              >
                Ver Expediente <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/80 border border-blue-900/40 hover:border-blue-600/60 transition-colors">
            <div className="flex items-center justify-between text-xs font-semibold text-blue-400">
              <span>SIGEF • Desembolsos Sin Acta</span>
              <span className="text-[10px] font-mono bg-blue-950 px-1.5 py-0.5 rounded">NOBACI / SIGEF</span>
            </div>
            <p className="text-xs text-slate-300 mt-1.5">
              3 libramientos de pago por DOP 42M carecen de la firma digital X.509 de inspección técnica previa. Alerta de control preventivo.
            </p>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
              <span className="text-amber-400 font-semibold">Monto: {formatCurrency(42000000, currency)}</span>
              <button
                onClick={() => onNavigateTab('findings')}
                className="text-blue-400 hover:text-blue-300 flex items-center gap-0.5 font-medium"
              >
                Ver Hallazgo <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Active Audits Table & Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols): Audits List with Blockchain Status */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Auditorías Gubernamentales en Monitoreo Inmutable</span>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded">
                  ISSAI 100/200/400
                </span>
              </h3>
              <p className="text-xs text-slate-400">Expedientes con firma criptográfica y sello de tiempo RFC 3161</p>
            </div>
            <button
              onClick={() => onNavigateTab('audits')}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              <span>Ver todas</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {audits.map((audit) => (
              <div
                key={audit.id}
                onClick={() => onSelectAudit(audit)}
                className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/90 hover:border-blue-500/50 hover:bg-slate-800/40 cursor-pointer transition-all space-y-2 group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-400 group-hover:text-blue-300">
                        {audit.codigo}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
                        {audit.siglas}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        audit.estado === 'Informe Definitivo Publicado'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : audit.estado === 'En Réplicas'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-blue-950 text-blue-300 border border-blue-800'
                      }`}>
                        {audit.estado}
                      </span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-semibold text-white mt-1 group-hover:text-amber-200 transition-colors line-clamp-1">
                      {audit.nombre}
                    </h4>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="text-xs font-bold text-amber-400 block font-mono">
                      {formatCurrency(audit.monto_observado, currency)}
                    </span>
                    <span className="text-[10px] text-slate-400">Observado</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-900">
                  <div className="flex items-center gap-3">
                    <span>Líder: <strong className="text-slate-300">{audit.auditor_lider}</strong></span>
                    <span>•</span>
                    <span className="font-mono text-[10px] text-slate-500">Tx: {audit.blockchain_tx_id.substring(0, 14)}...</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Cumplimiento:</span>
                    <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-1.5 rounded-full"
                        style={{ width: `${audit.cumplimiento_pct}%` }}
                      />
                    </div>
                    <span className="font-bold text-white text-[10px]">{audit.cumplimiento_pct}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Hyperledger Peer Network Health & Multi-institutional Status */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Red Hyperledger Fabric RD</span>
            </h3>
            <p className="text-xs text-slate-400">Consenso de Nodos Gubernamentales</p>
          </div>

          <div className="space-y-2.5">
            {[
              { peer: 'peer0.ccrd.gob.do', rol: 'Cámara de Cuentas (Anchor)', ping: '12ms', status: 'ONLINE' },
              { peer: 'peer0.contraloria.gob.do', rol: 'Contraloría General', ping: '18ms', status: 'ONLINE' },
              { peer: 'peer0.dgcp.gob.do', rol: 'Compras Públicas', ping: '15ms', status: 'ONLINE' },
              { peer: 'peer0.digeig.gob.do', rol: 'Ética Gubernamental', ping: '22ms', status: 'ONLINE' },
              { peer: 'peer0.hacienda.gob.do', rol: 'Ministerio de Hacienda', ping: '19ms', status: 'ONLINE' },
              { peer: 'peer0.presidencia.gob.do', rol: 'Poder Ejecutivo', ping: '14ms', status: 'ONLINE' },
            ].map((node, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs"
              >
                <div>
                  <div className="font-mono font-semibold text-slate-200 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {node.peer}
                  </div>
                  <span className="text-[10px] text-slate-400">{node.rol}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-emerald-400 font-bold block">{node.status}</span>
                  <span className="text-[9px] text-slate-500 font-mono">{node.ping}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-800 space-y-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Algoritmo de Consenso:</span>
              <strong className="text-slate-200 font-mono">Raft BFT Multi-Org</strong>
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>Criptografía de Firma:</span>
              <strong className="text-slate-200 font-mono">RSA-4096 / X.509 INDOTEL</strong>
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>Sellado de Tiempo:</span>
              <strong className="text-slate-200 font-mono">RFC 3161 TSA Válido</strong>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
