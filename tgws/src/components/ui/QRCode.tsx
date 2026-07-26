'use client';

interface QRCodeProps {
  value: string;
  size?: number;
  alt?: string;
}

export default function QRCode({ value, size = 150, alt = 'QR Code' }: QRCodeProps) {
  // Using goqr.me API - free, no API key required
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}`;

  return (
    <img
      src={qrUrl}
      alt={alt}
      width={size}
      height={size}
      className="rounded-lg"
      loading="lazy"
    />
  );
}