export type UserRole = 
  | 'AUDITOR_CCRD' 
  | 'SUPERVISOR_CCRD' 
  | 'DIRECTOR_CCRD' 
  | 'ENTIDAD_AUDITADA' 
  | 'CIUDADANO' 
  | 'ADMIN_DEVELOPER';

export interface DeveloperKeyHistory {
  id: string;
  fecha: string;
  modificado_por: string;
  motivo_soporte: string;
  hash_anterior: string;
  clave_temporal_soporte: string;
  expira: string;
  estado: 'Activa' | 'Revocada' | 'Expirada';
}

export interface UserProfile {
  id: string;
  nombre: string;
  email: string;
  cargo: string;
  institucion: string;
  rol: UserRole;
  mfa_activo: boolean;
  mfa_codigo_actual?: string;
  ultimo_acceso: string;
  historico_claves: DeveloperKeyHistory[];
  certificado_x509_valido: boolean;
  avatar_url?: string;
}

export type AuditType = 
  | 'Auditoría Financiera' 
  | 'Auditoría de Cumplimiento' 
  | 'Auditoría de Gestión' 
  | 'Auditoría Forense' 
  | 'Investigación Especial';

export type AuditStatus = 
  | 'Planificación' 
  | 'En Ejecución' 
  | 'En Réplicas' 
  | 'En Aprobación Pleno' 
  | 'Informe Definitivo Publicado';

export interface AuditRecord {
  id: string;
  codigo: string;
  nombre: string;
  entidad: string;
  siglas: string;
  sector: string;
  tipo: AuditType;
  fecha_inicio: string;
  fecha_fin: string;
  periodo_auditado: string;
  estado: AuditStatus;
  monto_examinado: number;
  monto_observado: number;
  monto_recuperado: number;
  auditor_lider: string;
  supervisor: string;
  blockchain_tx_id: string;
  bloque_genesis: number;
  hallazgos_count: number;
  recomendaciones_count: number;
  cumplimiento_pct: number;
  firmas: {
    auditor: boolean;
    supervisor: boolean;
    director: boolean;
    pleno: boolean;
  };
}

export interface BrandingConfig {
  brandMode: 'BALDERA_SANTOS' | 'CAMARA_DE_CUENTAS';
  companyName: string;
  companyShort: string;
  subtitle: string;
  developerName: string;
  developerContact: string;
  developerEmail: string;
  developerRole: string;
  institutionLocation: string;
}

export interface FindingVersion {
  version: string;
  timestamp: string;
  modificado_por: string;
  motivo_cambio: string;
  titulo: string;
  condicion: string;
  criterio: string;
  causa: string;
  efecto: string;
  recomendacion: string;
  riesgo: RiskLevel;
  monto_observado: number;
  hash_version: string;
}

export interface TechnologicalPlugin {
  id: string;
  nombre: string;
  version: string;
  categoria: 'Auditoría Forense' | 'Seguridad Zero Trust' | 'Interoperabilidad DGCP' | 'Motor IA Gemini' | 'Cumplimiento Normativo';
  descripcion: string;
  activo: boolean;
  ultima_actualizacion: string;
  mejora_ia: string;
  impacto: 'Alto' | 'Crítico' | 'Estratégico';
}

export type RiskLevel = 'Crítico' | 'Alto' | 'Medio' | 'Bajo';

export interface FindingRecord {
  id: string;
  auditoria_id: string;
  codigo: string;
  titulo: string;
  condicion: string;
  criterio: string;
  causa: string;
  efecto: string;
  recomendacion: string;
  riesgo: RiskLevel;
  monto_observado: number;
  estado: 'Abierto' | 'Notificado' | 'En Réplica' | 'Validado' | 'Cerrado';
  fecha_registro: string;
  blockchain_hash: string;
  tx_id: string;
  bloque_numero: number;
  evidencias_count: number;
  replica_registrada: boolean;
  dictamen_replica?: 'Aceptada' | 'Parcialmente aceptada' | 'No aceptada';
  version_actual?: string;
  historico_versiones?: FindingVersion[];
}

