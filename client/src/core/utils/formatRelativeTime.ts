export const formatRelativeTime = (isoTimestamp: string): string => {
  const diffSec = Math.max(0, Math.floor((Date.now() - new Date(isoTimestamp).getTime()) / 1000));
  if (diffSec < 5) return "az önce";
  if (diffSec < 60) return `${diffSec} sn önce`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} dk önce`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} sa önce`;
  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay} gün önce`;
};
