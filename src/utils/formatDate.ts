export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d   = new Date(iso);
  const day = d.getDate();
  const mon = d.getMonth() + 1;
  const yr  = String(d.getFullYear()).slice(-2);
  const hh  = String(d.getHours()).padStart(2, "0");
  const mm  = String(d.getMinutes()).padStart(2, "0");
  const ss  = String(d.getSeconds()).padStart(2, "0");
  return `${day}.${mon}.${yr} ${hh}:${mm}:${ss}`;
}