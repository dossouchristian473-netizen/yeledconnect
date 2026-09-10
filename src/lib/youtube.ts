// Extrait l'identifiant d'une vidéo YouTube depuis les formats d'URL
// courants (watch?v=, youtu.be/, shorts/, embed/). Retourne null si l'URL
// ne ressemble pas à une URL YouTube reconnue.
export function getYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1) || null;
    if (u.hostname.includes("youtube.com")) {
      if (u.searchParams.get("v")) return u.searchParams.get("v");
      const match = u.pathname.match(/\/(shorts|embed)\/([^/?]+)/);
      if (match) return match[2];
    }
    return null;
  } catch {
    return null;
  }
}
