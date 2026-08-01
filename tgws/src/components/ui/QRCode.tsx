interface QRCodeProps {
  value: string;
  size?: number;
  alt?: string;
}

/**
 * Renders a QR code via the free qrserver.com API.
 *
 * Privacy note (AUDIT-147): `value` is sent to a third-party server. Only
 * pass PUBLIC, non-sensitive data (e.g. business WhatsApp numbers, public
 * site URLs). Verified usage: contact page WhatsApp link only. Do not use
 * this component for values containing tokens, private URLs, or PII.
 */
export default function QRCode({ value, size = 150, alt = 'QR Code' }: QRCodeProps) {
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
