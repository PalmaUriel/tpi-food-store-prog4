const moneda = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" });
const fechaHora = new Intl.DateTimeFormat("es-AR", { dateStyle: "short", timeStyle: "short" });

export const formatPrecio = (valor: number): string => moneda.format(valor);

export const formatFecha = (iso: string): string => fechaHora.format(new Date(iso));
