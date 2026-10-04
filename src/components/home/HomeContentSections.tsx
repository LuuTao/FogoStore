'use client';

import { useEffect, useState } from 'react';
import { HeroSection } from '@/components/home/HeroSection';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { FeaturedProductsSection } from '@/components/home/FeaturedProductsSection';
import { IPhoneShowcaseSection } from '@/components/home/IPhoneShowcaseSection';
import { IPadShowcaseSection } from '@/components/home/IPadShowcaseSection';
import { MacBookShowcaseSection } from '@/components/home/MacBookShowcaseSection';
import { LatestNewsSection } from '@/components/home/LatestNewsSection';
import { CommitmentSection } from '@/components/home/CommitmentSection';
import { fetchJsonCached } from '@/lib/clientFetchCache';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://fogo-store-api.onrender.com').replace(/\/$/, '');

export type HomeSectionId = 'hero' | 'flash-sale' | 'categories' | 'iphone' | 'ipad' | 'macbook' | 'commitment' | 'news';
export type HomeSectionSetting = { id: HomeSectionId; enabled: boolean };

export const DEFAULT_HOME_SECTIONS: HomeSectionSetting[] = [
  { id: 'hero', enabled: true },
  { id: 'flash-sale', enabled: true },
  { id: 'categories', enabled: true },
  { id: 'iphone', enabled: true },
  { id: 'ipad', enabled: true },
  { id: 'macbook', enabled: true },
  { id: 'commitment', enabled: true },
  { id: 'news', enabled: true },
];

const SECTION_COMPONENTS: Record<HomeSectionId, React.ComponentType> = {
  hero: HeroSection,
  'flash-sale': FeaturedProductsSection,
  categories: CategoryGrid,
  iphone: IPhoneShowcaseSection,
  ipad: IPadShowcaseSection,
  macbook: MacBookShowcaseSection,
  commitment: CommitmentSection,
  news: LatestNewsSection,
};

function normalizeHomeSections(value: unknown): HomeSectionSetting[] {
  if (!Array.isArray(value)) return DEFAULT_HOME_SECTIONS;

  const validIds = new Set<HomeSectionId>(DEFAULT_HOME_SECTIONS.map((section) => section.id));
  const seen = new Set<HomeSectionId>();
  const normalized: HomeSectionSetting[] = [];

  value.forEach((item) => {
    if (!item || typeof item !== 'object') return;
    const candidate = item as Partial<HomeSectionSetting>;
    if (!candidate.id || !validIds.has(candidate.id) || seen.has(candidate.id)) return;
    seen.add(candidate.id);
    normalized.push({ id: candidate.id, enabled: candidate.enabled !== false });
  });

  // Bản cấu hình cũ có thể chưa chứa Flash Sale hoặc iPhone. Luôn bổ sung khối
  // bị thiếu để việc đổi thứ tự trong admin không làm mất nội dung trang chủ.
  DEFAULT_HOME_SECTIONS.forEach((section) => {
    if (!seen.has(section.id)) normalized.push(section);
  });

  return normalized;
}

export function HomeContentSections() {
  const [sections, setSections] = useState<HomeSectionSetting[]>(DEFAULT_HOME_SECTIONS);

  useEffect(() => {
    fetchJsonCached<{ success?: boolean; data?: { sections?: unknown } }>(`${API_URL}/api/home-layout`, 60_000)
      .then((json) => {
        if (!json?.success || !Array.isArray(json.data?.sections)) return;
        setSections(normalizeHomeSections(json.data.sections));
      })
      .catch(() => {
        // Giữ bố cục mặc định để Home vẫn hoạt động nếu API tạm thời gián đoạn.
      });
  }, []);

  return sections.map((section) => {
    if (!section.enabled) return null;
    const Component = SECTION_COMPONENTS[section.id];
    return Component ? <Component key={section.id} /> : null;
  });
}
