import React, { useState } from 'react';
import {
  AuditRecord,
  FindingRecord,
  DigitalEvidence,
  AuditReply,
  UserProfile,
  SecurityAuditLog,
  SupportedCurrency,
  SupportedLanguage,
  BrandingConfig,
  TechnologicalPlugin,
} from './types';
import {
  INITIAL_AUDITS,
  INITIAL_FINDINGS,
  INITIAL_EVIDENCES,
  INITIAL_REPLIES,
  INITIAL_USERS,
  INITIAL_AUDIT_LOGS,
  DEFAULT_BRANDING,
  INITIAL_PLUGINS,
} from './services/mockData';
import { blockchainService } from './services/blockchain';
import { generateAndDownloadProjectZip } from './services/zipExporter';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { AuditsView } from './components/AuditsView';
import { FindingsView } from './components/FindingsView';
import { AuditedEntityPortal } from './components/AuditedEntityPortal';
import { SupervisorPortal } from './components/SupervisorPortal';
import { CitizenPortal } from './components/CitizenPortal';
import { BlockchainExplorer } from './components/BlockchainExplorer';
import { ReportsView } from './components/ReportsView';
import { ArchitectureView } from './components/ArchitectureView';
import { PluginsView } from './components/PluginsView';
import { UserSecurityModal } from './components/UserSecurityModal';
import { BrandingModal } from './components/BrandingModal';
import { FindingCrudModal } from './components/FindingCrudModal';
import { PublishOnlineModal } from './components/PublishOnlineModal';
import { Shield, Lock, ExternalLink, Globe } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USERS[0]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>(INITIAL_USERS);
  const [audits, setAudits] = useState<AuditRecord[]>(INITIAL_AUDITS);
  const [findings, setFindings] = useState<FindingRecord[]>(INITIAL_FINDINGS);
  const [evidences, setEvidences] = useState<DigitalEvidence[]>(INITIAL_EVIDENCES);
  const [replies, setReplies] = useState<AuditReply[]>(INITIAL_REPLIES);
  const [auditLogs, setAuditLogs] = useState<SecurityAuditLog[]>(INITIAL_AUDIT_LOGS);

  // Branding & Developer profile
  const [branding, setBranding] = useState<BrandingConfig>(DEFAULT_BRANDING);
  const [plugins, setPlugins] = useState<TechnologicalPlugin[]>(INITIAL_PLUGINS);
  const [isAiOptimizing, setIsAiOptimizing] = useState(false);

  // Modals state
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isBrandingModalOpen, setIsBrandingModalOpen] = useState(false);
  const [isFindingCrudModalOpen, setIsFindingCrudModalOpen] = useState(false);
  const [isPublishOnlineModalOpen, setIsPublishOnlineModalOpen] = useState(false);

  // Selected finding for in-screen editing
  const [activeFindingForEdit, setActiveFindingForEdit] = useState<FindingRecord | undefined>();

  const [currency, setCurrency] = useState<SupportedCurrency>('DOP');
  const [lang, setLang] = useState<SupportedLanguage>('es');

  // Cross-navigation props
  const [preselectedAuditForFinding, setPreselectedAuditForFinding] = useState<string | undefined>();
  const [initialReportAudit, setInitialReportAudit] = useState<AuditRecord | undefined>();
  const [initialReportType, setInitialReportType] = useState<'financiero' | 'legal' | 'forense'>('financiero');

  // Blockchain blocks state
  const [blocks, setBlocks] = useState(blockchainService.getBlocks());
  const [transactions, setTransactions] = useState(blockchainService.getTransactions());

  const handleAddAudit = (newAudit: AuditRecord) => {
    setAudits([newAudit, ...audits]);
    setBlocks(blockchainService.getBlocks());
    setTransactions(blockchainService.getTransactions());
    
    const log: SecurityAuditLog = {
      id: 'log-' + Date.now(),
      timestamp: new Date().toLocaleString('es-DO'),
      usuario_id: currentUser.id,
      usuario_nombre: currentUser.nombre,
      rol: currentUser.rol,
      ip_origen: '190.166.45.12 (Santo Domingo, RD)',
      accion: 'APERTURA_AUDITORIA',
      modulo: 'audit-service',
      resultado: 'AUTORIZADO',
      hash_evento: newAudit.blockchain_tx_id,
      mfa_utilizado: currentUser.mfa_activo,
    };
    setAuditLogs([log, ...auditLogs]);
  };

  const handleAddFinding = (newFinding: FindingRecord) => {
    setFindings([newFinding, ...findings]);
    setBlocks(blockchainService.getBlocks());
    setTransactions(blockchainService.getTransactions());

    setAudits(
      audits.map((a) => {
        if (a.id === newFinding.auditoria_id) {
          return {
            ...a,
            hallazgos_count: a.hallazgos_count + 1,
            monto_observado: a.monto_observado + newFinding.monto_observado,
          };
        }
        return a;
      })
    );

    const log: SecurityAuditLog = {
      id: 'log-' + Date.now(),
      timestamp: new Date().toLocaleString('es-DO'),
      usuario_id: currentUser.id,
      usuario_nombre: currentUser.nombre,
      rol: currentUser.rol,
      ip_origen: '190.166.45.12 (Santo Domingo, RD)',
      accion: 'REGISTRO_HALLAZGO_ISSAI',
      modulo: 'finding-service',
      resultado: 'AUTORIZADO',
      hash_evento: newFinding.blockchain_hash,
      mfa_utilizado: currentUser.mfa_activo,
    };
    setAuditLogs([log, ...auditLogs]);
  };

  const handleUpdateFinding = (updatedFinding: FindingRecord) => {
    setFindings(findings.map((f) => (f.id === updatedFinding.id ? updatedFinding : f)));
    setBlocks(blockchainService.getBlocks());
    setTransactions(blockchainService.getTransactions());

    const log: SecurityAuditLog = {
      id: 'log-' + Date.now(),
      timestamp: new Date().toLocaleString('es-DO'),
      usuario_id: currentUser.id,
      usuario_nombre: branding.developerName,
      rol: currentUser.rol,
      ip_origen: '190.166.45.12 (Santo Domingo, RD)',
      accion: `ACTUALIZAR_HALLAZGO_${updatedFinding.version_actual || 'v1.1'}`,
      modulo: 'finding-service (Carpeta Automática)',
      resultado: 'AUTORIZADO',
      hash_evento: updatedFinding.blockchain_hash,
      mfa_utilizado: currentUser.mfa_activo,
    };
    setAuditLogs([log, ...auditLogs]);
  };

  const handleDeleteFinding = (findingId: string) => {
    setFindings(findings.filter((f) => f.id !== findingId));
    const log: SecurityAuditLog = {
      id: 'log-' + Date.now(),
      timestamp: new Date().toLocaleString('es-DO'),
      usuario_id: currentUser.id,
      usuario_nombre: branding.developerName,
      rol: currentUser.rol,
      ip_origen: '190.166.45.12 (Santo Domingo, RD)',
      accion: 'ELIMINAR_HALLAZGO',
      modulo: 'finding-service',
      resultado: 'AUTORIZADO',
      hash_evento: 'delete-' + findingId,
      mfa_utilizado: currentUser.mfa_activo,
    };
    setAuditLogs([log, ...auditLogs]);
  };

  const handleAddEvidence = (newEvidence: DigitalEvidence) => {
    setEvidences([newEvidence, ...evidences]);
    setBlocks(blockchainService.getBlocks());
    setTransactions(blockchainService.getTransactions());

    setFindings(
      findings.map((f) => {
        if (f.id === newEvidence.hallazgo_id) {
          return { ...f, evidencias_count: f.evidencias_count + 1 };
        }
        return f;
      })
    );

    const log: SecurityAuditLog = {
      id: 'log-' + Date.now(),
      timestamp: new Date().toLocaleString('es-DO'),
      usuario_id: currentUser.id,
      usuario_nombre: currentUser.nombre,
      rol: currentUser.rol,
      ip_origen: '190.166.45.12 (Santo Domingo, RD)',
      accion: 'CUSTODIA_DIGITAL_SELLADA',
      modulo: 'evidence-service',
      resultado: 'AUTORIZADO',
      hash_evento: newEvidence.sha256,
      mfa_utilizado: currentUser.mfa_activo,
    };
    setAuditLogs([log, ...auditLogs]);
  };

  const handleAddReply = (newReply: AuditReply) => {
    setReplies([newReply, ...replies]);
    setBlocks(blockchainService.getBlocks());
    setTransactions(blockchainService.getTransactions());

    setFindings(
      findings.map((f) => {
        if (f.id === newReply.hallazgo_id) {
          return { ...f, replica_registrada: true, estado: 'En Réplica' };
        }
        return f;
      })
    );

    const log: SecurityAuditLog = {
      id: 'log-' + Date.now(),
      timestamp: new Date().toLocaleString('es-DO'),
      usuario_id: currentUser.id,
      usuario_nombre: currentUser.nombre,
      rol: currentUser.rol,
      ip_origen: '200.88.112.34 (Santo Domingo, RD)',
      accion: 'RADICAR_REPLICA_ENTIDAD',
      modulo: 'reply-service',
      resultado: 'AUTORIZADO',
      hash_evento: newReply.tx_id,
      mfa_utilizado: currentUser.mfa_activo,
    };
    setAuditLogs([log, ...auditLogs]);
  };

  const handleUpdateAuditFirmas = (auditId: string, firmas: AuditRecord['firmas']) => {
    setAudits(
      audits.map((a) => {
        if (a.id === auditId) {
          const isFullySigned = firmas.auditor && firmas.supervisor && firmas.director && firmas.pleno;
          return {
            ...a,
            firmas,
            estado: isFullySigned ? 'Informe Definitivo Publicado' : a.estado,
          };
        }
        return a;
      })
    );
    setBlocks(blockchainService.getBlocks());
    setTransactions(blockchainService.getTransactions());
  };

  const handleUpdateReplyVerdict = (
    replyId: string,
    verdict: 'Aceptada' | 'Parcialmente aceptada' | 'No aceptada',
    fund: string
  ) => {
    setReplies(
      replies.map((r) => {
        if (r.id === replyId) {
          return {
            ...r,
            dictamen_supervisor: verdict,
            fundamentacion_dictamen: fund,
            fecha_dictamen: new Date().toLocaleString('es-DO'),
          };
        }
        return r;
      })
    );
    setBlocks(blockchainService.getBlocks());
    setTransactions(blockchainService.getTransactions());
  };

  const handleUpdateUser = (updatedUser: UserProfile) => {
    setCurrentUser(updatedUser);
    setAllUsers(allUsers.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
  };

  const handleAddUser = (newUser: UserProfile) => {
    setAllUsers([...allUsers, newUser]);
  };

  const handleOpenFindingWithAudit = (auditId: string) => {
    setPreselectedAuditForFinding(auditId);
    setCurrentTab('findings');
  };

  const handleGenerateReport = (audit: AuditRecord, reportType: 'financiero' | 'legal' | 'forense') => {
    setInitialReportAudit(audit);
    setInitialReportType(reportType);
    setCurrentTab('reports');
  };

  // Download complete ZIP
  const handleDownloadZip = async () => {
    await generateAndDownloadProjectZip({
      branding,
      audits,
      findings,
      evidences,
      replies,
      plugins,
      blocksCount: blocks[0]?.block_number || 1048,
    });
  };

  // Run AI Auto-Optimizer on plugins
  const handleRunAIOptimizer = async () => {
    setIsAiOptimizing(true);
    await new Promise((r) => setTimeout(r, 1200));

    // Update plugins with AI heuristic updates
    const updatedPlugins = plugins.map((p) => ({
      ...p,
      version: p.version.replace(/\.0$/, '.1'),
      ultima_actualizacion: new Date().toLocaleString('es-DO'),
      mejora_ia: `${p.mejora_ia} [Actualizado y verificado por Gemini AI Developer]`,
    }));

    setPlugins(updatedPlugins);
    setIsAiOptimizing(false);

    // Commit to Hyperledger Fabric
    await blockchainService.commitTransaction(
      'ACTUALIZAR_HALLAZGO',
      branding.developerName,
      'ADMIN_DEVELOPER',
      'PluginOptimizer:AutoOptimize',
      'Auto-optimización tecnológica de complementos con IA Gemini',
      JSON.stringify(updatedPlugins)
    );
    setBlocks(blockchainService.getBlocks());
  };

  const handleOpenFindingEditor = (finding: FindingRecord) => {
    setActiveFindingForEdit(finding);
    setIsFindingCrudModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Institutional Top Navigation Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentUser={currentUser}
        allUsers={allUsers}
        onSwitchUser={(user) => setCurrentUser(user)}
        onOpenUserModal={() => setIsUserModalOpen(true)}
        branding={branding}
        onOpenBrandingModal={() => setIsBrandingModalOpen(true)}
        onDownloadZip={handleDownloadZip}
        onPublishOnline={() => setIsPublishOnlineModalOpen(true)}
        onOpenFindingCrudModal={() => {
          setActiveFindingForEdit(findings[0]);
          setIsFindingCrudModalOpen(true);
        }}
        lang={lang}
        setLang={setLang}
        currency={currency}
        setCurrency={setCurrency}
        blocksCount={blocks[0]?.block_number || 1048}
      />

      {/* Main App Content View Switcher */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'dashboard' && (
          <DashboardView
            audits={audits}
            findings={findings}
            currency={currency}
            lang={lang}
            onNavigateTab={setCurrentTab}
            onSelectAudit={(audit) => {
              setInitialReportAudit(audit);
              setCurrentTab('audits');
            }}
          />
        )}

        {currentTab === 'audits' && (
          <AuditsView
            audits={audits}
            findings={findings}
            onAddAudit={handleAddAudit}
            currency={currency}
            lang={lang}
            onOpenFindingWithAudit={handleOpenFindingWithAudit}
            onGenerateReport={handleGenerateReport}
          />
        )}

        {currentTab === 'findings' && (
          <FindingsView
            findings={findings}
            audits={audits}
            evidences={evidences}
            onAddFinding={handleAddFinding}
            onAddEvidence={handleAddEvidence}
            onOpenFindingEditor={handleOpenFindingEditor}
            currency={currency}
            lang={lang}
            preselectedAuditId={preselectedAuditForFinding}
          />
        )}

        {currentTab === 'plugins' && (
          <PluginsView
            plugins={plugins}
            onAddPlugin={(p) => setPlugins([...plugins, p])}
            onUpdatePlugin={(p) => setPlugins(plugins.map((x) => (x.id === p.id ? p : x)))}
            onDeletePlugin={(id) => setPlugins(plugins.filter((x) => x.id !== id))}
            onRunAIOptimizer={handleRunAIOptimizer}
            branding={branding}
            onDownloadZip={handleDownloadZip}
            onPublishOnline={() => setIsPublishOnlineModalOpen(true)}
            isAiOptimizing={isAiOptimizing}
          />
        )}

        {currentTab === 'entity' && (
          <AuditedEntityPortal
            audits={audits}
            findings={findings}
            replies={replies}
            onAddReply={handleAddReply}
            currency={currency}
            lang={lang}
          />
        )}

        {currentTab === 'supervisor' && (
          <SupervisorPortal
            audits={audits}
            findings={findings}
            replies={replies}
            onUpdateAuditFirmas={handleUpdateAuditFirmas}
            onUpdateReplyVerdict={handleUpdateReplyVerdict}
            currency={currency}
            lang={lang}
          />
        )}

        {currentTab === 'citizen' && (
          <CitizenPortal
            audits={audits}
            findings={findings}
            currency={currency}
            lang={lang}
            onDownloadReport={(audit) => handleGenerateReport(audit, 'financiero')}
          />
        )}

        {currentTab === 'blockchain' && (
          <BlockchainExplorer blocks={blocks} transactions={transactions} />
        )}

        {currentTab === 'reports' && (
          <ReportsView
            audits={audits}
            findings={findings}
            currency={currency}
            lang={lang}
            initialSelectedAudit={initialReportAudit}
            initialReportType={initialReportType}
          />
        )}

        {currentTab === 'architecture' && <ArchitectureView />}
      </main>

      {/* Security, User Profile, Support Key History & 2FA Modal */}
      <UserSecurityModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        currentUser={currentUser}
        allUsers={allUsers}
        onUpdateUser={handleUpdateUser}
        onAddUser={handleAddUser}
        auditLogs={auditLogs}
      />

      {/* Branding and Developer Information Customizer Modal */}
      <BrandingModal
        isOpen={isBrandingModalOpen}
        onClose={() => setIsBrandingModalOpen(false)}
        branding={branding}
        onUpdateBranding={setBranding}
      />

      {/* In-Screen Findings Manager & Automatic Version Folder Modal */}
      <FindingCrudModal
        isOpen={isFindingCrudModalOpen}
        onClose={() => setIsFindingCrudModalOpen(false)}
        findings={findings}
        onUpdateFinding={handleUpdateFinding}
        onDeleteFinding={handleDeleteFinding}
        currency={currency}
        developerName={branding.developerName}
      />

      {/* Publish Online Modal */}
      <PublishOnlineModal
        isOpen={isPublishOnlineModalOpen}
        onClose={() => setIsPublishOnlineModalOpen(false)}
        branding={branding}
      />

      {/* Institutional Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950/80 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2 flex-wrap">
                <span className="font-bold text-white tracking-wide">
                  SITA-BLOCKCHAIN
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-amber-400 font-semibold">
                  {branding.companyName}
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-300 font-mono">
                  Desarrollador: {branding.developerName} ({branding.developerContact})
                </span>
              </div>
              <p className="text-slate-400 text-[11px] max-w-2xl">
                Plataforma de Auditoría Forense y Gubernamental con Custodia Digital, Trazabilidad Inmutable con Hyperledger Fabric y Normas Internacionales de Entidades Fiscalizadoras Superiores (ISSAI / INTOSAI).
              </p>
            </div>

            <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Zero Trust • ISO 27001 • PKI X.509 INDOTEL</span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-900/80 flex flex-wrap items-center justify-between gap-3 text-[10px] text-slate-500">
            <div className="flex flex-wrap gap-3">
              <span>Ley 10-04 (Cámara de Cuentas)</span>
              <span>•</span>
              <span>Ley 340-06 (Compras Públicas)</span>
              <span>•</span>
              <span>Ley 126-02 (Firma Digital)</span>
              <span>•</span>
              <span>Ley 172-13 (Protección de Datos)</span>
              <span>•</span>
              <span>Ley 200-04 (Libre Acceso)</span>
              <span>•</span>
              <span>NORTIC A2/A3/E1</span>
            </div>
            <span>© 2025-2026 {branding.companyName}. Desarrollador: {branding.developerName} • {branding.developerContact}.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
