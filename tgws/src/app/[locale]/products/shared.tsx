'use client';

import type { ComponentType } from 'react';
import {
  Clapperboard, TerminalSquare, BotMessageSquare, Cpu, Lightbulb,
  Boxes, Layers3, CloudUpload, CloudDownload, HardDrive, ServerCog,
  LifeBuoy, Router as RouterIcon, Network, Cable, Waypoints,
  Wifi, RadioTower, Antenna, SignalHigh,
  ShieldCheck, ShieldAlert, Laptop, Radar, CloudCog,
  Shuffle, Siren, CircleAlert,
  Server,
  type LucideProps,
} from 'lucide-react';

export type TabKey = 'build' | 'run' | 'protect';
export type ProductIconComponent = ComponentType<LucideProps>;

export const tabColors: Record<TabKey, string> = {
  build: '#00D4FF',
  run: '#7B61FF',
  protect: '#22C55E',
};

// Slug → i18n key mapping. MUST stay in sync across list/detail pages
// (AGENTS.md rule #49 — a prior bug came from desync).
export const slugToI18n: Record<string, string> = {
  'ai-generated-content-aigc': 'aigcTitle',
  'ai-assisted-coding': 'aigcCoding',
  'ai-agent-development': 'aiAgent',
  'enterprise-legacy-system-ai-augmentation': 'legacyAI',
  'ai-adoption-services': 'aiAdoption',
  'server-virtualization-platform': 'vmPlatform',
  'hyper-converged-infrastructure': 'hci',
  'cloud-migration': 'cloudPlatform',
  'cloud-repatriation': 'cloudRepatriation',
  'enterprise-storage-solutions': 'hardware',
  'managed-hosting-services': 'hosting',
  'business-continuity-disaster-recovery': 'bcdr',
  'enterprise-routers': 'enterpriseRouters',
  'core-switches': 'coreSwitches',
  'access-switches': 'accessSwitches',
  'aggregation-switches': 'aggregationSwitches',
  'enterprise-wireless-ap': 'enterpriseWirelessAP',
  'wireless-controllers': 'wirelessControllers',
  'outdoor-wireless-ap': 'outdoorWirelessAP',
  'wifi-6-7-ap': 'wifi67AP',
  'next-gen-firewall-ips': 'ngfw',
  'web-application-firewall': 'waf',
  'endpoint-detection-response': 'edr',
  'network-detection-response': 'ndr',
  'cloud-security': 'cloudSecurity',
  'sd-wan-load-balancing': 'sdwan',
  'managed-detection-response': 'mdr',
  'incident-response': 'incidentResponse',
};

/** One distinct Lucide glyph per product slug (semantic, not decorative filler). */
export const productIcons: Record<string, ProductIconComponent> = {
  'ai-generated-content-aigc': Clapperboard,
  'ai-assisted-coding': TerminalSquare,
  'ai-agent-development': BotMessageSquare,
  'enterprise-legacy-system-ai-augmentation': Cpu,
  'ai-adoption-services': Lightbulb,
  'server-virtualization-platform': Boxes,
  'hyper-converged-infrastructure': Layers3,
  'cloud-migration': CloudUpload,
  'cloud-repatriation': CloudDownload,
  'enterprise-storage-solutions': HardDrive,
  'managed-hosting-services': ServerCog,
  'business-continuity-disaster-recovery': LifeBuoy,
  'enterprise-routers': RouterIcon,
  'core-switches': Network,
  'access-switches': Cable,
  'aggregation-switches': Waypoints,
  'enterprise-wireless-ap': Wifi,
  'wireless-controllers': RadioTower,
  'outdoor-wireless-ap': Antenna,
  'wifi-6-7-ap': SignalHigh,
  'next-gen-firewall-ips': ShieldCheck,
  'web-application-firewall': ShieldAlert,
  'endpoint-detection-response': Laptop,
  'network-detection-response': Radar,
  'cloud-security': CloudCog,
  'sd-wan-load-balancing': Shuffle,
  'managed-detection-response': Siren,
  'incident-response': CircleAlert,
};

export function ProductIcon({
  slug,
  size = 28,
  className,
  strokeWidth,
}: {
  slug: string;
  size?: number;
  className?: string;
  strokeWidth?: number;
}) {
  const Icon = productIcons[slug] || Server;
  return <Icon size={size} className={className} strokeWidth={strokeWidth} aria-hidden />;
}

// Run tab subcategory groups
export const runSubgroups = [
  { key: 'infrastructure', i18nKey: 'compute', slugs: ['server-virtualization-platform', 'hyper-converged-infrastructure', 'cloud-migration', 'cloud-repatriation', 'enterprise-storage-solutions', 'managed-hosting-services', 'business-continuity-disaster-recovery'] },
  { key: 'routing_switching', i18nKey: 'routing_switching', slugs: ['enterprise-routers', 'core-switches', 'access-switches', 'aggregation-switches'] },
  { key: 'wireless', i18nKey: 'wireless', slugs: ['enterprise-wireless-ap', 'wireless-controllers', 'outdoor-wireless-ap', 'wifi-6-7-ap'] },
];
