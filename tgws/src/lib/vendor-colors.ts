/**
 * Vendor brand colors for VMware alternatives.
 *
 * Centralized to avoid hard-coding brand hex values directly in JSX.
 * Used by the VMware Alternatives page solution cards and any future
 * vendor-branded UI surface.
 */
export type VendorName = 'proxmox' | 'sangfor' | 'nutanix' | 'starwind';

export const VENDOR_COLORS: Record<VendorName, string> = {
  proxmox: '#E57000',
  sangfor: '#0066CC',
  nutanix: '#00A859',
  starwind: '#D4213D',
};

export const VENDOR_BRAND_NAMES: Record<VendorName, string> = {
  proxmox: 'Proxmox',
  sangfor: 'Sangfor',
  nutanix: 'Nutanix',
  starwind: 'StarWind',
};
