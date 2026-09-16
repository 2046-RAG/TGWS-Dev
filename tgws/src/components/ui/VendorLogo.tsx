import Image from 'next/image';

/** Uniform English vendor logo plate (64×24 optical box). */
const LOGO_FILES: Record<string, string> = {
  sangfor: '/logos/sangfor.png',
  fortinet: '/logos/fortinet.png',
  huawei: '/logos/huawei.png',
  h3c: '/logos/h3c.png',
  nutanix: '/logos/nutanix.png',
  cisco: '/logos/cisco.png',
  ruijie: '/logos/ruijie.png',
  sophos: '/logos/sophos.png',
  hillstone: '/logos/hillstone.png',
  dell: '/logos/dell.png',
  hp: '/logos/hp.png',
  lenovo: '/logos/lenovo.png',
  veeam: '/logos/veeam.png',
  starwind: '/logos/starwind.png',
  proxmox: '/logos/proxmox.png',
  bytedance: '/logos/bytedance.png',
  'alibaba cloud': '/logos/alibaba-cloud.png',
  alibabacloud: '/logos/alibaba-cloud.png',
  // Sundray / Aruba logos to be added under public/logos/
  sundray: '/logos/sundray.png',
  aruba: '/logos/aruba.png',
};

function normalizeVendor(vendor: string): string {
  return vendor.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
}

export default function VendorLogo({
  vendor,
  className = '',
}: {
  vendor: string;
  className?: string;
}) {
  const key = normalizeVendor(vendor);
  const src = LOGO_FILES[key];
  if (!src) {
    return (
      <span
        className={`inline-flex items-center justify-center rounded-md bg-gray-100 dark:bg-zinc-700 px-2 py-1 text-[11px] font-semibold text-gray-600 dark:text-gray-300 ${className}`}
      >
        {vendor}
      </span>
    );
  }
  return (
    <span className={`relative inline-flex h-8 w-20 items-center justify-center ${className}`}>
      <Image
        src={src}
        alt={vendor}
        width={80}
        height={32}
        className="object-contain max-h-8 w-auto"
        unoptimized
      />
    </span>
  );
}
