import { BlockchainBlock, BlockchainTransaction, PeerNode } from '../types';

// Real cryptographic hashing using the browser's Web Crypto API
export async function computeSHA256(data: string | ArrayBuffer): Promise<string> {
  const encoder = new TextEncoder();
  const buffer = typeof data === 'string' ? encoder.encode(data) : data;
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function computeSHA512(data: string | ArrayBuffer): Promise<string> {
  const encoder = new TextEncoder();
  const buffer = typeof data === 'string' ? encoder.encode(data) : data;
  const hashBuffer = await crypto.subtle.digest('SHA-512', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function generateUUID(): string {
  return crypto.randomUUID ? crypto.randomUUID() : 'tx-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Government Hyperledger Fabric Nodes (CCRD, Contraloria, DGCP, DIGEIG, Hacienda, Presidencia)
export const HYPERLEDGER_PEERS: PeerNode[] = [
  {
    id: 'peer0-ccrd',
    nombre: 'peer0.ccrd.gob.do',
    endpoint: 'grpcs://peer0.ccrd.gob.do:7051',
    institucion: 'Cámara de Cuentas de la República Dominicana',
    rol_red: 'Anchor Peer (Líder)',
    estado: 'ONLINE',
    bloques_sincronizados: 1048,
    latencia_ms: 12,
    certificado_tls: 'CCRD-CA-X509-ROOT-2025-V3',
  },
  {
    id: 'peer0-contraloria',
    nombre: 'peer0.contraloria.gob.do',
    endpoint: 'grpcs://peer0.contraloria.gob.do:7051',
    institucion: 'Contraloría General de la República',
    rol_red: 'Endorsing Peer',
    estado: 'ONLINE',
    bloques_sincronizados: 1048,
    latencia_ms: 18,
    certificado_tls: 'CGR-CA-X509-ROOT-2025-V2',
  },
  {
    id: 'peer0-dgcp',
    nombre: 'peer0.dgcp.gob.do',
    endpoint: 'grpcs://peer0.dgcp.gob.do:7051',
    institucion: 'Dirección General de Contrataciones Públicas',
    rol_red: 'Endorsing Peer',
    estado: 'ONLINE',
    bloques_sincronizados: 1048,
    latencia_ms: 15,
    certificado_tls: 'DGCP-CA-X509-ROOT-2025-V1',
  },
  {
    id: 'peer0-digeig',
    nombre: 'peer0.digeig.gob.do',
    endpoint: 'grpcs://peer0.digeig.gob.do:7051',
    institucion: 'Dirección General de Ética e Integridad Gubernamental',
    rol_red: 'Commit Peer',
    estado: 'ONLINE',
    bloques_sincronizados: 1048,
    latencia_ms: 22,
    certificado_tls: 'DIGEIG-CA-X509-ROOT-2025-V1',
  },
  {
    id: 'peer0-hacienda',
    nombre: 'peer0.hacienda.gob.do',
    endpoint: 'grpcs://peer0.hacienda.gob.do:7051',
    institucion: 'Ministerio de Hacienda de la República Dominicana',
    rol_red: 'Commit Peer',
    estado: 'ONLINE',
    bloques_sincronizados: 1048,
    latencia_ms: 19,
    certificado_tls: 'MH-CA-X509-ROOT-2025-V2',
  },
  {
    id: 'peer0-presidencia',
    nombre: 'peer0.presidencia.gob.do',
    endpoint: 'grpcs://peer0.presidencia.gob.do:7051',
    institucion: 'Presidencia de la República Dominicana',
    rol_red: 'Auditor Read-Only Peer',
    estado: 'ONLINE',
    bloques_sincronizados: 1048,
    latencia_ms: 14,
    certificado_tls: 'PR-CA-X509-ROOT-2025-V3',
  },
];

// In-Memory Ledger Store that simulates Hyperledger Fabric
class HyperledgerFabricService {
  private blocks: BlockchainBlock[] = [];
  private transactions: BlockchainTransaction[] = [];
  private currentBlockNumber = 1045;

  constructor() {
    this.seedInitialBlocks();
  }

  private seedInitialBlocks() {
    const tx1: BlockchainTransaction = {
      tx_id: 'tx-ccrd-89a1f24d310e9c8a',
      block_number: 1045,
      timestamp: '2025-05-10T14:32:00Z',
      accion: 'CREAR_AUDITORIA',
      usuario: 'lic.pbaldera@ccrd.gob.do',
      rol: 'AUDITOR_CCRD',
      nodo_peer: 'peer0.ccrd.gob.do',
      payload_hash: '3a7f82b1c099e234da1909a15f0123cbef9012389a0123bcdef0123456789abc',
      smart_contract: 'AuditChaincode:CreateAudit',
      estado: 'COMMITTED',
      detalles: 'Apertura de Auditoría Integral CCRD-AUD-2025-014 en MINERD',
    };

    const block1045: BlockchainBlock = {
      block_number: 1045,
      block_hash: '0000a941f71c4e2098bc9123849182390aef912830918239012830918239012a',
      previous_hash: '00009812bc812903801928309128309128309128309182309182309182309182',
      merkle_root: '9f83a71b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f',
      timestamp: '2025-05-10T14:32:05Z',
      tx_count: 1,
      validator_peer: 'peer0.ccrd.gob.do',
      size_kb: 4.8,
      transacciones: [tx1],
    };

    const tx2: BlockchainTransaction = {
      tx_id: 'tx-ccrd-c91823abf0129384',
      block_number: 1046,
      timestamp: '2025-05-14T10:15:22Z',
      accion: 'CREAR_HALLAZGO',
      usuario: 'lic.pbaldera@ccrd.gob.do',
      rol: 'AUDITOR_CCRD',
      nodo_peer: 'peer0.ccrd.gob.do',
      payload_hash: '7c82a1b9f029384cdef90123849123840192830918230918230918230918230a',
      smart_contract: 'FindingChaincode:CreateFinding',
      estado: 'COMMITTED',
      detalles: 'Hallazgo HAL-01-MINERD: Fraccionamiento de Compras Ley 340-06',
    };

    const tx3: BlockchainTransaction = {
      tx_id: 'tx-ccrd-e891230491820391',
      block_number: 1046,
      timestamp: '2025-05-14T10:18:40Z',
      accion: 'REGISTRAR_EVIDENCIA',
      usuario: 'lic.pbaldera@ccrd.gob.do',
      rol: 'AUDITOR_CCRD',
      nodo_peer: 'peer0.dgcp.gob.do',
      payload_hash: 'bf8912830918230918230918230918230918230918230918230918230918230b',
      smart_contract: 'EvidenceChaincode:RegisterEvidence',
      estado: 'COMMITTED',
      detalles: 'Evidencia EVI-01: Órdenes de Compra Menor No. 4501-4512 sin concurso',
    };

    const block1046: BlockchainBlock = {
      block_number: 1046,
      block_hash: '0000b81923801928301928309182309182309182309182309182309182309183',
      previous_hash: block1045.block_hash,
      merkle_root: '2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d',
      timestamp: '2025-05-14T10:20:00Z',
      tx_count: 2,
      validator_peer: 'peer0.dgcp.gob.do',
      size_kb: 7.2,
      transacciones: [tx2, tx3],
    };

    const tx4: BlockchainTransaction = {
      tx_id: 'tx-minerd-8129038109283019',
      block_number: 1047,
      timestamp: '2025-05-28T16:45:10Z',
      accion: 'RADICAR_REPLICA',
      usuario: 'consultoria.juridica@minerd.gob.do',
      rol: 'ENTIDAD_AUDITADA',
      nodo_peer: 'peer0.contraloria.gob.do',
      payload_hash: '8f9128309182309182309182309182309182309182309182309182309182304c',
      smart_contract: 'ReplyChaincode:RegisterReply',
      estado: 'COMMITTED',
      detalles: 'Descargo formal del MINERD alegando estado de urgencia escolar',
    };

    const block1047: BlockchainBlock = {
      block_number: 1047,
      block_hash: '0000c91823091823091823091823091823091823091823091823091823091824',
      previous_hash: block1046.block_hash,
      merkle_root: '3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e',
      timestamp: '2025-05-28T16:50:00Z',
      tx_count: 1,
      validator_peer: 'peer0.contraloria.gob.do',
      size_kb: 5.1,
      transacciones: [tx4],
    };

    this.blocks = [block1047, block1046, block1045];
    this.transactions = [tx4, tx3, tx2, tx1];
    this.currentBlockNumber = 1048;
  }

  public getBlocks(): BlockchainBlock[] {
    return [...this.blocks];
  }

  public getTransactions(): BlockchainTransaction[] {
    return [...this.transactions];
  }

  public async commitTransaction(
    action: BlockchainTransaction['accion'],
    usuario: string,
    rol: string,
    smartContract: string,
    detalles: string,
    payloadData: string
  ): Promise<{ tx: BlockchainTransaction; block: BlockchainBlock }> {
    const payloadHash = await computeSHA256(payloadData);
    const txId = 'tx-ccrd-' + (await computeSHA256(payloadHash + Date.now().toString())).substring(0, 16);
    const peer = HYPERLEDGER_PEERS[Math.floor(Math.random() * HYPERLEDGER_PEERS.length)].nombre;

    const tx: BlockchainTransaction = {
      tx_id: txId,
      block_number: this.currentBlockNumber,
      timestamp: new Date().toISOString(),
      accion: action,
      usuario,
      rol,
      nodo_peer: peer,
      payload_hash: payloadHash,
      smart_contract: smartContract,
      estado: 'COMMITTED',
      detalles,
    };

    const prevBlock = this.blocks[0];
    const prevHash = prevBlock ? prevBlock.block_hash : '0000000000000000000000000000000000000000000000000000000000000000';
    const blockHashRaw = `${this.currentBlockNumber}-${prevHash}-${txId}-${Date.now()}`;
    const blockHash = '0000' + (await computeSHA256(blockHashRaw)).substring(4);
    const merkleRoot = await computeSHA256(txId + payloadHash);

    const newBlock: BlockchainBlock = {
      block_number: this.currentBlockNumber,
      block_hash: blockHash,
      previous_hash: prevHash,
      merkle_root: merkleRoot,
      timestamp: new Date().toISOString(),
      tx_count: 1,
      validator_peer: peer,
      size_kb: parseFloat((3.5 + Math.random() * 4).toFixed(1)),
      transacciones: [tx],
    };

    this.currentBlockNumber++;
    this.blocks.unshift(newBlock);
    this.transactions.unshift(tx);

    return { tx, block: newBlock };
  }

  public verifyHash(hashToFind: string): {
    found: boolean;
    tx?: BlockchainTransaction;
    block?: BlockchainBlock;
  } {
    const clean = hashToFind.trim().toLowerCase();
    for (const block of this.blocks) {
      for (const tx of block.transacciones) {
        if (
          tx.payload_hash.toLowerCase() === clean ||
          tx.tx_id.toLowerCase() === clean ||
          block.block_hash.toLowerCase() === clean ||
          block.merkle_root.toLowerCase() === clean
        ) {
          return { found: true, tx, block };
        }
      }
    }
    return { found: false };
  }
}

export const blockchainService = new HyperledgerFabricService();
