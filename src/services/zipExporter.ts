import JSZip from 'jszip';
import { AuditRecord, FindingRecord, DigitalEvidence, AuditReply, BrandingConfig, TechnologicalPlugin } from '../types';

export async function generateAndDownloadProjectZip(params: {
  branding: BrandingConfig;
  audits: AuditRecord[];
  findings: FindingRecord[];
  evidences: DigitalEvidence[];
  replies: AuditReply[];
  plugins: TechnologicalPlugin[];
  blocksCount: number;
}): Promise<void> {
  const zip = new JSZip();

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const folderName = `SITA_BLOCKCHAIN_${params.branding.companyShort}_${timestamp}`;
  const root = zip.folder(folderName) || zip;

  // 1. Developer and Firm Profile
  const devInfo = `=============================================================================
SITA-BLOCKCHAIN - SISTEMA INTEGRAL DE TRAZABILIDAD DE AUDITORÍAS CON BLOCKCHAIN
FIRMA CONSULTORA & AUDITORÍA FORENSE: ${params.branding.companyName.toUpperCase()}
=============================================================================

DATOS DEL DESARROLLADOR Y ARQUITECTO PRINCIPAL:
-----------------------------------------------------------------------------
Desarrollador Principal: ${params.branding.developerName}
Rol Institucional:        ${params.branding.developerRole}
Teléfono / Contacto:     ${params.branding.developerContact}
Correo Electrónico:      ${params.branding.developerEmail}
Ubicación / Jurisdicción: ${params.branding.institutionLocation}

DESCRIPCIÓN DE LA PLATAFORMA:
-----------------------------------------------------------------------------
Plataforma de Auditoría Gubernamental y Forense con trazabilidad inmutable
en Blockchain Hyperledger Fabric, Inteligencia Artificial Gemini para análisis
normativo de normas ISSAI 100/200/300/400, Ley 10-04, Ley 340-06 y Ley 126-02.

CARPETA AUTOMÁTICA Y TRAZABILIDAD:
-----------------------------------------------------------------------------
Cada hallazgo e informe cuenta con histórico de versiones auditables,
hashes criptográficos SHA-256 / SHA-512 y sellos de tiempo RFC 3161.

Fecha de Exportación:    ${new Date().toLocaleString('es-DO')}
Bloques en Ledger:       ${params.blocksCount}
=============================================================================`;

  root.file('00_DESARROLLADOR_Y_FIRMA_LIC_PEDRO_BALDERA.txt', devInfo);

  // 2. Audits JSON
  root.file(
    '01_EXPEDIENTES_AUDITORIAS.json',
    JSON.stringify(params.audits, null, 2)
  );

  // 3. ISSAI Findings with complete version history
  root.file(
    '02_HALLAZGOS_ISSAI_CON_HISTORICO_VERSIONES.json',
    JSON.stringify(params.findings, null, 2)
  );

  // 4. Digital Evidence Cryptographic Proofs
  root.file(
    '03_CUSTODIA_DIGITAL_EVIDENCIAS_SHA256_SHA512.json',
    JSON.stringify(params.evidences, null, 2)
  );

  // 5. Replies & Gemini AI Verdicts
  root.file(
    '04_REPLICAS_Y_DICTAMENES_IA_GEMINI.json',
    JSON.stringify(params.replies, null, 2)
  );

  // 6. Technological Plugins & Auto-Optimizer
  root.file(
    '05_COMPLEMENTOS_TECNOLOGICOS_OPTIMIZADOS.json',
    JSON.stringify(params.plugins, null, 2)
  );

  // 7. CSV Export for Excel interoperability (NORTIC A3)
  const csvRows = [
    [
      'Codigo_Auditoria',
      'Codigo_Hallazgo',
      'Version',
      'Titulo',
      'Riesgo',
      'Monto_Observado_DOP',
      'Estado',
      'Hash_Blockchain',
      'Desarrollador_Soporte',
    ].join(','),
  ];

  params.findings.forEach((f) => {
    csvRows.push(
      [
        `"${f.auditoria_id}"`,
        `"${f.codigo}"`,
        `"${f.version_actual || 'v1.0'}"`,
        `"${f.titulo.replace(/"/g, '""')}"`,
        `"${f.riesgo}"`,
        f.monto_observado,
        `"${f.estado}"`,
        `"${f.blockchain_hash}"`,
        `"${params.branding.developerName} (${params.branding.developerContact})"`,
      ].join(',')
    );
  });

  root.file('06_TABLA_GENERAL_EXCEL_CSV.csv', '\uFEFF' + csvRows.join('\n'));

  // Generate ZIP blob and trigger browser download
  const blob = await zip.generateAsync({ type: 'blob' });
  const downloadUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = `${params.branding.companyShort}_SITA_BLOCKCHAIN_${timestamp}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(downloadUrl);
}
