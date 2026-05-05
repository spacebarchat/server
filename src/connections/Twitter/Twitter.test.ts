import assert from "node:assert/strict";
import crypto from "node:crypto";
import { describe, test } from "node:test";

process.env.DATABASE ??= "postgres://user:password@localhost:5432/spacebar";

const { default: TwitterConnection, createTwitterAuthorizationCodeBody, createTwitterPKCEPair, createTwitterRefreshTokenBody }: typeof import("./index") = require("./index");

describe("TwitterConnection PKCE", () => {
    test("generates an S256 PKCE challenge from a random verifier", () => {
        const pkce = createTwitterPKCEPair();
        const expectedChallenge = crypto.createHash("sha256").update(pkce.verifier).digest("base64url");

        assert.match(pkce.verifier, /^[A-Za-z0-9_-]{43}$/);
        assert.equal(pkce.challenge, expectedChallenge);
        assert.notEqual(pkce.challenge, "challenge");
    });

    test("adds a per-state S256 PKCE challenge to authorization URLs", () => {
        const connection = new TwitterConnection();
        connection.settings.clientId = "client-id";
        connection.getRedirectUri = () => "https://example.com/connections/twitter/callback";

        const url = new URL(connection.getAuthorizationUrl("user-id"));
        const state = url.searchParams.get("state");
        assert(state);

        const verifier = (connection as unknown as { pkceVerifiers: Map<string, string> }).pkceVerifiers.get(state);
        assert(verifier);

        assert.equal(url.searchParams.get("code_challenge_method"), "S256");
        assert.equal(url.searchParams.get("code_challenge"), crypto.createHash("sha256").update(verifier).digest("base64url"));
        assert.notEqual(url.searchParams.get("code_challenge"), "challenge");
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
            redirectUri: "https://example.com/callback",
        });

        assert.equal(body.get("grant_type"), "refresh_token");
        assert.equal(body.get("refresh_token"), "refresh-token");
        assert.equal(body.get("client_id"), "client-id");
        assert.equal(body.get("redirect_uri"), "https://example.com/callback");
        assert.equal(body.has("code_verifier"), false);
    });
});
