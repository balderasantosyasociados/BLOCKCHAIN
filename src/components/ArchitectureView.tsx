import React, { useState } from 'react';
import {
  Shield,
  Layers,
  Database,
  Server,
  FileCode,
  Lock,
  GitBranch,
  Copy,
  Check,
  Cpu,
  CheckCircle2,
  Box,
} from 'lucide-react';

export const ArchitectureView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'togaf' | 'postgres' | 'chaincode' | 'infra' | 'openapi'>('togaf');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(key);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const POSTGRES_DDL = `-- =========================================================================
-- SITA-BLOCKCHAIN CCRD - ESQUEMA RELACIONAL POSTGRESQL v16 (Zero Trust)
-- Cámara de Cuentas de la República Dominicana
-- =========================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabla de Auditorías Institucionales
CREATE TABLE auditorias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    entidad VARCHAR(200) NOT NULL,
    siglas VARCHAR(20),
    sector VARCHAR(100) NOT NULL,
    tipo VARCHAR(50) NOT NULL, -- Financiera, Cumplimiento, Gestion, Forense
    periodo_auditado VARCHAR(100) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    monto_examinado NUMERIC(18,2) NOT NULL DEFAULT 0.00,
    monto_observado NUMERIC(18,2) NOT NULL DEFAULT 0.00,
    monto_recuperado NUMERIC(18,2) NOT NULL DEFAULT 0.00,
    auditor_lider_id UUID NOT NULL,
    supervisor_id UUID NOT NULL,
    estado VARCHAR(50) NOT NULL DEFAULT 'En Ejecucion',
    blockchain_tx_id VARCHAR(128) NOT NULL,
    bloque_genesis INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Hallazgos según estándar ISSAI (5 componentes)
CREATE TABLE hallazgos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auditoria_id UUID NOT NULL REFERENCES auditorias(id) ON DELETE CASCADE,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    condicion TEXT NOT NULL,       -- Componente 1 ISSAI
    criterio TEXT NOT NULL,        -- Componente 2 ISSAI (Leyes RD)
    causa TEXT NOT NULL,           -- Componente 3 ISSAI
    efecto TEXT NOT NULL,          -- Componente 4 ISSAI
    recomendacion TEXT NOT NULL,   -- Componente 5 ISSAI
    riesgo VARCHAR(20) NOT NULL,   -- Critico, Alto, Medio, Bajo
    monto_observado NUMERIC(18,2) DEFAULT 0.00,
    estado VARCHAR(30) DEFAULT 'Abierto',
    blockchain_hash VARCHAR(128) NOT NULL,
    tx_id VARCHAR(128) NOT NULL,
    bloque_numero INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Custodia Digital de Evidencias (MinIO / S3 Vault + Ledger)
CREATE TABLE evidencias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hallazgo_id UUID NOT NULL REFERENCES hallazgos(id) ON DELETE CASCADE,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    documento_nombre VARCHAR(255) NOT NULL,
    tamano_bytes BIGINT NOT NULL,
    tipo_mime VARCHAR(100) NOT NULL,
    sha256 VARCHAR(64) NOT NULL,
    sha512 VARCHAR(128) NOT NULL,
    s3_uri VARCHAR(512) NOT NULL,
    timestamp_rfc3161 TIMESTAMP WITH TIME ZONE NOT NULL,
    firma_digital_x509 JSONB NOT NULL,
    blockchain_asset_id VARCHAR(128) NOT NULL,
    nodo_custodia VARCHAR(100) NOT NULL DEFAULT 'peer0.ccrd.gob.do',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Réplicas y Descargos de Entidades Auditadas
CREATE TABLE replicas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hallazgo_id UUID NOT NULL REFERENCES hallazgos(id) ON DELETE CASCADE,
    entidad_nombre VARCHAR(200) NOT NULL,
    representante_legal VARCHAR(150) NOT NULL,
    cargo_representante VARCHAR(100) NOT NULL,
    texto_replica TEXT NOT NULL,
    dictamen_supervisor VARCHAR(50) DEFAULT 'Pendiente',
    fundamentacion_dictamen TEXT,
    blockchain_tx_id VARCHAR(128) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Firmas Digitales Institucionales Escalables (4 Tiers)
CREATE TABLE firmas_auditoria (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auditoria_id UUID NOT NULL REFERENCES auditorias(id) ON DELETE CASCADE,
    tier VARCHAR(20) NOT NULL, -- AUDITOR, SUPERVISOR, DIRECTOR, PLENO
    firmante_nombre VARCHAR(150) NOT NULL,
    serial_certificado VARCHAR(100) NOT NULL,
    ac_emisor VARCHAR(150) NOT NULL,
    sello_tiempo TIMESTAMP WITH TIME ZONE NOT NULL,
    tx_id VARCHAR(128) NOT NULL
);`;

  const CHAINCODE_GO = `// =========================================================================
// Hyperledger Fabric Chaincode (Go) - FindingContract
// Contrato Inteligente para la Cámara de Cuentas de la República Dominicana
// =========================================================================

package main

import (
	"encoding/json"
	"fmt"
	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

type FindingContract struct {
	contractapi.Contract
}

type FindingAsset struct {
	ID             string  \`json:"id"\`
	AuditID        string  \`json:"audit_id"\`
	Code           string  \`json:"code"\`
	Title          string  \`json:"title"\`
	Condition      string  \`json:"condition"\`
	Criterion      string  \`json:"criterion"\`
	Cause          string  \`json:"cause"\`
	Effect         string  \`json:"effect"\`
	Recommendation string  \`json:"recommendation"\`
	Risk           string  \`json:"risk"\`
	ObservedAmount float64 \`json:"observed_amount"\`
	State          string  \`json:"state"\`
	Submitter      string  \`json:"submitter"\`
	Timestamp      string  \`json:"timestamp"\`
}

func (c *FindingContract) CreateFinding(
	ctx contractapi.TransactionContextInterface,
	id string,
	auditID string,
	code string,
	title string,
	condition string,
	criterion string,
	cause string,
	effect string,
	recommendation string,
	risk string,
	amount float64,
) error {
	exists, err := ctx.GetStub().GetState(id)
	if err != nil {
		return err
	}
	if exists != nil {
		return fmt.Errorf("hallazgo %s ya existe en el ledger", id)
	}

	txTimestamp, _ := ctx.GetStub().GetTxTimestamp()
	clientCert, _ := ctx.GetClientIdentity().GetX509Certificate()

	asset := FindingAsset{
		ID:             id,
		AuditID:        auditID,
		Code:           code,
		Title:          title,
		Condition:      condition,
		Criterion:      criterion,
		Cause:          cause,
		Effect:         effect,
		Recommendation: recommendation,
		Risk:           risk,
		ObservedAmount: amount,
		State:          "NOTIFICADO",
		Submitter:      clientCert.Subject.CommonName,
		Timestamp:      txTimestamp.String(),
	}

	bytes, _ := json.Marshal(asset)
	return ctx.GetStub().PutState(id, bytes)
}`;

  const TERRAFORM_IAC = `# =========================================================================
# Terraform IaC - Azure Government / Kubernetes HLF Deployment
# Cámara de Cuentas de la República Dominicana
# =========================================================================

resource "azurerm_resource_group" "ccrd_blockchain" {
  name     = "rg-sita-blockchain-prod-dr"
  location = "eastus2"
  tags = {
    Environment = "Production-Government"
    Entity      = "CamaraDeCuentasRD"
    Compliance  = "ISSAI-ISO27001-NORTIC"
  }
}

resource "azurerm_kubernetes_cluster" "hlf_aks" {
  name                = "aks-ccrd-hlf-nodes"
  location            = azurerm_resource_group.ccrd_blockchain.location
  resource_group_name = azurerm_resource_group.ccrd_blockchain.name
  dns_prefix          = "sita-ccrd-k8s"

  default_node_pool {
    name       = "systempool"
    node_count = 3
    vm_size    = "Standard_D8s_v5"
    os_disk_size_gb = 256
  }

  identity {
    type = "SystemAssigned"
  }

  network_profile {
    network_plugin    = "azure"
    load_balancer_sku = "standard"
  }
}

resource "azurerm_key_vault" "ccrd_vault" {
  name                = "kv-ccrd-pki-keys"
  location            = azurerm_resource_group.ccrd_blockchain.location
  resource_group_name = azurerm_resource_group.ccrd_blockchain.name
  tenant_id           = "4a91b2c3-4d5e-6f7a-8b9c-0d1e2f3a4b5c"
  sku_name            = "premium" # FIPS 140-2 Level 3 HSM support
}`;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold text-white">
              Arquitectura Empresarial TOGAF & Especificaciones de Producción
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Diseño formal de capas de Negocio, Aplicaciones, Datos (PostgreSQL), Smart Contracts (Hyperledger Fabric) e Infraestructura Cloud Kubernetes / Terraform.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-semibold">
          {[
            { id: 'togaf', label: 'TOGAF C4' },
            { id: 'postgres', label: 'PostgreSQL DDL' },
            { id: 'chaincode', label: 'Chaincode (Go)' },
            { id: 'infra', label: 'Terraform IaC' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === tab.id ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: TOGAF C4 Framework View */}
      {activeTab === 'togaf' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              <span>1. Arquitectura de Negocio (Business Architecture)</span>
            </h3>
            <p className="text-slate-300 leading-relaxed">
              Basada en las atribuciones constitucionales y la <strong>Ley No. 10-04</strong> de la Cámara de Cuentas, alineada con las <strong>Normas Internacionales ISSAI 100, 200, 300 y 400</strong> de la INTOSAI.
            </p>
            <ul className="space-y-1 text-slate-400 list-disc list-inside">
              <li>Planificación Anual de Auditorías Gubernamentales.</li>
              <li>Ejecución sustantiva en campo y muestreo forense.</li>
              <li>Notificación perentoria y trámite de descargos (15 días hábiles).</li>
              <li>Aprobación colegiada del Pleno y publicación para control social (Ley 200-04).</li>
            </ul>
          </div>

          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Cpu className="w-4 h-4 text-amber-400" />
              <span>2. Capa de Aplicaciones & Microservicios</span>
            </h3>
            <p className="text-slate-300 leading-relaxed">
              Arquitectura distribuida en contenedores Docker y orquestación Kubernetes con API Gateway:
            </p>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <span className="p-2 rounded bg-slate-950 border border-slate-800 text-blue-300">audit-service</span>
              <span className="p-2 rounded bg-slate-950 border border-slate-800 text-amber-300">finding-service</span>
              <span className="p-2 rounded bg-slate-950 border border-slate-800 text-emerald-300">evidence-service</span>
              <span className="p-2 rounded bg-slate-950 border border-slate-800 text-rose-300">reply-service</span>
              <span className="p-2 rounded bg-slate-950 border border-slate-800 text-purple-300">blockchain-service</span>
              <span className="p-2 rounded bg-slate-950 border border-slate-800 text-cyan-300">ai-gemini-service</span>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>3. Seguridad Zero Trust & Cumplimiento Normativo</span>
            </h3>
            <p className="text-slate-300 leading-relaxed">
              Cumplimiento estricto con los marcos dominicanos e internacionales:
            </p>
            <div className="space-y-1.5 text-slate-300">
              <div>• <strong>ISO/IEC 27001 & ISO 27701:</strong> Gestión de Seguridad de Información y Privacidad.</div>
              <div>• <strong>Ley 126-02:</strong> Comercio Electrónico, Documentos y Firmas Digitales con certificación INDOTEL.</div>
              <div>• <strong>Ley 172-13:</strong> Protección Integral de Datos Personales y Habeas Data.</div>
              <div>• <strong>NORTIC A2, A3, E1:</strong> Interoperabilidad, Datos Abiertos y Portales Web del Gobierno Dominicano.</div>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Server className="w-4 h-4 text-purple-400" />
              <span>4. Arquitectura Tecnológica & Nodos de Red</span>
            </h3>
            <p className="text-slate-300 leading-relaxed">
              Red permisionada <strong>Hyperledger Fabric v2.5</strong> con consenso Raft BFT entre 6 nodos estatales:
            </p>
            <div className="space-y-1 font-mono text-[11px] text-slate-400">
              <div>• <strong>peer0.ccrd.gob.do:</strong> Anchor Peer - Cámara de Cuentas</div>
              <div>• <strong>peer0.contraloria.gob.do:</strong> Endorsing Peer - Contraloría General</div>
              <div>• <strong>peer0.dgcp.gob.do:</strong> Endorsing Peer - Compras Públicas</div>
              <div>• <strong>peer0.digeig.gob.do:</strong> Commit Peer - Ética Gubernamental</div>
              <div>• <strong>peer0.hacienda.gob.do:</strong> Commit Peer - Ministerio de Hacienda</div>
              <div>• <strong>peer0.presidencia.gob.do:</strong> Read-Only Peer - Presidencia</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: PostgreSQL DDL */}
      {activeTab === 'postgres' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-400" />
              <span>Script DDL Completo PostgreSQL v16 (Modelo Relacional de Auditoría)</span>
            </h3>
            <button
              onClick={() => handleCopy('postgres', POSTGRES_DDL)}
              className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1"
            >
              {copiedSection === 'postgres' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSection === 'postgres' ? 'Copiado' : 'Copiar DDL'}</span>
            </button>
          </div>
          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-blue-300 overflow-x-auto max-h-[500px]">
            {POSTGRES_DDL}
          </pre>
        </div>
      )}

      {/* Tab 3: Hyperledger Chaincode Go */}
      {activeTab === 'chaincode' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileCode className="w-4 h-4 text-amber-400" />
              <span>Smart Contract Chaincode (FindingContract.go)</span>
            </h3>
            <button
              onClick={() => handleCopy('chaincode', CHAINCODE_GO)}
              className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1"
            >
              {copiedSection === 'chaincode' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSection === 'chaincode' ? 'Copiado' : 'Copiar Go'}</span>
            </button>
          </div>
          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-amber-300 overflow-x-auto max-h-[500px]">
            {CHAINCODE_GO}
          </pre>
        </div>
      )}

      {/* Tab 4: Terraform IaC */}
      {activeTab === 'infra' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Box className="w-4 h-4 text-purple-400" />
              <span>Infraestructura como Código (Terraform Azure Government / AKS)</span>
            </h3>
            <button
              onClick={() => handleCopy('infra', TERRAFORM_IAC)}
              className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1"
            >
              {copiedSection === 'infra' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSection === 'infra' ? 'Copiado' : 'Copiar HCL'}</span>
            </button>
          </div>
          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-[500px]">
            {TERRAFORM_IAC}
          </pre>
        </div>
      )}
    </div>
  );
};
