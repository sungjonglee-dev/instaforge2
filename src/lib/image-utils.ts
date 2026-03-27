const DIRECT_DOMAINS = ['unsplash.com'];

export function getImageSrc(imageUrl: string | undefined): string | undefined {
  if (!imageUrl) return undefined;
  const isDirect = DIRECT_DOMAINS.some((d) => imageUrl.includes(d));
  return isDirect ? imageUrl : `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
}
