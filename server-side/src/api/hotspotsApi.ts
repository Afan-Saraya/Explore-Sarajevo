import httpClient from './httpClient';
import {
  HotspotBlockSet,
  HotspotFooter,
  EditorsPick,
  DiscoveryPlace,
  QuickFun,
  Utilities,
} from '@/types/hotspot';

export const hotspotsApi = {
  // Blocks
  getBlocks: async (): Promise<{ blockSets: HotspotBlockSet[] }> => {
    return httpClient.get<{ blockSets: HotspotBlockSet[] }>('/api/hotspot/blocks');
  },

  saveBlocks: async (blockSets: HotspotBlockSet[]): Promise<{ blockSets: HotspotBlockSet[] }> => {
    return httpClient.put<{ blockSets: HotspotBlockSet[] }>('/api/hotspot/blocks', { blockSets });
  },

  // Footer
  getFooter: async (): Promise<HotspotFooter> => {
    return httpClient.get<HotspotFooter>('/api/hotspot/footer');
  },

  saveFooter: async (footer: HotspotFooter): Promise<HotspotFooter> => {
    return httpClient.put<HotspotFooter>('/api/hotspot/footer', footer);
  },

  // Editor's Picks
  getEditorsPicks: async (): Promise<{ picks: EditorsPick[] }> => {
    return httpClient.get<{ picks: EditorsPick[] }>('/api/hotspot/editors-picks');
  },

  saveEditorsPicks: async (picks: EditorsPick[]): Promise<{ picks: EditorsPick[] }> => {
    return httpClient.put<{ picks: EditorsPick[] }>('/api/hotspot/editors-picks', { picks });
  },

  // Discovery
  getDiscovery: async (): Promise<{ places: DiscoveryPlace[] }> => {
    return httpClient.get<{ places: DiscoveryPlace[] }>('/api/hotspot/discovery');
  },

  saveDiscovery: async (places: DiscoveryPlace[]): Promise<{ places: DiscoveryPlace[] }> => {
    return httpClient.put<{ places: DiscoveryPlace[] }>('/api/hotspot/discovery', { places });
  },

  // Quick Fun
  getQuickFun: async (): Promise<QuickFun> => {
    return httpClient.get<QuickFun>('/api/hotspot/quick-fun');
  },

  saveQuickFun: async (data: QuickFun): Promise<QuickFun> => {
    return httpClient.put<QuickFun>('/api/hotspot/quick-fun', data);
  },

  // Utilities
  getUtilities: async (): Promise<Utilities> => {
    return httpClient.get<Utilities>('/api/hotspot/utilities');
  },

  saveUtilities: async (data: Utilities): Promise<Utilities> => {
    return httpClient.put<Utilities>('/api/hotspot/utilities', data);
  },
};

export default hotspotsApi;
