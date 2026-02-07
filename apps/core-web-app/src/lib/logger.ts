/**
 * App logger. Use logger.* instead of raw console.* for app behaviour.
 * In dev: main.tsx patches console so all output goes to logs/dev-browser.log.
 * In prod: console only.
 */
export const logger = {
  log(message: string, data?: unknown) {
    console.log(message, data ?? "");
  },
  info(message: string, data?: unknown) {
    console.info(message, data ?? "");
  },
  warn(message: string, data?: unknown) {
    console.warn(message, data ?? "");
  },
  error(message: string, data?: unknown) {
    console.error(message, data ?? "");
  },
};
