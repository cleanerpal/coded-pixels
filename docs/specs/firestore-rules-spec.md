# CodedPixels — Firestore Security Rules Specification

**Document Owner:** Dr. Lena Moreau  
**Security:** Dr. Rafael Ortiz + Dr. Victor Lang  
**Auth/RBAC:** Dr. Fatima Al-Sayed  
**Status:** M3 deliverable — implement before PII endpoints ship  
**Region:** `europe-west2`  
**Schema:** [`firestore-schema.md`](firestore-schema.md)

---

## 1. Design Principles

| Principle | Implementation |
|-----------|----------------|
| **Deny by default** | No matching rule → deny |
| **Tenant isolation** | All business data under `companies/{companyId}`; cross-tenant access impossible |
| **Members doc = source of truth** | Authorise via `members/{uid}` existence + `role` field; custom claims are a hint only |
| **Sensitive writes via Functions** | M3 signups/waitlist, lead submission, provisioning — **Admin SDK** in Callable/HTTP Functions |
| **No public slug lookup** | `slugs/` readable only by Admin SDK (middleware server-side) |
| **Published content only** | Public may read **published version** docs when `versionId == page.publishedVersionId` |
| **Stripe Extension** | Extension-managed collections — app clients **denied**; Extension service account writes |

---

## 2. Role Hierarchy

Used in helper functions (higher includes lower where noted):

| Role | Read tenant | Edit content | Publish | Leads/CRM | Members | Billing |
|------|-------------|--------------|---------|-----------|---------|---------|
| **owner** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **admin** | ✅ | ✅ | ✅ | ✅ | ✅ | view |
| **editor** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **viewer** | ✅ | ❌ | ❌ | read | ❌ | ❌ |

**Platform Phase 2 launch:** Only `owner` exists until Phase 2.1 invites.

---

