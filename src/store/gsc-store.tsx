'use client';

import { createContext, useContext, useReducer, type ReactNode, type Dispatch } from 'react';
import type { GscParsedData } from '@/types/gsc';
import type { BusinessContext } from '@/types/business-context';
import { DEFAULT_BUSINESS_CONTEXT } from '@/types/business-context';
import type { BrandDetectionResult } from '@/lib/analysis/brand-detection';

interface GscState {
  rawData: GscParsedData | null;
  brandTerms: string[];
  brandDetection: BrandDetectionResult | null;
  businessContext: BusinessContext;
  setupComplete: boolean;
}

type GscAction =
  | { type: 'SET_RAW_DATA'; payload: GscParsedData }
  | { type: 'SET_BRAND_DETECTION'; payload: BrandDetectionResult }
  | { type: 'SET_BRAND_TERMS'; payload: string[] }
  | { type: 'SET_BUSINESS_CONTEXT'; payload: BusinessContext }
  | { type: 'SET_SETUP_COMPLETE' }
  | { type: 'RESET' };

const initialState: GscState = {
  rawData: null,
  brandTerms: [],
  brandDetection: null,
  businessContext: DEFAULT_BUSINESS_CONTEXT,
  setupComplete: false,
};

function reducer(state: GscState, action: GscAction): GscState {
  switch (action.type) {
    case 'SET_RAW_DATA':
      return { ...state, rawData: action.payload };
    case 'SET_BRAND_DETECTION':
      return { ...state, brandDetection: action.payload };
    case 'SET_BRAND_TERMS':
      return { ...state, brandTerms: action.payload };
    case 'SET_BUSINESS_CONTEXT':
      return { ...state, businessContext: action.payload };
    case 'SET_SETUP_COMPLETE':
      return { ...state, setupComplete: true };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

const GscContext = createContext<GscState>(initialState);
const GscDispatchContext = createContext<Dispatch<GscAction>>(() => {});

export function GscProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <GscContext.Provider value={state}>
      <GscDispatchContext.Provider value={dispatch}>
        {children}
      </GscDispatchContext.Provider>
    </GscContext.Provider>
  );
}

export function useGscState() {
  return useContext(GscContext);
}

export function useGscDispatch() {
  return useContext(GscDispatchContext);
}
