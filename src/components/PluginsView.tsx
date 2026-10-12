import React, { useState } from 'react';
import {
  Cpu,
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Shield,
  Download,
  Globe2,
  RefreshCw,
  Power,
  X,
  Award,
} from 'lucide-react';
import { TechnologicalPlugin, BrandingConfig } from '../types';

interface PluginsViewProps {
  plugins: TechnologicalPlugin[];
  onAddPlugin: (plugin: TechnologicalPlugin) => void;
  onUpdatePlugin: (plugin: TechnologicalPlugin) => void;
  onDeletePlugin: (pluginId: string) => void;
  onRunAIOptimizer: () => Promise<void>;
  branding: BrandingConfig;
  onDownloadZip: () => void;
  onPublishOnline: () => void;
  isAiOptimizing: boolean;
}

export const PluginsView: React.FC<PluginsViewProps> = ({
  plugins,
  onAddPlugin,
  onUpdatePlugin,
  onDeletePlugin,
  onRunAIOptimizer,
  branding,
  onDownloadZip,
  onPublishOnline,
  isAiOptimizing,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPlugin, setEditingPlugin] = useState<TechnologicalPlugin | null>(null);

  // Form state
  const [pName, setPName] = useState('');
  const [pVersion, setPVersion] = useState('v1.0.0');
  const [pCategory, setPCategory] = useState<TechnologicalPlugin['categoria']>('Auditoría Forense');
  const [pDescription, setPDescription] = useState('');
  const [pMejora, setPMejora] = useState('Optimización heurística de comprobación cruzada');
  const [pImpact, setPImpact] = useState<TechnologicalPlugin['impacto']>('Alto');

  const handleOpenCreate = () => {
    setPName('');
    setPVersion('v1.0.0');
    setPCategory('Auditoría Forense');
    setPDescription('');
    setPMejora('Detección automática de anomalías presupuestarias');
    setPImpact('Alto');
    setEditingPlugin(null);
    setShowCreateModal(true);
  };

  const handleOpenEdit = (p: TechnologicalPlugin) => {
    setPName(p.nombre);
    setPVersion(p.version);
    setPCategory(p.categoria);
    setPDescription(p.descripcion);
    setPMejora(p.mejora_ia);
    setPImpact(p.impacto);
    setEditingPlugin(p);
    setShowCreateModal(true);
  };

  const handleSavePlugin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName || !pDescription) return;

    if (editingPlugin) {
      onUpdatePlugin({
        ...editingPlugin,
        nombre: pName,
        version: pVersion,
        categoria: pCategory,
        descripcion: pDescription,
        mejora_ia: pMejora,
        impacto: pImpact,
        ultima_actualizacion: new Date().toLocaleString('es-DO'),
      });
    } else {
      const newP: TechnologicalPlugin = {
        id: 'plug-' + Date.now(),
        nombre: pName,
        version: pVersion,
        categoria: pCategory,
        descripcion: pDescription,
        activo: true,
        ultima_actualizacion: new Date().toLocaleString('es-DO'),
        mejora_ia: pMejora,
        impacto: pImpact,
      };
      onAddPlugin(newP);
    }
    setShowCreateModal(false);
  };

  const handleToggleActive = (p: TechnologicalPlugin) => {
    onUpdatePlugin({
      ...p,
      activo: !p.activo,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-blue-900/60 rounded-2xl p-6 shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/50 border border-blue-700/60 text-xs font-semibold text-blue-300">
            <Cpu className="w-3.5 h-3.5 text-amber-400" />
            <span>Motor Tecnológico & Complementos con IA Gemini</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Complementos Tecnológicos & Auto-Actualización del Sistema
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Módulos de auditoría forense, algoritmos de fraccionamiento, conectores DGCP y hardening Zero Trust que se autoverifican y optimizan con Inteligencia Artificial al iniciar el sistema.
          </p>
          <div className="flex items-center gap-2 pt-1 font-mono text-[11px] text-amber-400">
            <span>Firma: {branding.companyName}</span>
            <span>•</span>
            <span>Soporte: {branding.developerName} ({branding.developerContact})</span>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onRunAIOptimizer}
            disabled={isAiOptimizing}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-amber-500/25 disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 ${isAiOptimizing ? 'animate-spin' : ''}`} />
            <span>{isAiOptimizing ? 'Optimizando con Gemini...' : 'Auto-Optimizar con IA'}</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-md shadow-blue-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Complemento</span>
          </button>

          <button
            onClick={onDownloadZip}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-md shadow-emerald-600/30"
            title="Descargar paquete completo ZIP"
          >
            <Download className="w-4 h-4" />
            <span>Descargar ZIP</span>
          </button>

          <button
            onClick={onPublishOnline}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-md shadow-purple-600/30"
            title="Publicar online y compartir enlace"
          >
            <Globe2 className="w-4 h-4" />
            <span>Publicar Online</span>
          </button>
        </div>
      </div>

      {/* Plugins Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plugins.map((plugin) => (
          <div
            key={plugin.id}
            className={`p-5 rounded-xl border transition-all flex flex-col justify-between space-y-4 shadow-lg ${
              plugin.activo
                ? 'bg-slate-900 border-slate-800 hover:border-blue-500/50'
                : 'bg-slate-950/60 border-slate-800/60 opacity-60'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/60">
                  {plugin.version}
                </span>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    plugin.impacto === 'Crítico'
                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                      : 'bg-blue-950 text-blue-300 border border-blue-800'
                  }`}>
                    {plugin.impacto}
                  </span>
                  <button
                    onClick={() => handleToggleActive(plugin)}
                    className={`p-1 rounded-md transition-colors ${
                      plugin.activo
                        ? 'text-emerald-400 hover:bg-emerald-950'
                        : 'text-slate-500 hover:bg-slate-800'
                    }`}
                    title={plugin.activo ? 'Desactivar complemento' : 'Activar complemento'}
                  >
                    <Power className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">
                  {plugin.categoria}
                </span>
                <h3 className="text-sm font-bold text-white mt-0.5">{plugin.nombre}</h3>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {plugin.descripcion}
              </p>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                <span className="text-amber-400 font-bold block flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Mejora IA Automatizada:</span>
                </span>
                <p className="text-slate-300 leading-normal">{plugin.mejora_ia}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-[10px] text-slate-500 font-mono">
                Actualizado: {plugin.ultima_actualizacion.split(' ')[0]}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(plugin)}
                  className="p-1 text-slate-400 hover:text-white rounded"
                  title="Editar complemento"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDeletePlugin(plugin.id)}
                  className="p-1 text-slate-400 hover:text-rose-400 rounded"
                  title="Eliminar complemento"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Create/Edit Plugin */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-amber-400" />
                <span>{editingPlugin ? 'Editar Complemento Tecnológico' : 'Crear Nuevo Complemento Tecnológico'}</span>
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlugin} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1">Nombre del Complemento</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Detector de Fraccionamiento de Compras"
                    value={pName}
                    onChange={(e) => setPName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Versión</label>
                  <input
                    type="text"
                    required
                    value={pVersion}
                    onChange={(e) => setPVersion(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Categoría</label>
                  <select
                    value={pCategory}
                    onChange={(e) => setPCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                  >
                    <option value="Auditoría Forense">Auditoría Forense</option>
                    <option value="Seguridad Zero Trust">Seguridad Zero Trust</option>
                    <option value="Interoperabilidad DGCP">Interoperabilidad DGCP</option>
                    <option value="Motor IA Gemini">Motor IA Gemini</option>
                    <option value="Cumplimiento Normativo">Cumplimiento Normativo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nivel de Impacto</label>
                  <select
                    value={pImpact}
                    onChange={(e) => setPImpact(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                  >
                    <option value="Alto">Alto</option>
                    <option value="Crítico">Crítico</option>
                    <option value="Estratégico">Estratégico</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Descripción de Funcionalidad</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detalla qué hace este módulo y cómo fortalece el ecosistema..."
                  value={pDescription}
                  onChange={(e) => setPDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Mejora u Optimización con IA</label>
                <textarea
                  rows={2}
                  value={pMejora}
                  onChange={(e) => setPMejora(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-600/30"
                >
                  Guardar Complemento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
