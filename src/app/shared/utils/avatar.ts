const DEFAULT_AVATAR_DATA_URI =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjUwIiBmaWxsPSIjNjY2NjY2Ii8+CjxjaXJjbGUgY3g9IjUwIiBjeT0iMzUiIHI9IjE1IiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMjAgODBDMjAgNjUgMzAgNTUgNTAgNTBTODAgNjUgODAgODBIMjBaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K';

export function getInitials(name: string | undefined | null): string {
  const trimmedName = (name || '').trim();
  if (!trimmedName) return '?';
  const parts = trimmedName.split(/\s+/).filter(Boolean);
  const firstInitial = parts[0]?.[0] ?? '';
  const lastInitial = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (firstInitial + lastInitial).toUpperCase();
}

export function getInitialsAvatar(
  name: string | undefined | null,
  options?: {
    size?: number;
    bg?: string;
    fg?: string;
    fontSize?: number;
    fontFamily?: string;
  }
): string {
  const {
    size = 112,
    bg = '#6b7280',
    fg = '#ffffff',
    fontSize = 0.4,
    fontFamily = 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
  } = options || {};

  const initials = getInitials(name);
  const fontPx = Math.round(size * fontSize);
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <style>
      text { dominant-baseline: central; text-anchor: middle; font-family: ${fontFamily}; font-weight: 600; }
    </style>
  </defs>
  <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="${bg}"/>
  <text x="50%" y="50%" fill="${fg}" font-size="${fontPx}px">${initials}</text>
</svg>`;

  const encoded = encodeToBase64(svg);
  return `data:image/svg+xml;base64,${encoded}`;
}

export function getDefaultAvatarDataUri(): string {
  return DEFAULT_AVATAR_DATA_URI;
}

export { DEFAULT_AVATAR_DATA_URI };

function encodeToBase64(content: string): string {
  const binary = toBinary(content);
  const globalRef = globalThis as Record<string, unknown>;

  const runtimeBtoa = typeof globalRef['btoa'] === 'function' ? (globalRef['btoa'] as typeof btoa) : undefined;
  const domBtoa = typeof btoa === 'function' ? btoa : undefined;
  const btoaFn = runtimeBtoa ?? domBtoa;

  if (btoaFn) {
    return btoaFn(binary);
  }

  const bufferFactory = globalRef['Buffer'] as
    | { from(input: string, encoding: string): { toString(encoding: 'base64'): string } }
    | undefined;

  if (bufferFactory?.from) {
    return bufferFactory.from(content, 'utf-8').toString('base64');
  }

  return '';
}

function toBinary(content: string): string {
  if (typeof TextEncoder !== 'undefined') {
    const bytes = new TextEncoder().encode(content);
    let binary = '';
    bytes.forEach(byte => {
      binary += String.fromCharCode(byte);
    });
    return binary;
  }

  const encoded = encodeURIComponent(content);
  const tokens = encoded.match(/%[0-9A-F]{2}|./g) ?? [];
  let binary = '';

  tokens.forEach(token => {
    if (token.startsWith('%')) {
      binary += String.fromCharCode(parseInt(token.slice(1), 16));
    } else {
      binary += token;
    }
  });

  return binary;
}
