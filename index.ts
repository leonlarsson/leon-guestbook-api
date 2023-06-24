import { Environment, POSTPayload } from "./types";

const headers = { "Access-Control-Allow-Origin": "*" };

export default {
    async fetch(request: Request, env: Environment): Promise<Response> {

        if (env.API_KEY && request.headers.get("API-KEY") !== env.API_KEY) return unathorized();

        if (request.method === "POST") {
            const { body, name }: POSTPayload = await request.json();
            if (!body) return new Response("Missing body.", { status: 500, headers });
            if (body.length > 50) return new Response("Body is too long.", { status: 500, headers });

            try {
                await env.DB.prepare("INSERT INTO entries (id, date, body, name) VALUES (?1, ?2, ?3, ?4)").bind(crypto.randomUUID(), new Date().getTime(), body, name ?? null).run();
                return ok();
            } catch (error) {
                return notOk();
            }
        }

        if (request.method === "GET") {
            try {
                const { results } = await env.DB.prepare("SELECT * FROM entries LIMIT 100").all();
                return Response.json(results, { headers });
            } catch (error) {
                return notOk();
            }
        }

        if (request.method === "DELETE") {
            // https://github.com/cloudflare/workers-sdk/issues/1388
            const idToDelete = request.headers.get("id-to-delete");
            if (!idToDelete) return new Response("Missing id.", { status: 500, headers });

            try {
                await env.DB.prepare("DELETE FROM entries WHERE id = ?1").bind(idToDelete).run();
                return ok();
            } catch (error) {
                return notOk();
            }
        }

        return new Response("Not found.", { status: 404, headers });

    }
}

const ok = (): Response => new Response("OK.", { headers });
const notOk = (): Response => new Response("Not OK.", { status: 500, headers });
const unathorized = (): Response => new Response("Unathorized.", { status: 401, headers });