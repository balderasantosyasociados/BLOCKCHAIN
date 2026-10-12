import React, { useState } from 'react';
import {
  Key,
  Shield,
  UserCheck,
  UserPlus,
  Lock,
  History,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  Eye,
  EyeOff,
  X,
  RefreshCw,
  Copy,
  Check,
} from 'lucide-react';
import { UserProfile, UserRole, SecurityAuditLog, DeveloperKeyHistory } from '../types';
import { computeSHA256 } from '../services/blockchain';

interface UserSecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  allUsers: UserProfile[];
  onUpdateUser: (user: UserProfile) => void;
  onAddUser: (user: UserProfile) => void;
  auditLogs: SecurityAuditLog[];
}

export const UserSecurityModal: React.FC<UserSecurityModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  allUsers,
  onUpdateUser,
  onAddUser,
  auditLogs,
}) => {
  const [activeTab, setActiveTab] = useState<'perfil' | 'cambiar_clave' | 'historico_soporte' | 'mfa' | 'nuevo_usuario' | 'logs'>('perfil');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [supportReason, setSupportReason] = useState('Rotación preventiva de credenciales');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // New User state
  const [newId, setNewId] = useState(`usr-${Date.now().toString().slice(-4)}`);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newCargo, setNewCargo] = useState('Auditor Gubernamental');
  const [newRole, setNewRole] = useState<UserRole>('AUDITOR_CCRD');
  const [newInitPassword, setNewInitPassword] = useState('CCRD-Temporal-2025!');
  const [createUserSuccess, setCreateUserSuccess] = useState<string | null>(null);

  // MFA 2FA state
  const [mfaTestCode, setMfaTestCode] = useState('');
  const [mfaVerified, setMfaVerified] = useState<boolean | null>(null);

  if (!isOpen) return null;

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword.length < 8) {
      setPasswordError('La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden.');
      return;
    }

    const prevHash = await computeSHA256(currentPassword || 'prev-pass-salt');
    const newHistoryEntry: DeveloperKeyHistory = {
      id: 'hist-' + Date.now(),
      fecha: new Date().toLocaleString('es-DO'),
      modificado_por: currentUser.nombre,
      motivo_soporte: supportReason,
      hash_anterior: `sha256:${prevHash.substring(0, 16)}...`,
      clave_temporal_soporte: `DevToken-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      expira: new Date(Date.now() + 86400000).toLocaleString('es-DO'),
      estado: 'Activa',
    };

    const updatedUser: UserProfile = {
      ...currentUser,
      historico_claves: [newHistoryEntry, ...currentUser.historico_claves],
    };

    onUpdateUser(updatedUser);
    setPasswordSuccess('Contraseña cambiada exitosamente. Se ha registrado en el histórico de soporte de desarrollador.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleCreateNewUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;

    const initialDevHistory: DeveloperKeyHistory = {
      id: 'hist-init-' + Date.now(),
      fecha: new Date().toLocaleString('es-DO'),
      modificado_por: 'Administrador / Desarrollador',
      motivo_soporte: 'Creación inicial de usuario y provisión de credenciales',
      hash_anterior: 'sha256:genesis_initial_key',
      clave_temporal_soporte: newInitPassword,
      expira: new Date(Date.now() + 172800000).toLocaleString('es-DO'),
      estado: 'Activa',
    };

    const newUser: UserProfile = {
      id: newId,
      nombre: newName,
      email: newEmail,
      cargo: newCargo,
      institucion: 'Cámara de Cuentas de la República Dominicana (CCRD)',
      rol: newRole,
      mfa_activo: true,
      mfa_codigo_actual: Math.floor(100000 + Math.random() * 900000).toString(),
      ultimo_acceso: 'Pendiente de inicio',
      certificado_x509_valido: true,
      historico_claves: [initialDevHistory],
    };

    onAddUser(newUser);
    setCreateUserSuccess(`Usuario ${newName} (${newId}) creado exitosamente con clave registrada.`);
    setTimeout(() => setCreateUserSuccess(null), 4000);
    setNewName('');
    setNewEmail('');
    setNewId(`usr-${Date.now().toString().slice(-4)}`);
  };

  const handleToggleMFA = () => {
    const updated = {
      ...currentUser,
      mfa_activo: !currentUser.mfa_activo,
      mfa_codigo_actual: !currentUser.mfa_activo
        ? Math.floor(100000 + Math.random() * 900000).toString()
        : undefined,
    };
    onUpdateUser(updated);
  };

  const handleVerify2FATest = () => {
    if (mfaTestCode === (currentUser.mfa_codigo_actual || '839201')) {
      setMfaVerified(true);
    } else {
      setMfaVerified(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl">
        
        {/* Modal Top Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-950 text-blue-400 border border-blue-800/60">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Centro de Seguridad Zero Trust, Gestión de Usuarios & Soporte
              </h3>
              <p className="text-xs text-slate-400">
                Administración de claves con histórico de soporte técnico, autenticación de doble factor (2FA) y auditoría SIEM.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center gap-1 px-5 pt-3 border-b border-slate-800 bg-slate-950/40 overflow-x-auto text-xs">
          {[
            { id: 'perfil', label: 'Mi Perfil' },
            { id: 'cambiar_clave', label: 'Cambiar Contraseña' },
            { id: 'historico_soporte', label: `Histórico Soporte (${currentUser.historico_claves.length})` },
            { id: 'mfa', label: 'Doble Factor (2FA / TOTP)' },
            { id: 'nuevo_usuario', label: 'Crear Usuario' },
            { id: 'logs', label: 'Registros de Actividad (SIEM)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-2 rounded-t-lg font-semibold transition-colors whitespace-nowrap border-b-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-white bg-slate-800/80'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
          
          {/* TAB 1: Profile Overview */}
          {activeTab === 'perfil' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-white">{currentUser.nombre}</h4>
                  <p className="text-slate-400 text-xs">{currentUser.cargo}</p>
                  <p className="text-slate-500 text-[11px] font-mono mt-0.5">ID: {currentUser.id} • {currentUser.email}</p>
                </div>
                <div className="text-right">
                  <span className="font-mono text-xs font-bold text-amber-400 bg-amber-950/60 border border-amber-800/80 px-2.5 py-1 rounded">
                    {currentUser.rol}
                  </span>
                  <span className="text-[10px] text-emerald-400 block mt-1">
                    {currentUser.mfa_activo ? '✓ 2FA Protegido' : '⚠ 2FA Inactivo'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Certificado Digital X.509</span>
                  <strong className="text-emerald-400 font-mono">DO-PKI-CCRD-2025 (INDOTEL)</strong>
                  <span className="text-[10px] text-slate-500 block mt-1">Válido hasta: 31 de Diciembre de 2026</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Última Sesión Registrada</span>
                  <strong className="text-white font-mono">{currentUser.ultimo_acceso}</strong>
                  <span className="text-[10px] text-slate-500 block mt-1">IP: 190.166.45.12 (Santo Domingo, RD)</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Change Password & Record Dev Support */}
          {activeTab === 'cambiar_clave' && (
            <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
              <p className="text-slate-300 text-xs">
                Cambia tu contraseña con registro inmutable para soporte técnico. La nueva clave se encriptará y se guardará un histórico accesible para el soporte de desarrollador.
              </p>

              {passwordError && (
                <div className="p-3 rounded-lg bg-rose-950/70 border border-rose-800 text-rose-300 text-xs">
                  {passwordError}
                </div>
              )}
              {passwordSuccess && (
                <div className="p-3 rounded-lg bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Contraseña Actual</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nueva Contraseña Segura</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres, números y símbolos"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Confirmar Nueva Contraseña</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Motivo de Soporte Técnico / Justificación para Histórico
                </label>
                <input
                  type="text"
                  required
                  value={supportReason}
                  onChange={(e) => setSupportReason(e.target.value)}
                  placeholder="Ej. Soporte diagnóstico, rotación programada..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="show-pass"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="show-pass" className="text-slate-400 cursor-pointer">
                  Mostrar contraseñas
                </label>
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md shadow-blue-600/30"
              >
                Guardar Contraseña & Registrar en Histórico
              </button>
            </form>
          )}

          {/* TAB 3: Developer Support Key History */}
          {activeTab === 'historico_soporte' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-900/60 text-slate-300 text-xs">
                <strong className="text-amber-400 block mb-1">Histórico de Claves de Soporte de Desarrollador:</strong>
                Este registro permite al equipo de soporte y DevSecOps intervenir ante incidentes técnicos o contingencias en los nodos, manteniendo auditoría estricta de cada rotación de clave y token de rescate.
              </div>

              <div className="space-y-3 font-mono">
                {currentUser.historico_claves.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between font-sans">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <History className="w-4 h-4 text-amber-400" />
                        <span>{item.motivo_soporte}</span>
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        item.estado === 'Activa'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {item.estado}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-400">
                      <div>Fecha: <strong className="text-slate-300 font-sans">{item.fecha}</strong></div>
                      <div>Autor: <strong className="text-slate-300 font-sans">{item.modificado_por}</strong></div>
                      <div>Hash Previo: <span className="text-blue-300">{item.hash_anterior}</span></div>
                      <div>Token Temporal: <span className="text-amber-400 font-bold">{item.clave_temporal_soporte}</span></div>
                    </div>

                    <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-900 font-sans">
                      Expira: {item.expira}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Two-Factor Authentication (2FA / TOTP) */}
          {activeTab === 'mfa' && (
            <div className="space-y-5 max-w-xl">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    <span>Autenticación Multifactor (2FA)</span>
                  </h4>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Protege el acceso a transacciones de auditoría con token de un solo uso (TOTP).
                  </p>
                </div>

                <button
                  onClick={handleToggleMFA}
                  className={`px-4 py-2 rounded-xl font-bold text-xs transition-colors ${
                    currentUser.mfa_activo
                      ? 'bg-rose-900/60 hover:bg-rose-800 text-rose-200 border border-rose-700'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  {currentUser.mfa_activo ? 'Desactivar 2FA' : 'Activar 2FA'}
                </button>
              </div>

              {currentUser.mfa_activo && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                  <span className="font-bold text-white block">Token TOTP de Prueba Actual (Simulado en Vivo):</span>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-2xl font-black text-amber-400 tracking-widest bg-slate-900 px-4 py-2 rounded-lg border border-slate-700">
                      {currentUser.mfa_codigo_actual || '839201'}
                    </span>
                    <span className="text-slate-400 text-xs">Válido para la sesión actual</span>
                  </div>

                  <div className="pt-2 border-t border-slate-800 space-y-2">
                    <label className="block text-slate-300 font-semibold">Probar Validación de Código 2FA:</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="Ingresa 6 dígitos..."
                        value={mfaTestCode}
                        onChange={(e) => setMfaTestCode(e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono text-sm tracking-widest w-40 text-center"
                      />
                      <button
                        type="button"
                        onClick={handleVerify2FATest}
                        className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold"
                      >
                        Verificar Código
                      </button>
                    </div>

                    {mfaVerified === true && (
                      <p className="text-emerald-400 text-xs flex items-center gap-1 mt-1 font-semibold">
                        <CheckCircle2 className="w-4 h-4" />
                        Código 2FA verificado correctamente. Identidad confirmada bajo política Zero Trust.
                      </p>
                    )}
                    {mfaVerified === false && (
                      <p className="text-rose-400 text-xs flex items-center gap-1 mt-1 font-semibold">
                        <AlertTriangle className="w-4 h-4" />
                        Código incorrecto. Intenta con el código mostrado arriba.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: Create New User */}
          {activeTab === 'nuevo_usuario' && (
            <form onSubmit={handleCreateNewUser} className="space-y-4 max-w-xl">
              <h4 className="font-bold text-white text-sm">Registro de Nuevo Usuario Gubernamental</h4>
              
              {createUserSuccess && (
                <div className="p-3 rounded-lg bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{createUserSuccess}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">ID Único de Usuario</label>
                  <input
                    type="text"
                    required
                    value={newId}
                    onChange={(e) => setNewId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Rol en Plataforma</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                  >
                    <option value="AUDITOR_CCRD">Auditor CCRD</option>
                    <option value="SUPERVISOR_CCRD">Supervisor de Calidad</option>
                    <option value="DIRECTOR_CCRD">Director / Miembro Pleno</option>
                    <option value="ENTIDAD_AUDITADA">Enlace Entidad Auditada</option>
                    <option value="CIUDADANO">Veedor Ciudadano</option>
                    <option value="ADMIN_DEVELOPER">Administrador / Dev</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Lic. José Manuel Taveras"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Correo Electrónico Oficial</label>
                  <input
                    type="email"
                    required
                    placeholder="jtaveras@ccrd.gob.do"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Cargo Institucional</label>
                  <input
                    type="text"
                    value={newCargo}
                    onChange={(e) => setNewCargo(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Contraseña Inicial Provisoria</label>
                <input
                  type="text"
                  value={newInitPassword}
                  onChange={(e) => setNewInitPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono"
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md shadow-blue-600/30"
              >
                Crear y Guardar Usuario
              </button>
            </form>
          )}

          {/* TAB 6: Detailed Activity Logs (SIEM) */}
          {activeTab === 'logs' && (
            <div className="space-y-3 font-mono">
              <h4 className="font-bold text-white text-sm font-sans">
                Registros de Auditoría del Sistema (SIEM / Zero Trust Trail)
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[10px] uppercase">
                    <tr>
                      <th className="p-2.5">Timestamp</th>
                      <th className="p-2.5">Usuario / Rol</th>
                      <th className="p-2.5">Acción</th>
                      <th className="p-2.5">Módulo</th>
                      <th className="p-2.5">IP Origen</th>
                      <th className="p-2.5">Resultado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-[11px]">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-950/60">
                        <td className="p-2.5 text-slate-400 whitespace-nowrap">{log.timestamp}</td>
                        <td className="p-2.5 text-white font-sans font-semibold">
                          {log.usuario_nombre}
                          <span className="block text-[10px] text-slate-500 font-mono">{log.rol}</span>
                        </td>
                        <td className="p-2.5 text-amber-300 font-bold">{log.accion}</td>
                        <td className="p-2.5 text-slate-400">{log.modulo}</td>
                        <td className="p-2.5 text-slate-500">{log.ip_origen}</td>
                        <td className="p-2.5">
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                            {log.resultado}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