## 3. Helper Functions

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isSignedIn() {
      return request.auth != null;
    }

    function uid() {
      return request.auth.uid;
    }

    function memberPath(companyId) {
      return /databases/$(database)/documents/companies/$(companyId)/members/$(uid());
    }

    function isMember(companyId) {
      return isSignedIn() && exists(memberPath(companyId));
    }

    function memberRole(companyId) {
      return get(memberPath(companyId)).data.role;
    }

    function hasMinRole(companyId, minRole) {
      return isMember(companyId) && (
        minRole == 'viewer' ||
        (minRole == 'editor' && memberRole(companyId) in ['editor', 'admin', 'owner']) ||
        (minRole == 'admin' && memberRole(companyId) in ['admin', 'owner']) ||
        (minRole == 'owner' && memberRole(companyId) == 'owner')
      );
    }

    function companyHasFeature(companyId, featureId) {
      return featureId in get(/databases/$(database)/documents/companies/$(companyId)).data.plan.featureIds;
    }

    function isSupportAgent() {
      return isSignedIn() && request.auth.token.supportAgent == true;
    }

    // Published version: public read OR member read
    function isPublishedVersion(companyId, siteId, pageId, versionId) {
      let page = get(/databases/$(database)/documents/companies/$(companyId)/sites/$(siteId)/pages/$(pageId));
      return page.data.publishedVersionId == versionId
        && get(/databases/$(database)/documents/companies/$(companyId)/sites/$(siteId)/pages/$(pageId)/versions/$(versionId)).data.status == 'published';
    }
  }
}
```

---

## 4. Collection Rules

### 4.1 M3 — Marketing MVP (implement first)

#### `signups/{signupId}`

| Client read | Client write |
|-------------|--------------|
| ❌ Deny all | ❌ Deny all |

**Write path:** Callable Function `submitSignup` (Admin SDK) after validation + App Check.

```javascript
match /signups/{signupId} {
  allow read, write: if false;
}
```

#### `waitlist_site_import/{entryId}`

| Client read | Client write |
|-------------|--------------|
| ❌ Deny all | ❌ Deny all |

**Write path:** Callable Function `submitSiteImportWaitlist` (Admin SDK).

```javascript
match /waitlist_site_import/{entryId} {
  allow read, write: if false;
}
```

---

### 4.2 Platform index collections

#### `slugs/{slug}`

| Client read | Client write |
|-------------|--------------|
| ❌ Deny all | ❌ Deny all |

**Read path:** Site renderer middleware via Admin SDK only (prevents tenant enumeration).

```javascript
match /slugs/{slug} {
  allow read, write: if false;
}
```

#### `templates/{templateId}`

| Client read | Client write |
|-------------|--------------|
| ✅ Any signed-in user (builder/marketing preview) | ❌ Deny — Admin/CI only |

```javascript
match /templates/{templateId} {
  allow read: if isSignedIn();
  allow write: if false;
}
```

#### `users/{uid}`

| Client read | Client write |
|-------------|--------------|
| ✅ Own doc only | ❌ Deny — Functions only |

```javascript
match /users/{userId} {
  allow read: if isSignedIn() && uid() == userId;
  allow write: if false;
}
```

#### `auditLogs/{logId}`

| Client read | Client write |
|-------------|--------------|
| ❌ Deny | ❌ Deny — Admin SDK only (support console) |

Support agents use Admin SDK with separate audit pipeline — not client rules.

```javascript
match /auditLogs/{logId} {
  allow read, write: if false;
}
```

---

### 4.3 Stripe Extension collections (Q63)

**Deny all client access.** Extension uses its own service identity.

```javascript
match /customers/{uid} {
  allow read, write: if false;
}
match /products/{productId} {
  allow read, write: if false;
}
match /checkout_sessions/{sessionId} {
  allow read, write: if false;
}
match /subscriptions/{subscriptionId} {
  allow read, write: if false;
}
```

App reads subscription state via **Cloud Functions** or **Firestore triggers** that copy allowed fields to `companies/{companyId}`.

---

### 4.4 Tenant root — `companies/{companyId}`

```javascript
match /companies/{companyId} {
  allow read: if hasMinRole(companyId, 'viewer');
  allow create: if false;  // provisionTenant only
  allow update: if hasMinRole(companyId, 'owner')
    && !request.resource.data.diff(resource.data).affectedKeys()
        .hasAny(['ownerUid', 'stripeCustomerId', 'stripeSubscriptionId']);
  // Stripe IDs updated by Functions/webhooks only — omit from client update allow
  allow delete: if false;  // Delete User Data Extension / Function
}
```

**Note:** In practice, **all company updates** should go through Cloud Functions in Phase 2 to protect Stripe fields. Simpler M3-adjacent rule:

```javascript
match /companies/{companyId} {
  allow read: if hasMinRole(companyId, 'viewer');
  allow write: if false;  // Functions only until dashboard ships
}
```

Use the stricter **write: false** until builder dashboard is implemented, then open controlled updates.

#### `companies/{companyId}/members/{memberId}`

```javascript
match /companies/{companyId}/members/{memberId} {
  allow read: if hasMinRole(companyId, 'viewer');
  allow write: if false;  // invite accept / role change via Functions
}
```

#### `companies/{companyId}/invites/{inviteId}` (Phase 2.1)

```javascript
match /companies/{companyId}/invites/{inviteId} {
  allow read: if hasMinRole(companyId, 'admin');
  allow write: if false;
}
```

#### `companies/{companyId}/usage/{periodId}`

```javascript
match /companies/{companyId}/usage/{periodId} {
  allow read: if hasMinRole(companyId, 'viewer');
  allow write: if false;  // increment via Functions only
}
```

---

### 4.5 Sites — `companies/{companyId}/sites/{siteId}`

```javascript
match /companies/{companyId}/sites/{siteId} {
  allow read: if hasMinRole(companyId, 'viewer');
  allow write: if false;  // Functions + publishSite; open to editor+ when builder client writes ship
}
```

#### Pages — `.../pages/{pageId}`

```javascript
match /companies/{companyId}/sites/{siteId}/pages/{pageId} {
  allow read: if hasMinRole(companyId, 'viewer');
  allow write: if false;  // builder via Functions or editor+ when implemented
}
```

#### Versions — `.../pages/{pageId}/versions/{versionId}`

**Critical public read rule for live sites:**

```javascript
match /companies/{companyId}/sites/{siteId}/pages/{pageId}/versions/{versionId} {
  allow read: if isPublishedVersion(companyId, siteId, pageId, versionId)
              || hasMinRole(companyId, 'viewer');
  allow write: if false;  // draft edits via Functions; or hasMinRole(companyId, 'editor') when client-side builder ships
}
```

**Site renderer (server):** Prefer Admin SDK for public pages to avoid rule `get()` cost on every request — rules above support client SDK if needed.

#### Assets — `.../assets/{assetId}`

```javascript
match /companies/{companyId}/sites/{siteId}/assets/{assetId} {
  allow read: if hasMinRole(companyId, 'viewer');
  allow create: if hasMinRole(companyId, 'editor')
    && request.resource.data.scanStatus == 'pending';
  allow update: if hasMinRole(companyId, 'editor')
    && resource.data.scanStatus == 'clean';
  allow delete: if hasMinRole(companyId, 'admin');
}
```

**Note:** Upload flow should use **signed URL or Function**; metadata doc created after ClamAV `clean`. Safer Phase 2 pattern: **all asset writes via Functions** (`allow write: if false`).

#### Leads — `.../leads/{leadId}`

```javascript
match /companies/{companyId}/sites/{siteId}/leads/{leadId} {
  allow read: if hasMinRole(companyId, 'viewer')
              && companyHasFeature(companyId, 'crm');
  allow create: if false;  // submitLead Callable only
  allow update: if hasMinRole(companyId, 'editor')
              && companyHasFeature(companyId, 'crm')
              && request.resource.data.diff(resource.data).affectedKeys()
                  .hasOnly(['status', 'readAt', 'archivedAt']);
  allow delete: if hasMinRole(companyId, 'admin');
}
```

**Base plan contact forms:** Still write via `submitLead` Function (Admin SDK). CRM add-on gates **dashboard read**, not form capture (per project plan base includes contact form).

#### Products — `.../products/{productId}`

```javascript
match /companies/{companyId}/sites/{siteId}/products/{productId} {
  allow read: if hasMinRole(companyId, 'viewer')
              || (resource.data.status == 'published'
                  && companyHasFeature(companyId, 'ecommerce'));
  allow write: if false;  // editor+ via Functions when ecommerce dashboard ships
}
```

Public product read for live shop: use **published product list via site renderer Admin SDK** or extend rules with `status == 'published'` for unauthenticated read on client sites.

#### Domains — `.../domains/{domainId}` (Phase 2.1)

```javascript
match /companies/{companyId}/sites/{siteId}/domains/{domainId} {
  allow read: if hasMinRole(companyId, 'admin');
  allow write: if false;
}
```

---

## 5. Firebase Storage Rules

**Path:** `companies/{companyId}/sites/{siteId}/assets/{assetId}/{fileName}`

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /companies/{companyId}/sites/{siteId}/assets/{assetId}/{fileName} {
      allow read: if request.auth != null
        && firestore.get(/databases/(default)/documents/companies/$(companyId)/members/$(request.auth.uid)).data.role
           in ['owner', 'admin', 'editor', 'viewer'];
      allow write: if request.auth != null
        && firestore.get(/databases/(default)/documents/companies/$(companyId)/members/$(request.auth.uid)).data.role
           in ['owner', 'admin', 'editor']
        && request.resource.size < 5 * 1024 * 1024
        && request.resource.contentType.matches('image/(jpeg|png|webp|gif)');
    }
  }
}
```

