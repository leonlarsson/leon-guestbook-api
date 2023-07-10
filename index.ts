import blockedCharacters from "./lib/blockedCharacters";
import type { Environment, GuestbookPOSTPayload, JournalPOSTPayload } from "./types";

const headers = { "Access-Control-Allow-Origin": "*" };

export default {
    async fetch(request: Request, env: Environment): Promise<Response> {

        if (!env.API_KEY || request.headers.get("API-KEY") !== env.API_KEY) return unathorized();

        const { pathname } = new URL(request.url);

        // GUESTBOOK
        if (request.method === "GET" && pathname === "/guestbook/entries") {
            try {
                const { results } = await env.DB.prepare("SELECT * FROM entries ORDER BY date DESC LIMIT 100").all();
                return Response.json(results, { headers });
            } catch (error) {
                console.log(error);
                return notOk();
            }
        }

        if (request.method === "POST" && pathname === "/guestbook/entries") {
            const { body, name }: GuestbookPOSTPayload = await request.json();
            if (!body) return new Response("Missing body.", { status: 400, headers });
            if (body.length > 100) return new Response("Body is too long.", { status: 400, headers });
            if (blockedCharacters.some(char => body.includes(char))) return new Response("Body is not allowed.", { status: 400, headers });

            try {
                await env.DB.prepare("INSERT INTO entries (id, date, body, name) VALUES (?1, ?2, ?3, ?4)").bind(crypto.randomUUID(), new Date().getTime(), body, name ?? null).run();
                return ok();
            } catch (error) {
                console.log(error);
                return notOk();
            }
        }

        if (request.method === "DELETE" && pathname === "/guestbook/entries") {
            const idToDelete = request.headers.get("id-to-delete");
            if (!idToDelete) return new Response("Missing id.", { status: 400, headers });
            try {
                await env.DB.prepare("DELETE FROM entries WHERE id = ?1").bind(idToDelete).run();
                return ok();
            } catch (error) {
                console.log(error);
                return notOk();
            }
        }

        // JOURNAL
        if (request.method === "GET" && pathname === "/journal/posts") {
            try {
                const { results } = await env.DB.prepare("SELECT * FROM journal_posts ORDER BY date DESC LIMIT 100").all();
                return Response.json(results, { headers });
            } catch (error) {
                console.log(error);
                return notOk();
            }
        }

        if (request.method === "POST" && pathname === "/journal/posts") {
            const { title, body }: JournalPOSTPayload = await request.json();
            if (!title) return new Response("Missing title.", { status: 400, headers });
            if (!body) return new Response("Missing body.", { status: 400, headers });

            try {
                await env.DB.prepare("INSERT INTO journal_posts (id, date, title, body) VALUES (?1, ?2, ?3, ?4)").bind(crypto.randomUUID(), new Date().getTime(), title, body).run();
                return ok();
            } catch (error) {
                console.log(error);
                return notOk();
            }
        }

        if (request.method === "DELETE" && pathname === "/journal/posts") {
            const idToDelete = request.headers.get("id-to-delete");
            if (!idToDelete) return new Response("Missing id.", { status: 400, headers });
            try {
                await env.DB.prepare("DELETE FROM journal_posts WHERE id = ?1").bind(idToDelete).run();
                return ok();
            } catch (error) {
                console.log(error);
                return notOk();
            }
        }

        return new Response("Not found.", { status: 404, headers });

    }
}

const ok = (): Response => new Response("OK.", { headers });
const notOk = (): Response => new Response("Not OK.", { status: 500, headers });
const unathorized = (): Response => new Response("Unathorized.", { status: 401, headers });