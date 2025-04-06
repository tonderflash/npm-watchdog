// Importaciones ES6 para probar que npm-watchdog las detecta correctamente
import { format } from "date-fns";
import * as eslint from "eslint";

export function formatDate(date) {
  return format(date, "yyyy-MM-dd");
}

export function lintCode(code) {
  // Solo para probar que se detecta la importación
  if (eslint) {
    return "Code linted";
  }
  return "";
}
