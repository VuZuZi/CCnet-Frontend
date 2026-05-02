# CCnet-Frontend/AGENTS.md — Frontend Agent Rules

This file defines frontend-specific rules for AI coding agents working inside `CCnet-Frontend/`.

The root `../AGENTS.md` still applies. If there is any conflict, follow the stricter rule.

---

## 1. Frontend Summary

The frontend is a React/Vite application using:

- React
- Vite
- React Router
- Zustand
- Axios
- Tailwind CSS
- feature-based folders
- in-memory access token handling
- httpOnly cookie refresh token flow
- protected routes for user, organizer, and admin areas

The frontend is responsible for user experience and navigation, but it is **not** the source of security truth. Backend authorization must always enforce sensitive access.

---

## 2. Frontend Directory Map

Important frontend areas:

```text
CCnet-Frontend/
├─ src/
│  ├─ app/
│  ├─ config/
│  ├─ features/
│  ├─ pages/
│  └─ shared/
├─ package.json
└─ AGENTS.md
```

Common feature pattern:

```text
src/features/<domain>/
├─ api/
├─ components/
├─ hooks/
├─ pages/
├─ stores/
└─ utils/
```

Do not assume every feature follows the same structure perfectly.

---

## 3. Core Frontend Files

Important files from project context:

```text
src/app/router.jsx
src/shared/lib/httpClient.js
src/shared/lib/tokenManager.js
src/features/auth/api/authAPI.js
src/features/auth/stores/useAuthStore.js
src/shared/components/common/ProtectedRoute.jsx
src/shared/components/common/PublicRoute.jsx
src/shared/components/common/AuthGateway.jsx
src/shared/constants/roles
```

Before changing auth, routing, session restore, or role behavior, read these files.

---

## 4. Authentication Model

The frontend uses:

```text
access token: in memory only
refresh token: httpOnly cookie
```

Rules:

- Do not store access tokens in `localStorage`.
- Do not store access tokens in `sessionStorage`.
- Do not manually persist access tokens across reloads.
- Do not bypass `tokenManager`.
- Do not bypass `httpClient` for authenticated API calls.
- Do not create a second refresh-token mechanism.
- Do not send refresh tokens manually unless following the existing API pattern.

The access token is held in memory by `tokenManager`.

The refresh token is stored in an httpOnly cookie set by the backend.

Session restoration happens by calling `/auth/refresh-token`, then `/auth/me`.

---

## 5. HTTP Client Rules

Use the shared Axios client:

```text
src/shared/lib/httpClient.js
```

Known behavior:

- Attaches Bearer access token from `tokenManager`.
- Removes `Content-Type` for `FormData`.
- Handles retry behavior for non-401 retryable errors.
- Handles 401 by refreshing access token.
- Queues failed requests while refresh is in progress.
- Dispatches logout event if refresh fails.

Rules:

- Do not call `axios` directly for authenticated app API calls unless there is a strong reason.
- Use feature API files under `src/features/*/api/`.
- Preserve refresh queue behavior.
- Preserve FormData behavior.
- Do not make refresh logic recursive.
- Do not dispatch logout casually.
- Do not swallow API errors silently.

If a request needs authentication, it should usually go through `httpClient`.

---

## 6. Auth Store Rules

Important file:

```text
src/features/auth/stores/useAuthStore.js
```

Known behavior:

- `setAuthSuccess(user, accessToken)` stores token in memory and updates auth state.
- `clearAuth()` removes token and clears user state.
- `checkAuthSession()` refreshes token if needed, then calls `authAPI.getMe()`.
- Auth logout events clear the store.

Rules:

- Do not introduce duplicate auth stores.
- Do not persist access tokens.
- Do not assume `user.id`, `user._id`, and `user.userId` are always the same shape; use existing selector patterns.
- Do not bypass `checkAuthSession()` for app boot/session restore.
- When changing returned user shape, check all consumers.

---

## 7. Routing Rules

Important file:

```text
src/app/router.jsx
```

Known route areas:

