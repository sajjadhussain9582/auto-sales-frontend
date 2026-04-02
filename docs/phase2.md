

# Frontend Integration Guide: Knowledge Base (RAG)

This guide provides all the necessary technical details to integrate the frontend with the new Phase 2 Knowledge Base (KB) Management system.

## 1. Base URL

All endpoints are prefixed with: `{{BASE_URL}}/api/v1/knowledge-base`

---

## 2. API Endpoints

### 📤 Upload Document (PDF/CSV)

Use this to "train" the AI by uploading a file.

* **URL** : `POST /upload`
* **Content-Type** : `multipart/form-data`
* **Parameters** :
* file: (Binary) The PDF or CSV file.
* `category`: (String, Optional) e.g., "pricing", "technical".
* **Response** :

  KnowledgeBaseUploadResponse

<pre><div node="[object Object]" class="relative whitespace-pre-wrap word-break-all my-2 rounded-lg bg-list-hover-subtle border border-gray-500/20"><div class="min-h-7 relative box-border flex flex-row items-center justify-between rounded-t border-b border-gray-500/20 px-2 py-0.5"><div class="font-sans text-sm text-ide-text-color opacity-60">json</div><div class="flex flex-row gap-2 justify-end"><div class="cursor-pointer opacity-70 hover:opacity-100"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="lucide lucide-copy h-3.5 w-3.5"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg></div></div></div><div class="p-3"><div class="w-full h-full text-xs cursor-text"><div class="code-block"><div class="code-line" data-line-number="1" data-line-start="1" data-line-end="1"><div class="line-content"><span class="mtk1">{</span></div></div><div class="code-line" data-line-number="2" data-line-start="2" data-line-end="2"><div class="line-content"><span class="mtk1"></span><span class="mtk9">"ok"</span><span class="mtk1">: </span><span class="mtk5">true</span><span class="mtk1">,</span></div></div><div class="code-line" data-line-number="3" data-line-start="3" data-line-end="3"><div class="line-content"><span class="mtk1"></span><span class="mtk9">"source_name"</span><span class="mtk1">: </span><span class="mtk11">"project_manual.pdf"</span><span class="mtk1">,</span></div></div><div class="code-line" data-line-number="4" data-line-start="4" data-line-end="4"><div class="line-content"><span class="mtk1"></span><span class="mtk9">"chunks_created"</span><span class="mtk1">: </span><span class="mtk6">42</span></div></div><div class="code-line" data-line-number="5" data-line-start="5" data-line-end="5"><div class="line-content"><span class="mtk1">}</span></div></div></div></div></div></div></pre>

### 📋 Paste Raw Text

Use this for quick ingestion of snippets, email content, or website text.

* **URL** : `POST /paste`
* **Content-Type** : `application/json`
* **Request Body** :

  KnowledgeBasePasteRequest

<pre><div node="[object Object]" class="relative whitespace-pre-wrap word-break-all my-2 rounded-lg bg-list-hover-subtle border border-gray-500/20"><div class="min-h-7 relative box-border flex flex-row items-center justify-between rounded-t border-b border-gray-500/20 px-2 py-0.5"><div class="font-sans text-sm text-ide-text-color opacity-60">json</div><div class="flex flex-row gap-2 justify-end"><div class="cursor-pointer opacity-70 hover:opacity-100"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="lucide lucide-copy h-3.5 w-3.5"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg></div></div></div><div class="p-3"><div class="w-full h-full text-xs cursor-text"><div class="code-block"><div class="code-line" data-line-number="1" data-line-start="1" data-line-end="1"><div class="line-content"><span class="mtk1">{</span></div></div><div class="code-line" data-line-number="2" data-line-start="2" data-line-end="2"><div class="line-content"><span class="mtk1"></span><span class="mtk9">"content"</span><span class="mtk1">: </span><span class="mtk11">"The full text of the policy or project description goes here..."</span><span class="mtk1">,</span></div></div><div class="code-line" data-line-number="3" data-line-start="3" data-line-end="3"><div class="line-content"><span class="mtk1"></span><span class="mtk9">"source_name"</span><span class="mtk1">: </span><span class="mtk11">"Website FAQ Snip"</span><span class="mtk1">,</span></div></div><div class="code-line" data-line-number="4" data-line-start="4" data-line-end="4"><div class="line-content"><span class="mtk1"></span><span class="mtk9">"category"</span><span class="mtk1">: </span><span class="mtk11">"general"</span></div></div><div class="code-line" data-line-number="5" data-line-start="5" data-line-end="5"><div class="line-content"><span class="mtk1">}</span></div></div></div></div></div></div></pre>