export interface DigitalSignatureInfo {
  firmante: string;
  cargo: string;
  institucion: string;
  algoritmo: 'RSA-4096 / SHA-256' | 'ECDSA-secp256r1';
  serial_certificado: string;
  emisor_ac: string; // e.g. 'AC Raíz del Estado Dominicano - INDOTEL'
  fecha_firma: string;
  sello_tiempo_rfc3161: string;
  valida: boolean;
}

export interface DigitalEvidence {
  id: string;
  hallazgo_id: string;
  codigo_evidencia: string;
  documento_nombre: string;
  tamano_bytes: number;
  tamano_formateado: string;
  tipo_mime: string;
  categoria: 'Comprobante de Pago' | 'Contrato' | 'Acta de Recepción' | 'Informe Pericial' | 'Correspondencia' | 'Registro Contable';
  sha256: string;
  sha512: string;
  timestamp_rfc3161: string;
  firma_digital: DigitalSignatureInfo;
  blockchain_id: string;
  nodo_custodia: string;
  estado_custodia: 'Cadena de Custodia Intacta' | 'Sello Criptográfico Válido' | 'Inmutable en Ledger';
  fecha_subida: string;
  subido_por: string;
}

export interface AuditReply {
  id: string;
  hallazgo_id: string;
  entidad_nombre: string;
  fecha_radicacion: string;
  representante_legal: string;
  cargo_representante: string;
  texto_replica: string;
  evidencias_adjuntas: string[];
  dictamen_supervisor: 'Pendiente de Evaluación' | 'Aceptada' | 'Parcialmente aceptada' | 'No aceptada';
  fundamentacion_dictamen?: string;
  fecha_dictamen?: string;
  supervisor_responsable?: string;
  ajuste_monto?: number;
  tx_id: string;
  blockchain_hash: string;
}

export interface RecommendationRecord {
  id: string;
  hallazgo_id: string;
  auditoria_id: string;
  codigo: string;
  descripcion: string;
  responsable_entidad: string;
  plazo_dias: number;
  fecha_limite: string;
  porcentaje_avance: number;
  estado: 'Pendiente' | 'En Implementación' | 'Cumplida' | 'Vencida';
  plan_accion_aprobado: boolean;
  ultima_actualizacion: string;
  tx_id: string;
}

export interface BlockchainTransaction {
  tx_id: string;
  block_number: number;
  timestamp: string;
  accion: 
    | 'CREAR_AUDITORIA' 
    | 'CREAR_HALLAZGO' 
    | 'ACTUALIZAR_HALLAZGO'
    | 'REGISTRAR_EVIDENCIA' 
    | 'VALIDAR_EVIDENCIA'
    | 'RADICAR_REPLICA' 
    | 'DICTAMINAR_REPLICA' 
    | 'FIRMAR_X509' 
    | 'CREAR_RECOMENDACION'
    | 'CERRAR_HALLAZGO';
  usuario: string;
  rol: string;
  nodo_peer: string;
  payload_hash: string;
  smart_contract: string;
  estado: 'COMMITTED' | 'VALIDATED';
  detalles: string;
}

export interface BlockchainBlock {
  block_number: number;
  block_hash: string;
  previous_hash: string;
  merkle_root: string;
  timestamp: string;
  tx_count: number;
  validator_peer: string;
  size_kb: number;
  transacciones: BlockchainTransaction[];
}

export interface PeerNode {
  id: string;
  nombre: string;
  endpoint: string;
  institucion: string;
  rol_red: 'Anchor Peer (Líder)' | 'Endorsing Peer' | 'Commit Peer' | 'Auditor Read-Only Peer';
  estado: 'ONLINE' | 'SYNCED';
  bloques_sincronizados: number;
  latencia_ms: number;
  certificado_tls: string;
}

export interface SecurityAuditLog {
  id: string;
  timestamp: string;
  usuario_id: string;
  usuario_nombre: string;
  rol: string;
  ip_origen: string;
  accion: string;
  modulo: string;
  resultado: 'AUTORIZADO' | 'ADVERTENCIA' | 'BLOQUEADO' | '2FA_EXITOSO';
  hash_evento: string;
  mfa_utilizado: boolean;
}

export type SupportedLanguage = 'es' | 'en';
export type SupportedCurrency = 'DOP' | 'USD' | 'EUR';
