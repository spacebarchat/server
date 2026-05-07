import assert from "node:assert/strict";
import crypto from "node:crypto";
import http, { type IncomingHttpHeaders } from "node:http";
import { describe, test } from "node:test";
import type { AddressInfo } from "node:net";
import type { ConnectedAccount } from "@spacebar/util";

process.env.DATABASE ??= "postgres://user:password@localhost:5432/spacebar";

const { default: TwitterConnection, createTwitterAuthorizationCodeBody, createTwitterPKCEPair, createTwitterRefreshTokenBody }: typeof import("./index") = require("./index");

type TwitterConnectionInstance = InstanceType<typeof TwitterConnection>;

interface RecordedTokenRequest {
    method?: string;
    headers: IncomingHttpHeaders;
    body: URLSearchParams;
}

class TestTwitterConnection extends TwitterConnection {
    constructor(private readonly tokenEndpoint: string) {
        super();
    }

    getTokenUrl(): string {
        return this.tokenEndpoint;
    }
}

function getPKCEVerifier(connection: TwitterConnectionInstance, state: string): string {
    const verifier = connection.states.get(state)?.data.codeVerifier;
    if (typeof verifier !== "string") assert.fail("Expected Twitter PKCE verifier to be stored with OAuth state");
    return verifier;
}

async function withTokenServer(callback: (url: string, requests: RecordedTokenRequest[]) => Promise<void>): Promise<void> {
    const requests: RecordedTokenRequest[] = [];
    const server = http.createServer((req, res) => {
        let rawBody = "";
        req.setEncoding("utf8");
        req.on("data", (chunk: string) => {
            rawBody += chunk;
        });
        req.on("end", () => {
            requests.push({
                method: req.method,
                headers: req.headers,
                body: new URLSearchParams(rawBody),
            });
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(
                JSON.stringify({
                    access_token: "access-token",
                    token_type: "bearer",
                    expires_in: 7200,
                    refresh_token: "new-refresh-token",
                }),
            );
        });
    });

    await new Promise<void>((resolve) => {
        server.listen(0, "127.0.0.1", resolve);
    });
    try {
        const { port } = server.address() as AddressInfo;
        await callback(`http://127.0.0.1:${port}/token`, requests);
    } finally {
        await new Promise<void>((resolve, reject) => {
            server.close((error) => {
                if (error) reject(error);
                else resolve();
            });
        });
    }
}

describe("TwitterConnection PKCE", () => {
    test("generates an S256 PKCE challenge from a random verifier", () => {
        const pkce = createTwitterPKCEPair();
        const expectedChallenge = crypto.createHash("sha256").update(pkce.verifier).digest("base64url");

        assert.match(pkce.verifier, /^[A-Za-z0-9_-]{43}$/);
        assert.equal(pkce.challenge, expectedChallenge);
        assert.notEqual(pkce.challenge, "challenge");
    });

    test("adds a per-state S256 PKCE challenge and refresh scope to authorization URLs", () => {
        const connection = new TwitterConnection();
        connection.settings.clientId = "client-id";
        connection.getRedirectUri = () => "https://example.com/connections/twitter/callback";

        const url = new URL(connection.getAuthorizationUrl("user-id"));
        const state = url.searchParams.get("state");
        assert(state);

        const verifier = getPKCEVerifier(connection, state);

        assert.equal(url.searchParams.get("code_challenge_method"), "S256");
        assert.equal(url.searchParams.get("code_challenge"), crypto.createHash("sha256").update(verifier).digest("base64url"));
        assert.notEqual(url.searchParams.get("code_challenge"), "challenge");

        const scopes = url.searchParams.get("scope")?.split(" ");
        assert.deepEqual(scopes, ["users.read", "tweet.read", "offline.access"]);
    });

    test("includes the stored verifier when exchanging authorization codes", () => {
        const body = createTwitterAuthorizationCodeBody({
            code: "auth-code",
            clientId: "client-id",
            redirectUri: "https://example.com/callback",
            codeVerifier: "stored-verifier",
        });

        assert.equal(body.get("grant_type"), "authorization_code");
        assert.equal(body.get("code"), "auth-code");
        assert.equal(body.get("client_id"), "client-id");
        assert.equal(body.get("redirect_uri"), "https://example.com/callback");
        assert.equal(body.get("code_verifier"), "stored-verifier");
    });

    test("does not send PKCE verifier during refresh-token grants", () => {
        const body = createTwitterRefreshTokenBody({
            refreshToken: "refresh-token",
            clientId: "client-id",
        });

        assert.equal(body.get("grant_type"), "refresh_token");
        assert.equal(body.get("refresh_token"), "refresh-token");
        assert.equal(body.get("client_id"), "client-id");
        assert.equal(body.has("redirect_uri"), false);
        assert.equal(body.has("code_verifier"), false);
    });

    test("sends the stored verifier during token exchange and consumes it once", async () => {
        await withTokenServer(async (tokenUrl, requests) => {
            const connection = new TestTwitterConnection(tokenUrl);
            connection.settings.clientId = "client-id";
            connection.settings.clientSecret = "client-secret";
            connection.getRedirectUri = () => "https://example.com/connections/twitter/callback";

            const url = new URL(connection.getAuthorizationUrl("user-id"));
            const state = url.searchParams.get("state");
            assert(state);

            const verifier = getPKCEVerifier(connection, state);

            const tokenData = await connection.exchangeCode(state, "auth-code");
            assert.equal(tokenData.access_token, "access-token");
            assert.equal(requests.length, 1);
            assert.equal(requests[0].method, "POST");
            assert.equal(requests[0].body.get("grant_type"), "authorization_code");
            assert.equal(requests[0].body.get("code"), "auth-code");
            assert.equal(requests[0].body.get("client_id"), "client-id");
            assert.equal(requests[0].body.get("redirect_uri"), "https://example.com/connections/twitter/callback");
            assert.equal(requests[0].body.get("code_verifier"), verifier);
            assert.equal(connection.states.has(state), false);
        });
    });

    test("does not send PKCE or redirect parameters during refresh-token grants", async () => {
        await withTokenServer(async (tokenUrl, requests) => {
            const connection = new TestTwitterConnection(tokenUrl);
            connection.settings.clientId = "client-id";
            connection.settings.clientSecret = "client-secret";
            connection.getRedirectUri = () => "https://example.com/connections/twitter/callback";

            const tokenData = await connection.refreshToken({
                token_data: { refresh_token: "refresh-token" },
            } as ConnectedAccount);

            assert.equal(tokenData.access_token, "access-token");
            assert.equal(requests.length, 1);
            assert.equal(requests[0].method, "POST");
            assert.equal(requests[0].body.get("grant_type"), "refresh_token");
            assert.equal(requests[0].body.get("refresh_token"), "refresh-token");
            assert.equal(requests[0].body.get("client_id"), "client-id");
            assert.equal(requests[0].body.has("redirect_uri"), false);
            assert.equal(requests[0].body.has("code_verifier"), false);
        });
    });
});
