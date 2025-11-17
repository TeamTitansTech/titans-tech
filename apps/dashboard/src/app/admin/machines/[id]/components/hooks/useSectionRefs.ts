import { useRef } from 'react';
import type { SectionComponentRef } from '../sections/types';

export function useSectionRefs() {
  // Section refs for data collection - using a Map for dynamic section management
  const sectionRefs = useRef<Map<string, SectionComponentRef>>(new Map());

  const registerRef = (sectionKey: string, ref: SectionComponentRef) => {
    sectionRefs.current.set(sectionKey, ref);
  };

  const getRef = (sectionKey: string): SectionComponentRef | undefined => {
    return sectionRefs.current.get(sectionKey);
  };

  const reset = () => {
    sectionRefs.current.forEach((ref) => ref.reset());
  };

  return {
    sectionRefs,
    registerRef,
    getRef,
    reset,
  };
}
