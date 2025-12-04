// Utilitários de data simples para o projeto "Labirinto de Creta"
// Exporta funções puras: isValidDate, parseIsoDate, formatDate, addDays, addDaysSafe, daysBetween, demo

// Nota: projetado como módulo ES. Importe com:
// import * as DateUtils from './js/date-utils.js';

/** Verifica se o valor é um Date válido */
export function isValidDate(d) {
  return d instanceof Date && !Number.isNaN(d.getTime());
}

/**
 * Faz o parse de uma string/valor para Date. Lança TypeError se inválido.
 * Use try/catch ao chamar se quiser tratar o erro.
 */
export function parseIsoDate(input) {
  const d = input instanceof Date ? input : new Date(input);
  if (!isValidDate(d)) throw new TypeError(`Data inválida: ${input}`);
  return d;
}

/** Formata uma Date usando Intl.DateTimeFormat (padrão pt-BR) */
export function formatDate(date, locale = 'pt-BR', options = { dateStyle: 'medium', timeStyle: 'short' }) {
  if (!isValidDate(date)) throw new TypeError('Parâmetro "date" deve ser um Date válido');
  return new Intl.DateTimeFormat(locale, options).format(date);
}

/** Soma dias a uma Date e retorna uma nova Date (operador puro) */
export function addDays(date, days) {
  if (!isValidDate(date)) throw new TypeError('Parâmetro "date" deve ser um Date válido');
  if (typeof days !== 'number' || !Number.isFinite(days)) throw new TypeError('Parâmetro "days" deve ser um número finito');
  const msPerDay = 24 * 60 * 60 * 1000;
  return new Date(date.getTime() + days * msPerDay);
}

/**
 * Versão segura que aceita string/timestamp/Date e registra erro ao falhar.
 * Retorna uma Date ou relança o erro para o chamador lidar.
 */
export function addDaysSafe(dateInput, days) {
  try {
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    if (!isValidDate(date)) throw new TypeError('Data inválida');
    return addDays(date, days);
  } catch (err) {
    // Log detalhado para depuração; não suprimir o erro (rethrow)
    console.error('addDaysSafe: erro ao adicionar dias', { dateInput, days, error: err });
    throw err;
  }
}

/** Retorna o número aproximado de dias entre duas datas (inteiro) */
export function daysBetween(a, b) {
  const da = a instanceof Date ? a : new Date(a);
  const db = b instanceof Date ? b : new Date(b);
  if (!isValidDate(da) || !isValidDate(db)) throw new TypeError('Datas inválidas');
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round(Math.abs(da.getTime() - db.getTime()) / msPerDay);
}

/** Pequena demo que imprime exemplos no console */
export function demo() {
  try {
    console.group('DateUtils demo');
    const now = new Date();
    console.log('Agora:', now.toString());
    console.log('Formatado (pt-BR):', formatDate(now));
    console.log('Somar 7 dias:', formatDate(addDays(now, 7)));
    console.log('daysBetween now e +7:', daysBetween(now, addDays(now, 7)));
    console.groupEnd();
  } catch (err) {
    console.error('DateUtils.demo falhou', err);
  }
}

// Exporta uma função utilitária de teste rápida para o console: runDateUtilsDemo()
export function runDateUtilsDemo() {
  demo();
}

// Fim do arquivo
