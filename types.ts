export interface Environment {
    DB: D1Database,
    API_KEY: string
};

export interface GuestbookEntry {
    id: string,
    date: number,
    body: string,
};

export interface JournalPost {
    id: string,
    date: number,
    title: string,
    body: string,
};

export interface GuestbookPOSTPayload {
    body: string;
    name?: string;
};

export interface JournalPOSTPayload {
    title: string;
    body: string;
};