**Phase 2 recommendation:** Upload via Callable Function + signed URL; Storage **write: false** for clients until ClamAV pipeline verified.

---

## 6. Callable Function Patterns

All sensitive client-initiated writes use **Callable Functions v2** (`europe-west2`):

| Function | Auth | App Check | Rate limit | Writes |
|----------|------|-----------|------------|--------|
| `submitSignup` | Optional (email only) | ✅ Required | 5/hr/IP | `signups/` |
| `submitSiteImportWaitlist` | Optional | ✅ Required | 5/hr/IP | `waitlist_site_import/` |
| `submitLead` | ❌ Public + reCAPTCHA | ✅ Required | 10/hr/IP/form | `.../leads/` |
| `provisionTenant` | ✅ Post-Stripe | ✅ | Internal | `companies/**`, `slugs/`, `users/` |
| `publishSite` | ✅ Member editor+ | ✅ | 30/hr/company | `.../versions/` |

### Callable hardening checklist

```typescript
// functions/src/lib/callable.ts pattern
export const submitSignup = onCall(
  { region: 'europe-west2', enforceAppCheck: true },
  async (request) => {
    // 1. Validate App Check (automatic when enforceAppCheck: true)
    // 2. Rate limit by IP hash (Redis or Firestore counter)
    // 3. Validate + normalise payload (Zod)
    // 4. Admin SDK write — bypasses rules
    // 5. Return { success: true } — no internal IDs leaked
  }
);
```

