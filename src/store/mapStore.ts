import { create } from 'zustand';
import { MapState, ProblemNode, DependencyEdge, Zone } from '../model/types';
import { initialMap } from '../model/initialMap';
import { solveNodeLogic } from '../model/logic';
import { applyAgentDiscoveries, catalogExhausted, remainingCatalogCount } from '../model/agent';
import { auditMarkMissingTargets, fillMissingTargetFunctions } from '../model/audit';
import { isNodeAvailable } from '../model/access';
import { postJson } from '../model/apiClient';
import {
  hydrateInitialState,
  saveMapToDb,
  clearMapDb,
  exportMapJson,
  importMapJson,
} from '../model/persistence';

interface MapStore extends MapState {
  hydrated: boolean;
  filterDerivativesOnly: boolean;
  setFilterDerivativesOnly: (val: boolean) => void;
  solveNode: (nodeId: string) => Promise<void>;
  getLatexProof: (nodeId: string) => string | null;
  hydrate: () => Promise<void>;
  saveNow: () => Promise<boolean>;
  resetMap: () => Promise<void>;
  downloadJson: () => void;
  loadFromJson: (text: string) => Promise<boolean>;
  runAgentDiscovery: (anchorNodeId?: string) => Promise<{ added: number; error?: string }>;
  addCustomNode: (node: ProblemNode, parentId?: string, newZoneName?: string) => Promise<void>;
  catalogRemaining: () => number;
  isCatalogExhausted: () => boolean;
  runAuditMissingTargets: () => Promise<{ missingCount: number; demoted: number; missingIds: string[] }>;
  runFillMissingTargets: () => Promise<{ filled: number; failed: number; errors: string[]; filledIds: string[] }>;
  runDerivativeSearch: () => Promise<{ added: number; hits: number; error?: string }>;
}

function emptyState(): MapState {
  return {
    nodes: initialMap.nodes.map(n => ({ ...n, economic: { ...n.economic } })),
    edges: initialMap.edges.map(e => ({ ...e })),
    zones: initialMap.zones.map(z => ({
      ...z,
      nodeIds: [...z.nodeIds],
      economicProfile: { ...z.economicProfile },
    })),
    axioms: [...initialMap.axioms],
    proofs: { ...initialMap.proofs },
  };
}

