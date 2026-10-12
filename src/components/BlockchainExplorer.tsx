import React, { useState } from 'react';
import {
  Layers,
  Shield,
  Search,
  CheckCircle2,
  Cpu,
  FileCode,
  Hash,
  Clock,
  Server,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  Upload,
  RefreshCw,
  Copy,
  Check,
} from 'lucide-react';
import { BlockchainBlock, BlockchainTransaction, PeerNode } from '../types';
import { blockchainService, HYPERLEDGER_PEERS, computeSHA256, computeSHA512 } from '../services/blockchain';

interface BlockchainExplorerProps {
  blocks: BlockchainBlock[];
  transactions: BlockchainTransaction[];
}

export const BlockchainExplorer: React.FC<BlockchainExplorerProps> = ({
  blocks,
  transactions,
}) => {
  const [activeTab, setActiveTab] = useState<'blocks' | 'transactions' | 'chaincode' | 'verify'>('blocks');
  const [selectedBlock, setSelectedBlock] = useState<BlockchainBlock | null>(blocks[0] || null);
  const [selectedTx, setSelectedTx] = useState<BlockchainTransaction | null>(transactions[0] || null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // File verification
  const [dragActive, setDragActive] = useState(false);
  const [verifiedFile, setVerifiedFile] = useState<{
    name: string;
    size: number;
    sha256: string;
    sha512: string;
    isOnChain: boolean;
    tx?: BlockchainTransaction;
    block?: BlockchainBlock;
  } | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2500);
  };

  const handleFileProcess = async (file: File) => {
    const buffer = await file.arrayBuffer();
    const sha256 = await computeSHA256(buffer);
    const sha512 = await computeSHA512(buffer);

    const check = blockchainService.verifyHash(sha256);

    setVerifiedFile({
      name: file.name,
      size: file.size,
      sha256,
      sha512,
      isOnChain: check.found,
      tx: check.tx,
      block: check.block,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-white">
              Explorador Hyperledger Fabric • Red Permisionada del Estado Dominicano
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Topología multi-nodo de validación cruzada entre Cámara de Cuentas, Contraloría, DGCP, DIGEIG, Hacienda y Presidencia.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('blocks')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'blocks' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Bloques ({blocks.length})
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'transactions' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Transacciones ({transactions.length})
          </button>
          <button
            onClick={() => setActiveTab('chaincode')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'chaincode' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Smart Contracts (Chaincode)
          </button>
          <button
            onClick={() => setActiveTab('verify')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'verify' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Verificar Archivo Local
          </button>
        </div>
      </div>

      {/* Peer Nodes Status Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {HYPERLEDGER_PEERS.map((node) => (
          <div
            key={node.id}
            className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 text-xs shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[9px] font-mono text-emerald-400 font-bold bg-emerald-950 px-1 py-0.2 rounded">
                {node.estado}
              </span>
            </div>
            <div className="font-mono font-bold text-white text-[11px] truncate" title={node.nombre}>
              {node.nombre.replace('.gob.do', '')}
            </div>
            <div className="text-[10px] text-slate-400 truncate" title={node.institucion}>
              {node.institucion}
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-800">
              <span>{node.latencia_ms} ms</span>
              <span>Blk #{node.bloques_sincronizados}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Tab 1: Blocks Explorer */}
      {activeTab === 'blocks' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-800">
              Bloques Recientes en Ledger
            </h3>

            <div className="space-y-2">
              {blocks.map((b) => {
                const isSelected = selectedBlock?.block_number === b.block_number;
                return (
                  <button
                    key={b.block_number}
                    onClick={() => setSelectedBlock(b)}
                    className={`w-full text-left p-3 rounded-xl border transition-all text-xs space-y-1.5 ${
                      isSelected
                        ? 'bg-blue-600/20 border-blue-500 text-white shadow-md'
                        : 'bg-slate-950/70 border-slate-800/80 text-slate-300 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-emerald-400">
                        Bloque #{b.block_number}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {b.tx_count} Tx{b.tx_count > 1 ? 's' : ''}
                      </span>
                    </div>

                    <div className="font-mono text-[10px] text-slate-400 truncate">
                      Hash: {b.block_hash.substring(0, 20)}...
                    </div>

                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>Peer: {b.validator_peer.replace('.gob.do', '')}</span>
                      <span>{b.size_kb} KB</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {selectedBlock && (
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4 text-xs font-mono">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-emerald-400" />
                  <span>Detalle de Bloque #{selectedBlock.block_number}</span>
                </h3>
                <span className="text-emerald-400 text-xs bg-emerald-950 px-2.5 py-1 rounded border border-emerald-800">
                  Consenso Raft BFT Válido
                </span>
              </div>

              <div className="space-y-2.5 bg-slate-950 p-4 rounded-xl border border-slate-800 break-all text-[11px]">
                <div>
                  <span className="text-slate-500 block text-[10px]">BLOCK HASH (SHA-256):</span>
                  <div className="flex items-center justify-between text-blue-300">
                    <span>{selectedBlock.block_hash}</span>
                    <button
                      onClick={() => copyToClipboard(selectedBlock.block_hash)}
                      className="p-1 hover:text-white"
                      title="Copiar"
                    >
                      {copiedText === selectedBlock.block_hash ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px]">PREVIOUS BLOCK HASH:</span>
                  <span className="text-slate-400">{selectedBlock.previous_hash}</span>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px]">MERKLE ROOT TREE HASH:</span>
                  <span className="text-amber-300">{selectedBlock.merkle_root}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-900 text-slate-300">
                  <div>
                    <span className="text-slate-500 block text-[10px]">TIMESTAMP RFC 3161:</span>
                    <span>{selectedBlock.timestamp}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">NODO NOTARIO VALIDADOR:</span>
                    <span>{selectedBlock.validator_peer}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-300 text-xs uppercase tracking-wider">
                  Transacciones en este Bloque ({selectedBlock.transacciones.length})
                </h4>
                {selectedBlock.transacciones.map((tx) => (
                  <div
                    key={tx.tx_id}
                    className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-amber-400 font-bold">{tx.accion}</span>
                      <span className="text-emerald-400 text-[10px] bg-emerald-950 px-2 py-0.2 rounded">
                        {tx.estado}
                      </span>
                    </div>
                    <div className="text-slate-300 font-sans">{tx.detalles}</div>
                    <div className="text-[10px] text-slate-500 flex justify-between">
                      <span>TxID: {tx.tx_id}</span>
                      <span>Smart Contract: {tx.smart_contract}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Transactions Explorer */}
      {activeTab === 'transactions' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4 text-xs">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Hash className="w-5 h-5 text-amber-400" />
            <span>Registro Inmutable de Transacciones (Ledger Global)</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono">
              <thead className="text-[10px] uppercase text-slate-400 bg-slate-950 border-b border-slate-800">
                <tr>
                  <th className="p-3">Tx ID</th>
                  <th className="p-3">Acción</th>
                  <th className="p-3">Bloque</th>
                  <th className="p-3">Usuario / Rol</th>
                  <th className="p-3">Nodo Endorser</th>
                  <th className="p-3">Smart Contract</th>
                  <th className="p-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {transactions.map((tx) => (
                  <tr key={tx.tx_id} className="hover:bg-slate-800/40 text-[11px]">
                    <td className="p-3 text-blue-400 font-bold">{tx.tx_id}</td>
                    <td className="p-3 text-amber-300 font-sans font-semibold">{tx.accion}</td>
                    <td className="p-3 text-slate-300">#{tx.block_number}</td>
                    <td className="p-3 text-slate-300 font-sans">{tx.usuario}</td>
                    <td className="p-3 text-slate-400">{tx.nodo_peer.replace('.gob.do', '')}</td>
                    <td className="p-3 text-slate-400">{tx.smart_contract}</td>
                    <td className="p-3">
                      <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                        {tx.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Smart Contracts (Chaincode) */}
      {activeTab === 'chaincode' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              name: 'FindingChaincode',
              version: 'v2.1.0',
              methods: ['CreateFinding()', 'UpdateFinding()', 'CloseFinding()', 'AssignFinding()'],
              description: 'Gestiona el ciclo de vida de los hallazgos de auditoría ISSAI. Enforza inmutabilidad de la condición, criterios legales de la Ley 10-04 y clasificación de riesgos.',
              lang: 'Go / Hyperledger Fabric Contract API',
            },
            {
              name: 'EvidenceChaincode',
              version: 'v1.4.2',
              methods: ['RegisterEvidence()', 'ValidateEvidence()', 'ArchiveEvidence()'],
              description: 'Registra los metadatos criptográficos (SHA-256, SHA-512, Timestamp RFC 3161 y Firma X.509) de los documentos almacenados en la bóveda digital.',
              lang: 'Go / Hyperledger Fabric Contract API',
            },
            {
              name: 'ReplyChaincode',
              version: 'v1.2.0',
              methods: ['RegisterReply()', 'ApproveReply()', 'RejectReply()'],
              description: 'Permite a las entidades gubernamentales auditadas radicar descargos legales en plazo perentorio con sellado inmutable de fecha y hora.',
              lang: 'TypeScript / Hyperledger Fabric Contract API',
            },
            {
              name: 'RecommendationChaincode',
              version: 'v1.3.1',
              methods: ['CreateRecommendation()', 'TrackRecommendation()', 'CloseRecommendation()'],
              description: 'Monitorea el plan de acción correctivo y el porcentaje de cumplimiento institucional, disparando alertas automáticas ante vencimiento de plazos.',
              lang: 'TypeScript / Hyperledger Fabric Contract API',
            },
          ].map((sc, i) => (
            <div key={i} className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCode className="w-5 h-5 text-blue-400" />
                  <span className="font-mono text-sm font-bold text-white">{sc.name}</span>
                </div>
                <span className="font-mono text-[10px] text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                  {sc.version}
                </span>
              </div>
              <p className="text-slate-300 leading-relaxed">{sc.description}</p>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Métodos Públicos:</span>
                <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
                  {sc.methods.map((m, idx) => (
                    <span key={idx} className="bg-slate-950 border border-slate-800 text-blue-300 px-2 py-0.5 rounded">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
              <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500 font-mono">
                Runtime: {sc.lang}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: Local File Verification Drag & Drop */}
      {activeTab === 'verify' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-5 text-xs">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-400" />
              <span>Verificación Forense de Archivos Locales (Cotejo contra Hyperledger Fabric)</span>
            </h3>
            <p className="text-slate-400 text-xs mt-1">
              Arrastra cualquier archivo desde tu computadora para calcular su hash SHA-256 y SHA-512 en el navegador en tiempo real y verificar si su cadena de custodia está intacta en la red.
            </p>
          </div>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              const file = e.dataTransfer.files?.[0];
              if (file) handleFileProcess(file);
            }}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors cursor-pointer ${
              dragActive
                ? 'border-emerald-400 bg-emerald-950/20'
                : 'border-slate-700 bg-slate-950/50 hover:border-slate-500'
            }`}
          >
            <Upload className="w-10 h-10 text-slate-500 mx-auto mb-3" />
            <p className="text-sm font-semibold text-white">
              Arrastra y suelta tu archivo aquí, o haz clic para examinar
            </p>
            <p className="text-slate-500 text-[11px] mt-1">
              Soporta PDF, Word (.docx), Excel (.xlsx), Imágenes, ZIP
            </p>
            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileProcess(file);
              }}
              className="hidden"
              id="file-verify-input"
            />
            <label
              htmlFor="file-verify-input"
              className="mt-4 inline-block px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer"
            >
              Seleccionar Archivo Local
            </label>
          </div>

          {verifiedFile && (
            <div className={`p-5 rounded-xl border space-y-3 font-mono animate-in fade-in ${
              verifiedFile.isOnChain
                ? 'bg-emerald-950/40 border-emerald-800'
                : 'bg-slate-950 border-slate-800'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm font-sans flex items-center gap-2">
                  <CheckCircle2 className={`w-5 h-5 ${verifiedFile.isOnChain ? 'text-emerald-400' : 'text-slate-500'}`} />
                  <span>{verifiedFile.name} ({(verifiedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                </span>
                <span className={`text-xs px-2.5 py-1 rounded font-bold ${
                  verifiedFile.isOnChain
                    ? 'bg-emerald-900 text-emerald-200 border border-emerald-700'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {verifiedFile.isOnChain ? 'DOCUMENTO VERIFICADO EN BLOCKCHAIN' : 'HASH NO COINCIDE EN LEDGER'}
                </span>
              </div>

              <div className="space-y-1.5 text-[11px] break-all">
                <div>
                  <span className="text-slate-500 block text-[10px]">HASH SHA-256 GENERADO:</span>
                  <span className="text-blue-300">{verifiedFile.sha256}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">HASH SHA-512 GENERADO:</span>
                  <span className="text-amber-300">{verifiedFile.sha512.substring(0, 64)}...</span>
                </div>
              </div>

              {verifiedFile.isOnChain && verifiedFile.tx && (
                <div className="pt-2 border-t border-emerald-900/60 text-[11px] text-emerald-300 space-y-1">
                  <div><strong>ID Transacción:</strong> {verifiedFile.tx.tx_id}</div>
                  <div><strong>Bloque #:</strong> {verifiedFile.block?.block_number}</div>
                  <div><strong>Fecha de Sellado RFC 3161:</strong> {verifiedFile.tx.timestamp}</div>
                  <div><strong>Nodo Notario:</strong> {verifiedFile.tx.nodo_peer}</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