**Never** expose Admin SDK to client. **Never** allow direct Firestore client writes to PII collections.

---

## 7. App Check + Rate Limiting (Q49)

| Surface | App Check | Rate limit store |
|---------|-----------|------------------|
| Marketing signups/waitlist | ✅ | `rateLimits/{ipHash}_{action}` doc or Redis |
| Public form submit | ✅ + reCAPTCHA v3 | Per IP + siteId + formSectionId |
| Builder Callable | ✅ | Per uid |
| Site renderer | ✅ (optional public) | CDN/WAF Phase 3 |

**Rate limit doc (optional Firestore pattern):**

```
rateLimits/{docId}  →  { count, windowStart, expiresAt }
```

Rules: **deny all client access** to `rateLimits/`.

---

## 8. Support Access (Q43)

| Phase | Mechanism | Rules impact |
|-------|-----------|--------------|
| Phase 2 | Admin SDK read-only console | Bypasses rules — audit logged |
| Phase 2.5 | `supportAgent` custom claim | Optional read-only rules branch — **not recommended**; keep Admin SDK |

Do **not** add broad `supportAgent` read rules in Firestore client rules — use Admin SDK only.

---

## 9. Phase Rollout

| Rules block | Ship when |
|-------------|-----------|
| §4.1 M3 (`signups`, `waitlist`) | **M3** — before endpoints |
| §4.2 `templates` read | Platform Phase 2 B1 |
| §4.4–4.5 full tenant rules | Platform Phase 2 B1 (deny writes until builder) |
| §4.3 Stripe collections deny | Platform Phase 2 B6 |
| Storage rules | Platform Phase 2 B7 |

**M3 minimum deploy:** Only §4.1 + deny-all default for everything else until Platform Phase 2.

---

## 10. Rules Unit Tests

**Dr. Liam Harper** — `@firebase/rules-unit-testing` in CI:

```typescript
// tests/firestore/rules/signups.test.ts
describe('M3 signups', () => {
  it('denies client create', async () => {
    await assertFails(addDoc(signupsRef, { email: 'a@b.com' }));
  });
});

describe('tenant isolation', () => {
  it('denies member of company A reading company B', async () => {
    await assertFails(getDoc(doc(db, 'companies/companyB')));
  });
});

describe('published versions', () => {
  it('allows public read of published version only', async () => {
    await assertSucceeds(getDoc(publishedVersionRef));
    await assertFails(getDoc(draftVersionRef));
  });
});
```

**CI gate:** Rules tests must pass before deploy to `europe-west2`.

---

## 11. Complete Starter `firestore.rules` (M3 + scaffold)

