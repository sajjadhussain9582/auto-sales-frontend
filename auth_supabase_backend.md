## Supabase Google Auth Backend Flow

- **Endpoint**: `POST /api/v1/auth/supabase/login`
- **Body**:

```json
{
  "access_token": "<supabase_session_access_token>"
}
```

- **Behavior**:
  - Validates the Supabase access token against `SUPABASE_URL/auth/v1/user`.
  - Upserts a local `User` using the Supabase user id/email.
  - Issues a local session token (same format as `/users/login`) and returns:

```json
{
  "access_token": "<local_session_token>",
  "token_type": "bearer"
}
```

- **Required environment variables**:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `SUPABASE_ANON_KEY`