export const useMapStore = create<MapStore>((set, get) => ({
  ...emptyState(),
  hydrated: false,
  filterDerivativesOnly: false,
  setFilterDerivativesOnly: (val: boolean) => set({ filterDerivativesOnly: val }),

  hydrate: async () => {
    if (get().hydrated) return;
    const state = await hydrateInitialState();
    set({ ...state, hydrated: true });
  },

  solveNode: async (nodeId: string) => {
    const state = get();
    const node = state.nodes.find(n => n.id === nodeId);
    if (!node || node.state === 'resolved' || state.proofs[nodeId]) {
      return;
    }
    if (!isNodeAvailable(node, state)) return;
    const newState = await solveNodeLogic(state, nodeId);
    set(newState);
    void saveMapToDb(newState);
  },

  getLatexProof: (nodeId: string) => {
    return get().proofs[nodeId]?.latex || null;
  },

  saveNow: async () => {
    return saveMapToDb(get());
  },

  resetMap: async () => {
    await clearMapDb();
    set({ ...emptyState(), hydrated: true });
  },

  downloadJson: () => {
    const state = get();
    let exportState: MapState = state;
    if (state.filterDerivativesOnly) {
      const filteredNodes = state.nodes.filter(n => n.type === 'derivative_claim');
      const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
      exportState = {
        ...state,
        nodes: filteredNodes,
        edges: state.edges.filter(e => filteredNodeIds.has(e.fromId) && filteredNodeIds.has(e.toId)),
      };
    }
    const json = exportMapJson(exportState);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ricis3-map-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  loadFromJson: async (text: string) => {
    const loaded = await importMapJson(text);
    if (!loaded) return false;
    set({ ...loaded, hydrated: true });
    return true;
  },

  catalogRemaining: () => remainingCatalogCount(get()),

  isCatalogExhausted: () => catalogExhausted(get()),

  addCustomNode: async (node, parentId, newZoneName) => {
    const state = get();
    let newZones = [...state.zones];
    let zoneId = node.zoneIds[0] || 'math';

    if (newZoneName) {
      const existingZone = newZones.find(z => z.name.toLowerCase() === newZoneName.toLowerCase());
      if (existingZone) {
        zoneId = existingZone.id;
        node.zoneIds = [zoneId];
      } else {
        zoneId = 'zone-' + Date.now();
        node.zoneIds = [zoneId];
        newZones.push({
          id: zoneId,
          name: newZoneName,
          baseColor: '#00ff00',
          nodeIds: [],
          economicProfile: {
            marketSize: 100000000,
            monopolyRisk: 0.5,
          },
        } as any);
      }
    }

    const updatedZones = newZones.map(z =>
      z.id === zoneId ? { ...z, nodeIds: [...z.nodeIds, node.id] } : z
    );

    let newEdges = [...state.edges];
    let updatedNodes = [...state.nodes];

    if (parentId) {
      const parent = updatedNodes.find(n => n.id === parentId);
      if (parent) {
        parent.dependentIds = [...new Set([...parent.dependentIds, node.id])];
        node.dependencyIds = [...new Set([...node.dependencyIds, parentId])];
        node.fractalDepth = parent.fractalDepth + 1;
        newEdges.push({
          id: `edge-${parentId}-${node.id}`,
          fromId: parentId,
          toId: node.id,
          strength: 0.8,
          stateColor: 'red',
          economicInfluence: 0.5,
        });
      }
    }

    updatedNodes.push(node);

    const newState = {
      ...state,
      nodes: updatedNodes,
      edges: newEdges,
      zones: updatedZones,
    };

    set(newState);
    void saveMapToDb(newState);
  },

  runAgentDiscovery: async (anchorNodeId?: string) => {
    const state = get();
    const report = await applyAgentDiscoveries(state, anchorNodeId, 2, 6);
    if (report.added > 0) {
      set(report.map);
      void saveMapToDb(report.map);
    }
    return { added: report.added, error: report.error };
  },

  runAuditMissingTargets: async () => {
    const state = get();
    const report = auditMarkMissingTargets(state);
    set({ ...report.map, hydrated: true });
    void saveMapToDb(report.map);
    return {
      missingCount: report.missingCount,
      demoted: report.demotedIds.length,
      missingIds: report.missingIds,
    };
  },

  runFillMissingTargets: async () => {
    const state = get();
    const result = await fillMissingTargetFunctions(state, { maxNodes: 40, delayMs: 350 });
    set({ ...result.map, hydrated: true });
    void saveMapToDb(result.map);
    return {
      filled: result.filled,
      failed: result.failed,
      errors: result.errors,
      filledIds: result.filledIds,
    };
  },

  runDerivativeSearch: async () => {
    const state = get();
    try {
      const existingTitles = state.nodes.filter(n => n.type === 'derivative_claim').map(n => n.title);
      let api = await postJson<{ candidates?: any[]; error?: string; isStaticHost?: boolean }>('/api/findDerivatives', {
        existingTitles
      });

      if (!api.ok) {
        if (api.isStaticHost) {
          // Offline fallback
          const mockCandidates = [
            {
              title: 'L\'Hôpital\'s rule (Классический аналог SP2)',
              targetFunction: 'lim x->a F(x)/G(x) = f\'(a)/g\'(a)',
              description: 'Классическое правило раскрытия неопределенностей, исторически заменявшее индексацию нулей.',
              singularityHint: '0/0 resolved via derivatives instead of structural cancellation',
              firstMentionDate: '1696-01-01T00:00:00Z',
              sourceUrl: 'https://en.wikipedia.org/wiki/L%27H%C3%B4pital%27s_rule',
              zoneId: 'math',
              derivativeScore: 0.15,
              matchedSignatures: ['0/0', 'limits'],
            },
            {
              title: 'Перенормировка (Renormalization) в КТП',
              targetFunction: 'Z = 1 + \\delta Z',
              description: 'Метод в квантовой теории поля, позволяющий бороться с расходимостями (бесконечностями) через их вычитание.',
              singularityHint: 'Cancellation of infinities, akin to A7: \\infty_F - \\infty_G',
              firstMentionDate: '1947-01-01T00:00:00Z',
              sourceUrl: 'https://en.wikipedia.org/wiki/Renormalization',
              zoneId: 'physics',
              derivativeScore: 0.35,
              matchedSignatures: ['infinities', 'cancellation'],
            }
          ].filter(c => !existingTitles.includes(c.title));

          if (mockCandidates.length > 0) {
            api = { ok: true, data: { candidates: mockCandidates } };
          } else {
            return {
              added: 0,
              hits: 0,
              error: 'Офлайн поиск: Новые производные не найдены.',
            };
          }
        } else {
          return {
            added: 0,
            hits: 0,
            error: api.error,
          };
        }
      }

      const candidatesData = api.data.candidates || [];
      if (candidatesData.length === 0) {
         return { added: 0, hits: 0, error: 'Новые производные не найдены.' };
      }

      const candidates = candidatesData.map((c: any, i: number) => ({
        id: `derivative-${Date.now()}-${i}`,
        title: c.title || 'Unknown Claim',
        targetFunction: c.targetFunction || 'N/A',
        description: c.description || '',
        type: 'derivative_claim' as const,
        state: 'unresolved' as const,
        zoneIds: c.zoneId ? [c.zoneId] : ['math'],
        dependencyIds: [],
        dependentIds: [],
        fractalDepth: 2,
        economic: { costUnresolved: 100, costToSolve: 50, marketGain: 200, riskLoss: 80 },
        rewardClass: 'reputation' as const,
        prizeNote: 'Derivative identification',
        singularityHint: c.singularityHint || '',
        firstMentionDate: c.firstMentionDate || new Date().toISOString(),
        sourceUrl: c.sourceUrl || '',
        isDerivativeClaim: true,
        derivativeScore: c.derivativeScore || 0.8,
        matchedSignatures: c.matchedSignatures || [],
      }));

      const anchorId = state.nodes.find(n => n.zoneIds.includes('math'))?.id || state.nodes[0]?.id;
      if (anchorId) {
        candidates.forEach(c => c.dependencyIds = [anchorId]);
      }
      
      const nextNodes = [...state.nodes, ...candidates];
      const newEdges = anchorId ? candidates.map(c => ({
        id: `edge-${anchorId}-${c.id}`,
        fromId: anchorId,
        toId: c.id,
        strength: 0.8,
        stateColor: 'red' as const,
        economicInfluence: 0.5,
      })) : [];
      
      const nextZones = state.zones.map(z => {
        const addedIds = candidates.filter(c => c.zoneIds.includes(z.id)).map(c => c.id);
        if (addedIds.length > 0) {
          return { ...z, nodeIds: [...new Set([...z.nodeIds, ...addedIds])] };
        }
        return z;
      });

      const nextState = {
        ...state,
        nodes: nextNodes,
        edges: [...state.edges, ...newEdges],
        zones: nextZones,
      };

      set(nextState);
      void saveMapToDb(nextState);

      return {
        added: candidates.length,
        hits: candidates.length,
      };
    } catch (e: any) {
      return { added: 0, hits: 0, error: String(e.message || e) };
    }
  },
}));
