Superseded by [ADR-0009](./0009-password-authentication-contract.md).

The backend will own the WeCom OAuth authorization URL. The frontend requests an authorization entry, redirects to the URL supplied by the backend, and exchanges the callback code at `/auth/wecom`; it no longer builds OAuth URLs from CorpID or AgentID. This keeps OAuth configuration and authorization behavior within the backend boundary while preserving token/session handling in the H5.