- public auth routes: login, register, verify OTP, forgot password;
- public project routes: project list, map, detail;
- public need-help routes;
- protected user routes: profile, organizer apply/request, messages, notifications;
- protected consumer routes: following, community, need-help create/edit;
- protected organizer routes: project create/edit, workspace, assigned requests;
- protected admin routes: users, organizers, projects, finance, reports, refunds, notifications.

Rules:

- Do not rely on frontend routes for real authorization.
- Backend must enforce role and ownership checks.
- If adding a protected page, use `ProtectedRoute`.
- If adding an admin page, check both frontend route role and backend API authorization.
- Do not create duplicate route paths unless intentional.
- If moving routes, check links, sidebar nav, redirects, and role defaults.

Known frontend caveats:

- Some route definitions are duplicated.
- Some routes may include placeholder/mock pages.
- `workspace/stats` has been observed as a mock/under-construction route.
- Role casing may contain legacy variants such as `Organizer`.

Do not “clean up” route duplication unless the task is specifically route cleanup and you have verified no pages break.

---

## 8. Role Rules

Canonical backend roles are:

```text
user
organizer
admin
```

The backend `User` schema does **not** define `manager`.

Rules:

- Do not add frontend `manager` flows unless the backend schema and product decision are updated.
- Do not treat `manager` as active.
- Use lowercase canonical roles for new code.
- Be careful with existing role constants and legacy casing.
- Do not assume frontend role checks are sufficient security.

If frontend constants include broader admin role groups, verify backend support before relying on them.

---

## 9. API Layer Rules

Prefer feature API modules:

```text
src/features/auth/api/authAPI.js
src/features/project/api/*
src/features/transaction/api/*
src/features/disbursement/api/*
src/features/admin/api/*
src/features/media/api/*
```

Rules:

- Keep API calls in feature API files, not directly inside large components, unless the existing feature already does so.
- Preserve response shape assumptions.
- If backend returns `ApiResponse.success`, check whether data is under `response.data.data`.
- For file upload, use `FormData` and let `httpClient` remove `Content-Type`.
- Do not manually attach Authorization headers if using `httpClient`.
- Do not hardcode full backend URLs inside feature code; use configured API base.

When changing an endpoint path, update both frontend API module and backend route references.

---

## 10. Form and Validation Rules

Use existing validation patterns and schemas where present.

Rules:

- Do not rely only on frontend validation.
- Backend validation must remain the source of truth.
- Preserve Vietnamese user-facing validation messages unless asked to change.
- For money fields, normalize display/input carefully and confirm backend expected units.
- For file upload, respect backend size/type/context constraints.
- For organizer/KYC forms, do not remove required documents, location, or bank fields without product approval.

---

## 11. Financial UI Rules

Frontend financial pages must be treated as high-risk UI.

Areas include:

- donation/payment result;
- admin finance pages;
- refund request pages;
- disbursement pages;
- evidence financial reports;
- project funding progress;
- wallet/suspense/claim flows if present.

Rules:

- Do not change displayed financial amounts without checking backend source fields.
- Do not invent financial status labels.
- Do not infer payment success from UI alone.
- Payment success must come from backend transaction state.
- Do not call money-changing endpoints automatically on page load unless existing flow does so.
- Do not hide failed/pending statuses.
- Do not bypass admin confirmation flows.

When touching financial UI, read:

```text
../docs/agent/05-financial-flow.md
../docs/agent/06-project-evidence-disbursement.md
```

---

## 12. Evidence, Media, and Upload UI Rules

Important concepts:

- media upload can include EXIF/GPS metadata;
- client location may be provided as fallback;
- evidence media must belong to organizer;
- receipt media supports financial evidence;
- server validates magic bytes and ownership.

Rules:

- Use existing media upload APIs.
- Use `FormData` correctly.
- Do not weaken client-side file restrictions unless backend also supports it.
- Do not assume client-side GPS means evidence is approved.
- Do not fake `mediaIds` or receipt IDs.
- Do not reuse media IDs across users or organizers.
- Preserve warnings about missing GPS metadata when used for field evidence.

