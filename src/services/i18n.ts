import { SupportedCurrency, SupportedLanguage } from '../types';

export function formatCurrency(amountDOP: number, currency: SupportedCurrency = 'DOP'): string {
  let finalAmount = amountDOP;
  let symbol = 'RD$';

  if (currency === 'USD') {
    finalAmount = amountDOP / 60.5;
    symbol = 'US$';
  } else if (currency === 'EUR') {
    finalAmount = amountDOP / 65.8;
    symbol = '€';
  }

  return `${symbol} ${finalAmount.toLocaleString('es-DO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export const TRANSLATIONS = {
  es: {
    appTitle: 'SITA-BLOCKCHAIN CCRD',
    appSubtitle: 'Sistema Integral de Trazabilidad de Auditorías basado en Blockchain',
    countryHeader: 'República Dominicana • Órgano Superior de Control Externo',
    portalAuditor: 'Portal Auditor',
    portalEntity: 'Entidad Auditada',
    portalSupervisor: 'Supervisor / Pleno',
    portalCitizen: 'Portal Ciudadano',
    portalBlockchain: 'Hyperledger Explorer',
    portalArchitecture: 'Arquitectura TOGAF',
    audits: 'Auditorías',
    findings: 'Hallazgos ISSAI',
    evidences: 'Custodia Digital',
    replies: 'Réplicas',
    recommendations: 'Recomendaciones',
    riskMatrix: 'Matriz de Riesgo IA',
    reports: 'Informes Oficiales',
    activeAudits: 'Auditorías Activas',
    openFindings: 'Hallazgos Abiertos',
    criticalFindings: 'Hallazgos Críticos',
    observedAmount: 'Monto Total Observado',
    recoveredAmount: 'Monto Recuperado',
    complianceRate: 'Tasa de Cumplimiento',
    generatePDF: 'Exportar Informe PDF',
    generateExcel: 'Descargar Excel / CSV',
    newAudit: 'Nueva Auditoría',
    newFinding: 'Registrar Hallazgo ISSAI',
    aiCopilot: 'Asistente IA Gemini',
    digitalSignature: 'Firma Digital X.509',
    securityZeroTrust: 'Seguridad Zero Trust',
    userManagement: 'Gestión de Usuario y Soporte',
    search: 'Buscar por código, entidad, hash o norma...',
  },
  en: {
    appTitle: 'SITA-BLOCKCHAIN CCRD',
    appSubtitle: 'Integrated Blockchain Audit Traceability System',
    countryHeader: 'Dominican Republic • Supreme Audit Institution',
    portalAuditor: 'Auditor Portal',
    portalEntity: 'Audited Entity',
    portalSupervisor: 'Supervisor / Board',
    portalCitizen: 'Citizen Portal',
    portalBlockchain: 'Hyperledger Explorer',
    portalArchitecture: 'TOGAF Architecture',
    audits: 'Audits',
    findings: 'ISSAI Findings',
    evidences: 'Digital Custody',
    replies: 'Replies',
    recommendations: 'Recommendations',
    riskMatrix: 'AI Risk Matrix',
    reports: 'Official Reports',
    activeAudits: 'Active Audits',
    openFindings: 'Open Findings',
    criticalFindings: 'Critical Findings',
    observedAmount: 'Total Observed Amount',
    recoveredAmount: 'Recovered Amount',
    complianceRate: 'Compliance Rate',
    generatePDF: 'Export PDF Report',
    generateExcel: 'Download Excel / CSV',
    newAudit: 'New Audit',
    newFinding: 'Register ISSAI Finding',
    aiCopilot: 'Gemini AI Co-Pilot',
    digitalSignature: 'X.509 Digital Signature',
    securityZeroTrust: 'Zero Trust Security',
    userManagement: 'User Management & Support',
    search: 'Search by code, entity, hash or standard...',
  },
};
