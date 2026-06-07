export function formatDate(value?: string) {
  if (!value) return "未记录";
  return new Intl.DateTimeFormat("zh-CN", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export function fullDate(value?: string) {
  if (!value) return "";
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

export function todayISO() {
  return new Date().toISOString();
}

function localDateString(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDaysToDateString(value: string, days: number) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return localDateString(date);
}

export function daysBetweenDates(start?: string, end?: string) {
  if (!start || !end) return undefined;
  const startDate = new Date(start);
  const endDate = new Date(end);
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);
  return Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
}

export function daysUntil(dateString?: string) {
  if (!dateString) return undefined;
  const target = new Date(dateString);
  const today = new Date();
  target.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function daysSince(dateString?: string) {
  if (!dateString) return undefined;
  const target = new Date(dateString);
  const today = new Date();
  target.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return Math.floor((today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));
}

export function expiryLabel(dateString?: string) {
  const days = daysUntil(dateString);
  if (days === undefined) return "未设置";
  if (days < 0) return `已过期 ${Math.abs(days)} 天`;
  if (days === 0) return "今天过期";
  return `${days} 天后过期`;
}