---

## 13. Organizer and KYC UI Rules

Organizer onboarding depends on backend organizer request and KYC logic.

Rules:

- User must be authenticated.
- Email verification matters.
- Organizer request moves to admin review.
- Micro-deposit UI may be legacy/inactive unless confirmed.
- Bank account data must match backend supported fields.
- Do not expose sensitive document data unnecessarily.
- Do not assume approval on submission.
- Do not change KYC status from frontend.

Organizer approval is admin/backend-controlled.

---

## 14. Admin UI Rules

Admin UI includes:

- dashboard;
- user management;
- organizer requests;
- organizer action logs;
- project management;
- project preview;
- finance summary/detail;
- reports;
- refund requests;
- notifications;
- need-help review.

Rules:

- Admin pages should be protected by frontend route guard and backend authorization.
- Do not add admin UI that calls unprotected endpoints.
- Do not show manager-only UX unless backend supports manager role.
- Admin actions usually require reason/feedback.
- Preserve audit-log-related flows.
- Do not auto-submit destructive admin actions.
- Do not combine unrelated admin mutations in one UI action.

---

## 15. Project UI Rules

Project-related UI includes:

- list;
- map;
- detail;
- create/edit;
- updating milestones;
- organizer workspace;
- admin project review.

Rules:

- Funded and volunteer-only projects have different status flows.
- Admin approval maps funded projects to `FUNDING`.
- Admin approval maps volunteer-only projects to `RECRUITING`.
- Project cancellation can trigger refunds and notifications.
- Do not change status labels or transitions without checking backend constants.
- Do not let UI imply a project is funded/active unless backend status confirms it.
- Do not bypass organizer ownership assumptions.

When touching project lifecycle UI, read:

```text
../docs/agent/03-business-rules.md
../docs/agent/06-project-evidence-disbursement.md
```

---

## 16. Styling and Component Rules

Use the existing frontend style system.

Rules:

- Follow existing Tailwind patterns.
- Prefer existing shared components.
- Do not introduce new UI libraries unless requested.
- Do not rewrite whole pages for small fixes.
- Keep accessibility basics: labels, button text, focus states, disabled/loading states.
- Preserve Vietnamese UI copy unless asked to translate or rewrite.
- Keep loading, empty, error, and success states consistent.

---

## 17. Frontend Editing Checklist

Before changing frontend code:

```text
1. Which route/page is affected?
2. Which feature owns the page?
3. Which API module is used?
4. Does the page require auth?
5. Which roles can access it?
6. Does backend enforce the same rule?
7. Does the change involve money, KYC, evidence, disbursement, or admin approval?
8. Does it upload files?
9. Does it depend on token refresh/session restore?
10. What manual UI flow can verify it?
```

---

## 18. Verification Rules

After frontend changes, report:

```text
Changed files:
Routes/pages affected:
API calls affected:
Auth/role impact:
Manual verification steps:
Commands run:
Remaining risks:
```

If no frontend test suite exists or no tests were run, say so.

Do not claim browser behavior is verified unless actually checked.

Do not claim backend behavior is fixed by frontend-only changes.

---

## 19. Stop Conditions

Stop and ask before editing if:

- frontend needs a new backend API;
- role behavior is ambiguous;
- route mentions `manager`;
- token storage/session behavior changes;
- payment success/failure behavior changes;
- admin destructive action changes;
- file upload constraints change;
- project/evidence/disbursement status logic changes;
- a UI change could misrepresent financial state;
- the task requires changing both frontend and backend but only one side is understood.

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **CCnet-Frontend** (7700 symbols, 12087 relationships, 230 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/CCnet-Frontend/context` | Codebase overview, check index freshness |
| `gitnexus://repo/CCnet-Frontend/clusters` | All functional areas |
| `gitnexus://repo/CCnet-Frontend/processes` | All execution flows |
| `gitnexus://repo/CCnet-Frontend/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
