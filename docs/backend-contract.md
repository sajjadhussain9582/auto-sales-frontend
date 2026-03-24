# Backend contracts needed (frontend)

This document lists the minimal API additions that unlock full functionality for:
- Messaging inbox + replies
- Contacts management
- Outreach campaigns + templates
- Integrations / webhooks status

Base URL assumed: `NEXT_PUBLIC_API_URL` (e.g. `http://127.0.0.1:8000/api/v1`).

## Auth (staff)

Already used:
- `POST /users/register`
- `POST /users/login`
- `GET /users/me` (Bearer)

## Messaging (client communication)

### 1) Inbox list

Required for `/dashboard/messages`:
- `GET /conversations?cursor=&limit=&channel=&status=&is_escalated=`

Response (suggested):
```json
[
  {
    "id": "uuid-or-id",
    "channel": "ghl",
    "status": "open",
    "is_escalated": false,
    "contact_id": "123",
    "contact_preview": "Alex Rivera · alex@example.com",
    "last_message_preview": "Interested in a consultation…",
    "updated_at": "2026-01-01T00:00:00Z"
  }
]
```

### 2) Thread view

Already used:
- `GET /conversations/{id}` (Bearer)

### 3) Send message / reply (future)

Required to enable the composer UI:
- `POST /conversations/{id}/messages` (Bearer)

Suggested body:
```json
{
  "message": "text",
  "sender_type": "human",
  "channel": "email|sms|ghl|website"
}
```

## Contacts (CRM)

Required for `/dashboard/contacts`:
- `GET /contacts?search=&cursor=&limit=&channel=&stage=&tag=`
- `GET /contacts/{id}`
- `PATCH /contacts/{id}` (notes, stage, tags, etc.)

Suggested contact fields:
```json
{
  "id": "c1",
  "name": "Alex Rivera",
  "email": "alex@example.com",
  "phone": "+1…",
  "company": "Rivera Homes",
  "channel": "ghl",
  "stage": "qualified",
  "tags": ["contractor"],
  "notes": "internal",
  "conversation_ids": ["demo-thread-1"],
  "ghl_contact_id": "..."
}
```

## Outreach (campaigns + templates)

Required for `/dashboard/outreach/*`:
- `GET /campaigns`
- `GET /campaigns/{id}`
- `POST /campaigns` (create draft)
- `PATCH /campaigns/{id}` (pause/resume)
- `POST /campaigns/{id}/send` (starts send job)
- `GET /campaigns/templates` (or `GET /templates`)

Suggested campaign fields:
```json
{
  "id": "camp-1",
  "name": "Contractor partnership Q1",
  "channel": "email|sms|multi",
  "status": "draft|scheduled|sending|paused|completed",
  "audience_label": "Contractors · West region",
  "sent_count": 0,
  "open_count": 0,
  "reply_count": 0,
  "updated_at": "..."
}
```

## Integrations (GHL / Calendly / Sheets)

Required for `/dashboard/integrations` to be real (vs shell):
- `GET /integrations` (connection status, last sync, errors)
- `POST /integrations/{provider}/connect` (OAuth start) or provide UI URLs
- `POST /integrations/{provider}/disconnect`

### Webhooks

GHL → backend:
- Create/update contact
- Create conversation/message events
- Track message status (delivered, failed, replied)

