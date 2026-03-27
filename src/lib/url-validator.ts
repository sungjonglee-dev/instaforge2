const BLOCKED_HOSTNAMES = [
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
  '169.254.169.254',
];

const BLOCKED_PREFIXES = [
  '10.',
  '192.168.',
];

function isBlockedIP(hostname: string): boolean {
  if (BLOCKED_HOSTNAMES.includes(hostname)) return true;
  if (BLOCKED_PREFIXES.some(p => hostname.startsWith(p))) return true;
  if (hostname.startsWith('172.')) {
    const second = parseInt(hostname.split('.')[1], 10);
    if (second >= 16 && second <= 31) return true;
  }
  return false;
}

export function validateUrl(url: string, options?: { allowedDomains?: string[] }): { valid: boolean; error?: string } {
  try {
    const parsed = new URL(url);

    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { valid: false, error: 'https URL만 허용됩니다' };
    }

    if (isBlockedIP(parsed.hostname)) {
      return { valid: false, error: '접근할 수 없는 URL입니다' };
    }

    if (options?.allowedDomains) {
      const allowed = options.allowedDomains.some(
        d => parsed.hostname === d || parsed.hostname.endsWith(`.${d}`)
      );
      if (!allowed) {
        return { valid: false, error: '허용되지 않는 도메인입니다' };
      }
    }

    return { valid: true };
  } catch {
    return { valid: false, error: '유효하지 않은 URL입니다' };
  }
}

export const IMAGE_ALLOWED_DOMAINS = [
  'i.pinimg.com',
  'images.unsplash.com',
  'plus.unsplash.com',
  'images.pexels.com',
  'pixabay.com',
  'cdn.pixabay.com',
];

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];
