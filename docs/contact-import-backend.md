# Contacts import — backend dependency

Frontend now supports:
- CSV/JSON parse
- Field mapping + validation
- Preview
- Import button (calls an endpoint if present)

## Required endpoint

To enable real imports (create/update contacts), backend should implement one of:

### Option A: Bulk upsert (recommended)

`POST /api/v1/contacts/import`

Body (example):
```json
{
  "upsert_key": "email",
  "rows": [
    {
      "name": "Alex Rivera",
      "email": "alex@example.com",
      "phone": "+1 555-0101",
      "company": "Rivera Homes",
      "stage": "qualified",
      "tags": ["contractor", "outreach"],
      "notes": "Imported from CSV",
      "external_ids": { "ghl_contact_id": "abc123" }
    }
  ]
}
```

Response (example):
```json
{
  "created_count": 10,
  "updated_count": 2,
  "errors": [{ "row": 7, "message": "Invalid email" }]
}
```

### Option B: Single-row create + update

- `POST /api/v1/contacts` (create)
- `PATCH /api/v1/contacts/{contact_uuid}` (update)

Frontend can then loop and upsert client-side, but bulk is preferred.

## Notes

- Frontend stores templates/campaign bodies as **plain text** even if composed with Quill UI.
- Contacts endpoints in Phase 2 already include `PATCH /contacts/{uuid}` — import complements it.

