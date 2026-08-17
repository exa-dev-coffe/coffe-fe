export const ENDPOINTS = {
    // Auth
    AUTH_LOGIN: '/api/1.0/auth/login',
    AUTH_REGISTER: '/api/1.0/auth/register',
    AUTH_FORGOT_PASSWORD: '/api/1.0/auth/forgot-password',
    AUTH_CHANGE_PASSWORD: '/api/1.0/auth/change-password',
    AUTH_REFRESH: '/api/1.0/auth/refresh',
    AUTH_LOGOUT: '/api/1.0/auth/logout',
    AUTH_GOOGLE_LOGIN: '/api/1.0/auth/google/login',
    AUTH_GOOGLE_REDIRECT: '/api/1.0/auth/google',

    // Profile & Me
    ME: '/api/1.0/me',
    UPDATE_PROFILE: '/api/1.0/update-profile',
    UPLOAD_PROFILE: '/api/1.0/upload/upload-profile',
    DELETE_PROFILE: '/api/1.0/upload/delete-profile',

    // Menu
    MENUS: '/api/1.0/menus',
    MENU_DETAIL: '/api/1.0/menus/detail',
    MENUS_UNCATEGORIZED: '/api/1.0/menus/uncategorized',
    MENUS_BY_CATEGORY: '/api/1.0/menus/by-category',
    MENUS_SET_CATEGORY: '/api/1.0/menus/set-category',
    MENUS_AVAILABILITY: '/api/1.0/menus/availability',
    UPLOAD_MENU: '/api/1.0/upload/upload-menu',
    DELETE_MENU_PHOTO: '/api/1.0/upload/delete-menu',

    // Categories
    CATEGORIES: '/api/1.0/categories',

    // Tables
    TABLES: '/api/1.0/tables',

    // Barista
    BARISTA_LIST: '/api/1.0/barista/list-barista',
    BARISTA_REGISTER: '/api/1.0/barista/register-barista',
    BARISTA_DELETE: '/api/1.0/barista',

    // Wallet / Balance
    BALANCE: '/api/1.0/balance',
    BALANCE_ACTIVATE: '/api/1.0/balance/activate',
    BALANCE_TOP_UP: '/api/1.0/balance/top-up',
    BALANCE_HISTORY: '/api/1.0/balance-history',

    // Orders & Transactions
    CHECKOUT: '/api/1.0/checkout',
    HISTORY_CHECKOUTS: '/api/1.0/history-checkouts',
    HISTORY_CHECKOUTS_DETAIL: '/api/1.0/history-checkouts/detail',
    SET_RATING_MENU: '/api/1.0/history-checkouts/set-rating-menu',
    TRANSACTIONS: '/api/1.0/transactions',
    TRANSACTIONS_DETAIL: '/api/1.0/transactions/detail',
    TRANSACTIONS_UPDATE_STATUS: '/api/1.0/transactions/update-order-status',
    TRANSACTIONS_SUMMARY_REPORT: '/api/1.0/transactions/summary-report',

    // SSE
    EVENTS: '/api/1.0/events',
};

export default ENDPOINTS;
