export interface Environment {
    DB: D1Database,
    API_KEY: string
};

export interface GuestbookEntry {
    id: string,
    date: number,
    body: string,
};