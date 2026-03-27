import { create } from 'zustand';
import type { CarouselPlan, BrandInfo, PipelineStep } from '@/lib/types';

export interface ImageCandidate {
  url: string;
  thumbnail: string;
  source: string;
  tags?: string[];
}

interface CarouselState {
  plan: CarouselPlan | null;
  brandInfo: Partial<BrandInfo> | null;
  step: PipelineStep;
  errorMessage: string | null;
  imageMap: Record<number, ImageCandidate[]>;
  setPlan: (plan: CarouselPlan) => void;
  setBrandInfo: (info: Partial<BrandInfo>) => void;
  setStep: (step: PipelineStep) => void;
  setError: (msg: string | null) => void;
  setImageMap: (map: Record<number, ImageCandidate[]>) => void;
  updateSlideImage: (index: number, imageUrl: string) => void;
  reset: () => void;
}

export const useCarouselStore = create<CarouselState>((set) => ({
  plan: null,
  brandInfo: null,
  step: 'idle',
  errorMessage: null,
  imageMap: {},
  setPlan: (plan) => set({ plan }),
  setBrandInfo: (info) => set({ brandInfo: info }),
  setStep: (step) => set({ step, errorMessage: step === 'error' ? undefined : null }),
  setError: (msg) => set({ errorMessage: msg, step: 'error' }),
  setImageMap: (map) => set({ imageMap: map }),
  updateSlideImage: (index, imageUrl) =>
    set((state) => {
      if (!state.plan) return state;
      const slides = [...state.plan.slides];
      slides[index] = { ...slides[index], imageUrl };
      return { plan: { ...state.plan, slides } };
    }),
  reset: () => set({ plan: null, brandInfo: null, step: 'idle', errorMessage: null, imageMap: {} }),
}));
