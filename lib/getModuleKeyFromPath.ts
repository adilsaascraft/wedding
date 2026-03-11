import { MODULE_TO_BASEURL_MAP } from '@/lib/moduleSidebarMap';

export function getModuleKeyFromPath(pathname: string) {
  const parts = pathname.split('/');
  const baseUrl = parts[3]; // /events/:eventId/{baseUrl}/...

  if (!baseUrl) return null;

  const entry = Object.entries(MODULE_TO_BASEURL_MAP).find(
    ([, baseUrls]) => baseUrls.includes(baseUrl)
  );

  return entry?.[0] ?? null;
}
