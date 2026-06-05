// ── Server ──
export const API_BASE_URL = 'http://localhost:8080';
export const APP_URL = window.location.origin;

// ── Auth ──
export const JWT_KEY = 'jwt';
export const GOOGLE_AUTH_PATH = '/oauth2/authorization/google';
export const REDIRECT_DELAY_MS = 500;

// ── REST API ──
export const API_ME = '/api/v1/me';
export const API_LOGS = '/api/v1/logs';

// ── WebSocket ──
export const WS_ENDPOINT = '/ws';
export const WS_RECONNECT_DELAY = 5000;
export const WS_TOPIC_PAYROLL = '/topic/payroll-logs';
export const WS_TOPIC_LOGS = '/topic/logs';
export const WS_SOCKJS_URL = `${API_BASE_URL}${WS_ENDPOINT}`;

// ── Events ──
export const SOURCE_PAYROLL = 'PAYROLL_SERVICE';
export const SOURCE_AI = 'LOGSENSE_AI';
export const MAX_LOG_ENTRIES = 50;

// ── Search ──
export const API_LOGS_SEARCH = '/api/v1/logs/search';
export const API_LOGS_SEARCH_STATUS = '/api/v1/logs/search/status';