### 📂 List All Entries

Fetches both curated FAQs and document chunks.

* **URL** : `GET /`
* **Response** : Array of

  KnowledgeBaseRead

<pre><div node="[object Object]" class="relative whitespace-pre-wrap word-break-all my-2 rounded-lg bg-list-hover-subtle border border-gray-500/20"><div class="min-h-7 relative box-border flex flex-row items-center justify-between rounded-t border-b border-gray-500/20 px-2 py-0.5"><div class="font-sans text-sm text-ide-text-color opacity-60">json</div><div class="flex flex-row gap-2 justify-end"><div class="cursor-pointer opacity-70 hover:opacity-100"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="lucide lucide-copy h-3.5 w-3.5"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg></div></div></div><div class="p-3"><div class="w-full h-full text-xs cursor-text"><div class="code-block"><div class="code-line" data-line-number="1" data-line-start="1" data-line-end="1"><div class="line-content"><span class="mtk1">[</span></div></div><div class="code-line" data-line-number="2" data-line-start="2" data-line-end="2"><div class="line-content"><span class="mtk1">  {</span></div></div><div class="code-line" data-line-number="3" data-line-start="3" data-line-end="3"><div class="line-content"><span class="mtk1"></span><span class="mtk9">"id"</span><span class="mtk1">: </span><span class="mtk6">1</span><span class="mtk1">,</span></div></div><div class="code-line" data-line-number="4" data-line-start="4" data-line-end="4"><div class="line-content"><span class="mtk1"></span><span class="mtk9">"uuid"</span><span class="mtk1">: </span><span class="mtk11">"893234b2..."</span><span class="mtk1">,</span></div></div><div class="code-line" data-line-number="5" data-line-start="5" data-line-end="5"><div class="line-content"><span class="mtk1"></span><span class="mtk9">"question"</span><span class="mtk1">: </span><span class="mtk11">"What is our refund policy?"</span><span class="mtk1">,</span></div></div><div class="code-line" data-line-number="6" data-line-start="6" data-line-end="6"><div class="line-content"><span class="mtk1"></span><span class="mtk9">"answer"</span><span class="mtk1">: </span><span class="mtk11">"We offer a 30-day refund..."</span><span class="mtk1">,</span></div></div><div class="code-line" data-line-number="7" data-line-start="7" data-line-end="7"><div class="line-content"><span class="mtk1"></span><span class="mtk9">"category"</span><span class="mtk1">: </span><span class="mtk11">"policy"</span><span class="mtk1">,</span></div></div><div class="code-line" data-line-number="8" data-line-start="8" data-line-end="8"><div class="line-content"><span class="mtk1"></span><span class="mtk9">"source_type"</span><span class="mtk1">: </span><span class="mtk11">"faq"</span><span class="mtk1">,</span></div></div><div class="code-line" data-line-number="9" data-line-start="9" data-line-end="9"><div class="line-content"><span class="mtk1"></span><span class="mtk9">"source_name"</span><span class="mtk1">: </span><span class="mtk5">null</span><span class="mtk1">,</span></div></div><div class="code-line" data-line-number="10" data-line-start="10" data-line-end="10"><div class="line-content"><span class="mtk1"></span><span class="mtk9">"storage_path"</span><span class="mtk1">: </span><span class="mtk5">null</span><span class="mtk1">,</span></div></div><div class="code-line" data-line-number="11" data-line-start="11" data-line-end="11"><div class="line-content"><span class="mtk1"></span><span class="mtk9">"chunk_index"</span><span class="mtk1">: </span><span class="mtk5">null</span><span class="mtk1">,</span></div></div><div class="code-line" data-line-number="12" data-line-start="12" data-line-end="12"><div class="line-content"><span class="mtk1"></span><span class="mtk9">"has_embedding"</span><span class="mtk1">: </span><span class="mtk5">true</span></div></div><div class="code-line" data-line-number="13" data-line-start="13" data-line-end="13"><div class="line-content"><span class="mtk1">  },</span></div></div><div class="code-line" data-line-number="14" data-line-start="14" data-line-end="14"><div class="line-content"><span class="mtk1">  {</span></div></div><div class="code-line" data-line-number="15" data-line-start="15" data-line-end="15"><div class="line-content"><span class="mtk1"></span><span class="mtk9">"id"</span><span class="mtk1">: </span><span class="mtk6">42</span><span class="mtk1">,</span></div></div><div class="code-line" data-line-number="16" data-line-start="16" data-line-end="16"><div class="line-content"><span class="mtk1"></span><span class="mtk9">"uuid"</span><span class="mtk1">: </span><span class="mtk11">"7cc3482a..."</span><span class="mtk1">,</span></div></div><div class="code-line" data-line-number="17" data-line-start="17" data-line-end="17"><div class="line-content"><span class="mtk1"></span><span class="mtk9">"question"</span><span class="mtk1">: </span><span class="mtk11">"Excerpt from manual.pdf (Part 1)"</span><span class="mtk1">,</span></div></div><div class="code-line" data-line-number="18" data-line-start="18" data-line-end="18"><div class="line-content"><span class="mtk1"></span><span class="mtk9">"answer"</span><span class="mtk1">: </span><span class="mtk11">"This document outlines the construction standards..."</span><span class="mtk1">,</span></div></div><div class="code-line" data-line-number="19" data-line-start="19" data-line-end="19"><div class="line-content"><span class="mtk1"></span><span class="mtk9">"category"</span><span class="mtk1">: </span><span class="mtk11">"technical"</span><span class="mtk1">,</span></div></div><div class="code-line" data-line-number="20" data-line-start="20" data-line-end="20"><div class="line-content"><span class="mtk1"></span><span class="mtk9">"source_type"</span><span class="mtk1">: </span><span class="mtk11">"document"</span><span class="mtk1">,</span></div></div><div class="code-line" data-line-number="21" data-line-start="21" data-line-end="21"><div class="line-content"><span class="mtk1"></span><span class="mtk9">"source_name"</span><span class="mtk1">: </span><span class="mtk11">"manual.pdf"</span><span class="mtk1">,</span></div></div><div class="code-line" data-line-number="22" data-line-start="22" data-line-end="22"><div class="line-content"><span class="mtk1"></span><span class="mtk9">"storage_path"</span><span class="mtk1">: </span><span class="mtk11">"user_123/1648827361-manual.pdf"</span><span class="mtk1">,</span></div></div><div class="code-line" data-line-number="23" data-line-start="23" data-line-end="23"><div class="line-content"><span class="mtk1"></span><span class="mtk9">"chunk_index"</span><span class="mtk1">: </span><span class="mtk6">0</span><span class="mtk1">,</span></div></div><div class="code-line" data-line-number="24" data-line-start="24" data-line-end="24"><div class="line-content"><span class="mtk1"></span><span class="mtk9">"has_embedding"</span><span class="mtk1">: </span><span class="mtk5">true</span></div></div><div class="code-line" data-line-number="25" data-line-start="25" data-line-end="25"><div class="line-content"><span class="mtk1">  }</span></div></div><div class="code-line" data-line-number="26" data-line-start="26" data-line-end="26"><div class="line-content"><span class="mtk1">]</span></div></div></div></div></div></div></pre>

