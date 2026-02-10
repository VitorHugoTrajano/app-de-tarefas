import { format, parseISO, isToday, isYesterday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const formatDateTime = (isoString: string): string => {
  if (!isoString) return '—';
  return format(parseISO(isoString), "dd/MM/yyyy HH:mm", { locale: ptBR });
};

export const formatTime = (isoString: string): string => {
  if (!isoString) return '';
  return format(parseISO(isoString), "HH:mm", { locale: ptBR });
};

export const formatDateHeader = (isoString: string): string => {
  const date = parseISO(isoString);
  if (isToday(date)) return 'Hoje';
  if (isYesterday(date)) return 'Ontem';
  return format(date, "EEEE, dd 'de' MMMM", { locale: ptBR });
};

export const formatRelativeTime = (isoString: string): string => {
   if (!isoString) return 'Nunca';
   const date = parseISO(isoString);
   return format(date, "dd/MM HH:mm", { locale: ptBR });
};