Deploy this at M3; expand Platform Phase 2 sections as features ship.

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isSignedIn() {
      return request.auth != null;
    }

    function uid() {
      return request.auth.uid;
    }

    function memberPath(companyId) {
      return /databases/$(database)/documents/companies/$(companyId)/members/$(uid());
    }

    function isMember(companyId) {
      return isSignedIn() && exists(memberPath(companyId));
    }

    function memberRole(companyId) {
      return get(memberPath(companyId)).data.role;
    }

    function hasMinRole(companyId, minRole) {
      return isMember(companyId) && (
        minRole == 'viewer' ||
        (minRole == 'editor' && memberRole(companyId) in ['editor', 'admin', 'owner']) ||
        (minRole == 'admin' && memberRole(companyId) in ['admin', 'owner']) ||
        (minRole == 'owner' && memberRole(companyId) == 'owner')
      );
    }

    function isPublishedVersion(companyId, siteId, pageId, versionId) {
      let pagePath = /databases/$(database)/documents/companies/$(companyId)/sites/$(siteId)/pages/$(pageId);
      let versionPath = /databases/$(database)/documents/companies/$(companyId)/sites/$(siteId)/pages/$(pageId)/versions/$(versionId);
      return get(pagePath).data.publishedVersionId == versionId
        && get(versionPath).data.status == 'published';
    }

    // ─── M3: Marketing PII — Functions only ───
    match /signups/{signupId} {
      allow read, write: if false;
    }
    match /waitlist_site_import/{entryId} {
      allow read, write: if false;
    }
    match /rateLimits/{docId} {
      allow read, write: if false;
    }

    // ─── Platform index — locked down ───
    match /slugs/{slug} {
      allow read, write: if false;
    }
    match /auditLogs/{logId} {
      allow read, write: if false;
    }

    // ─── Templates — authenticated read ───
    match /templates/{templateId} {
      allow read: if isSignedIn();
      allow write: if false;
    }

    match /users/{userId} {
      allow read: if isSignedIn() && uid() == userId;
      allow write: if false;
    }

    // ─── Stripe Extension — client denied ───
    match /customers/{document=**} {
      allow read, write: if false;
    }
    match /products/{productId} {
      allow read, write: if false;
    }
    match /checkout_sessions/{sessionId} {
      allow read, write: if false;
    }
    match /subscriptions/{subscriptionId} {
      allow read, write: if false;
    }

    // ─── Tenant tree — Platform Phase 2 ───
    match /companies/{companyId} {
      allow read: if hasMinRole(companyId, 'viewer');
      allow write: if false;

      match /members/{memberId} {
        allow read: if hasMinRole(companyId, 'viewer');
        allow write: if false;
      }
      match /invites/{inviteId} {
        allow read: if hasMinRole(companyId, 'admin');
        allow write: if false;
      }
      match /usage/{periodId} {
        allow read: if hasMinRole(companyId, 'viewer');
        allow write: if false;
      }
      match /sites/{siteId} {
        allow read: if hasMinRole(companyId, 'viewer');
        allow write: if false;

        match /pages/{pageId} {
          allow read: if hasMinRole(companyId, 'viewer');
          allow write: if false;

          match /versions/{versionId} {
            allow read: if isPublishedVersion(companyId, siteId, pageId, versionId)
                        || hasMinRole(companyId, 'viewer');
            allow write: if false;
          }
        }
        match /assets/{assetId} {
          allow read: if hasMinRole(companyId, 'viewer');
          allow write: if false;
        }
        match /leads/{leadId} {
          allow read: if hasMinRole(companyId, 'viewer');
          allow update: if hasMinRole(companyId, 'editor')
            && request.resource.data.diff(resource.data).affectedKeys()
                .hasOnly(['status', 'readAt', 'archivedAt']);
          allow create, delete: if false;
        }
        match /products/{productId} {
          allow read: if hasMinRole(companyId, 'viewer');
          allow write: if false;
        }
        match /domains/{domainId} {
          allow read: if hasMinRole(companyId, 'admin');
          allow write: if false;
        }
      }
    }
  }
}
```

---

## 12. Expert Sign-Off

| Expert | Status |
|--------|--------|
| Dr. Rafael Ortiz | ☑ Rules architecture approved |
| Dr. Victor Lang | ☑ Deny-default + Function-first writes approved |
| Dr. Fatima Al-Sayed | ☑ RBAC via members doc approved |
| Dr. Patrick O'Brien | ☑ M3 PII paths secured |
| Dr. Liam Harper | ☑ Test plan defined |

---

## 13. Related Documents

| Document | Purpose |
|----------|---------|
| [`firestore-schema.md`](firestore-schema.md) | Field definitions |
| [`codedpixels-project-plan.md`](codedpixels-project-plan.md) | M3 timeline |
| [`expert-review-memo.md`](expert-review-memo.md) | P1 closure |

**Next action:** Copy §11 to `firestore.rules` in repo root at M3; add `tests/firestore/` per §10.
