import {
  Video, Code2, Bot, BrainCircuit, Compass, Server, Cloud, HardDrive,
  Shield, Lock, MonitorCheck, Network, CloudCog, Bug,
  AlertTriangle, Settings, Database, RefreshCw, Globe, ShieldCheck,
  Wifi, Cable, Route, Unplug, Radio, Router, NetworkIcon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type TabKey = 'build' | 'run' | 'protect';

export const tabColors: Record<TabKey, string> = {
  build: '#00D4FF',
  run: '#7B61FF',
  protect: '#22C55E',
};

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

export const iconMap: Record<string, LucideIcon> = {
  'ai-generated-content-aigc': Video,
  'ai-assisted-coding': Code2,
  'ai-agent-development': Bot,
  'enterprise-legacy-system-ai-augmentation': BrainCircuit,
  'ai-adoption-services': Compass,
  'server-virtualization-platform': Server,
  'hyper-converged-infrastructure': Database,
  'cloud-migration': Cloud,
  'cloud-repatriation': RefreshCw,
  'enterprise-storage-solutions': HardDrive,
  'managed-hosting-services': Settings,
  'business-continuity-disaster-recovery': Shield,
  'enterprise-routers': Route,
  'core-switches': Cable,
  'access-switches': Network,
  'aggregation-switches': Unplug,
  'enterprise-wireless-ap': Wifi,
  'wireless-controllers': Radio,
  'outdoor-wireless-ap': Router,
  'wifi-6-7-ap': NetworkIcon,
  'next-gen-firewall-ips': ShieldCheck,
  'web-application-firewall': Lock,
  'endpoint-detection-response': MonitorCheck,
  'network-detection-response': Network,
  'cloud-security': CloudCog,
  'sd-wan-load-balancing': Globe,
  'managed-detection-response': Bug,
  'incident-response': AlertTriangle,
};

export interface RunSubgroup {
  key: string;
  i18nKey: string;
  slugs: string[];
}

export const runSubgroups: RunSubgroup[] = [
  {
    key: 'infrastructure',
    i18nKey: 'compute',
    slugs: [
      'server-virtualization-platform',
      'hyper-converged-infrastructure',
      'cloud-migration',
      'cloud-repatriation',
      'enterprise-storage-solutions',
      'managed-hosting-services',
      'business-continuity-disaster-recovery',
    ],
  },
  {
    key: 'routing_switching',
    i18nKey: 'routing_switching',
    slugs: ['enterprise-routers', 'core-switches', 'access-switches', 'aggregation-switches'],
  },
  {
    key: 'wireless',
    i18nKey: 'wireless',
    slugs: ['enterprise-wireless-ap', 'wireless-controllers', 'outdoor-wireless-ap', 'wifi-6-7-ap'],
  },
];