---

## 3. Data Models & Variables

KnowledgeBaseEntry Fields

| Variable Name     | Type    | Description                                                   |
| ----------------- | ------- | ------------------------------------------------------------- |
| **id**      | Integer | Internal ID (Primary Key)                                     |
| **uuid**    | String  | Public unique identifier                                      |
| `question`      | String  | For FAQs: The user's question. For docs: A descriptive title. |
| `answer`        | String  | The actual content or text chunk.                             |
| `category`      | String  | null                                                          |
| `source_type`   | String  | `faq` for manual entries, `document` for uploaded files.  |
| `source_name`   | String  | null                                                          |
| `storage_path`  | String  | null                                                          |
| `chunk_index`   | Integer | null                                                          |
| `has_embedding` | Boolean | True if the AI has processed and "learned" this data.         |

---

## 4. Frontend Integration Tips

* **Filtering** : When displaying the list to the user, you can group by `source_name` to show which chunks belong to which document.
* **Loading State** : File uploads and text pasting trigger embedding generation on the backend. This might take a few seconds. Ensure your UI has a "Processing..." indicator.
* **Error Handling** :
* `401 Unauthorized`: Token expired.
* `413 Request Entity Too Large`: File is too big.
* `500 Internal Server Error`: Usually means OpenAI embedding or Supabase upload failed.
