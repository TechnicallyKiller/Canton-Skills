# Skill Feedback — Invoice Financing Demo (2026-06-05)

Discrepancies found while dogfooding the catalog to build the Canton invoice-financing
marketplace. Legend: ✅ accurate · ⚠️ gap · ❌ wrong.

> **STATUS: RESOLVED (2026-06-05).** All ❌ errors and ⚠️ gaps below have been applied
> to the skills/KB; the `submitMulti`→`actAs` change was re-verified (examples still
> compile + tests pass). The four app-level skills moved to ✅. See the ROADMAP
> verification log.

## Priority for next session (fix order)

**❌ Errors — wrong content that will break devs' code (fix first):**
1. `canton-ledger-api`: `Commands` has **no `applicationId`** field in Ledger API v2
   (SDK 3.4.11) — it's conveyed by the JWT. Remove `applicationId` from JSON/command
   examples. *(Note: our `canton-ledger-api/examples/create-contract.json` etc. may
   reference it — audit.)*
2. `daml-language`: `DA.Date` does **not** export `Date` (it's built-in — no import).
   Remove any `import DA.Date (Date)`.
3. `daml-language`: `allocatePartyExact` is **not** in `daml-script` (it's in
   `Splice.Testing.Utils` / `splice-util-0.1.4.dar`). Don't reference without flagging.
4. `daml-authorization-patterns`: **CRITICAL** — authority from a parent exercise does
   **not** propagate into a nested sub-exercise body. For a composed assign, the inner
   `create` fails unless the missing party is a **co-controller** of the inner choice.
   Our skill states the rule but the nuance (where the authority boundary sits at
   sub-exercise entry) must be made explicit + worked example added.

**⚠️ `submitMulti` is deprecated in 3.4.11** → use `submit (actAs [p1,p2]) do …`.
Affects `daml-language` + `daml-testing` skills AND our compiled examples
(`daml-testing/examples/BasicTest.daml`, `AuthorizationTest.daml`, and the
`daml-testing` SKILL.md snippet) — update them (they still compile, but with a
deprecation warning).

**⚠️ Gaps to add:**
- `canton-deployment`: document `make setup` non-interactive bypass (`.env.local`),
  the `ghcr.io/digital-asset/decentralized-canton-sync` registry (public), Windows
  CRLF fix on `gradlew`/`*.sh`, WSL Docker `credsStore` gotcha, and "canton unhealthy
  on first `make start` → wait 60s + retry".
- `canton-ledger-api`: tuple return types (`Tuple2.get_1/get_2`), `Date`→
  `java.time.LocalDate`, and `ContractId.getContractId` is a **field** not a method.
- `canton-app-architecture`: transcode codegen Gradle wiring + the generated
  `daml/Daml.java` `ENTITIES` registry as the central wiring point (add a minimal
  `build.gradle.kts` snippet).
- `canton-production-ops`: note `commandId` dedup is per-participant, per-actAs set
  (not global).

**✅ Confirmed accurate (no change):** fully-mediated topology; PQS `active()` +
`payload->>'field' = ?` party-scoped reads; error-category→HTTP table; deterministic
`commandId` hash; `actAs` only needs the requesting party for composed choices; the
`submitMustFail`/`query` test structure; co-controller fix for the assign.

---

## Full findings (verbatim from build session)

### canton-deployment (Phase 0)
1. ⚠️ `make setup` is interactive (Gradle prompts). Bypass: hand-write
   `quickstart/.env.local` (`OBSERVABILITY_ENABLED=false`, `AUTH_MODE=shared-secret`,
   `PARTY_HINT=<org>-<role>-<n>`, `TEST_MODE=off`).
2. ✅ Ports: suffix `975` = JSON API → `http://localhost:3975/v2/livez` confirmed.
3. ⚠️ Splice images come from `ghcr.io/digital-asset/decentralized-canton-sync`
   (public, no creds) — state explicitly.
4. ⚠️ Windows CRLF: `gradlew`/`*.sh` get `\r` → `/bin/sh^M` Error 126. Fix:
   `find . -name "*.sh" -o -name gradlew | xargs sed -i 's/\r//'`.
5. ⚠️ WSL Docker creds: `~/.docker/config.json` `"credsStore":"desktop.exe"` not in
   WSL PATH → build fails. Fix: `printf '{"auths": {}}' > ~/.docker/config.json`.
6. ⚠️ `make start` "canton unhealthy" on first run (health check races gRPC readiness)
   — wait ~60s and re-run `make start`.

### canton-ledger-api (Phase 2)
1. ❌ `Commands` has no `setApplicationId()` in v2 (SDK 3.4.11) — app id is in the JWT.
2. ✅ `actAs` for composed choices only needs the requesting party; co-signatory
   authority flows from contracts' signatory sets.
3. ⚠️ Tuple results `(A,B)` → `daml_prim_da_types.da.types.Tuple2<A,B>` (`get_1`/`get_2`).
4. ⚠️ Daml `Date` → `java.time.LocalDate` (transcode); `LocalDate.parse(s)` works.
5. ✅ PQS `active(qualifiedName)` + `payload->>'supplier' = ?` works as described.
6. ⚠️ transcode `ContractId<T>` exposes the string as field `getContractId` (no `()`).

### canton-app-architecture (Phase 2)
1. ✅ Fully-mediated topology verified; quickstart backend is an accurate reference.
2. ⚠️ transcode codegen Gradle wiring not shown: buildscript classpath
   `com.daml.codegen-java-daml3_4`, register `JavaCodegenTask` on the DAR, add
   `build/generated-daml-bindings` to srcDirs, `compileJava.dependsOn("codeGen")`.
3. ⚠️ Generated `daml/Daml.java` `ENTITIES` registry is the central wiring point for
   both `LedgerApi` (proto↔DTO) and `Pqs` (JSON↔DTO).
4. ✅ Party-scoped PQS reads via `payload->>'field' = ?` scope correctly.

### canton-production-ops (Phase 2)
1. ✅ Error→HTTP table correct (INVALID_ARGUMENT/PERMISSION_DENIED→4xx; ABORTED→409
   retry; DEADLINE_EXCEEDED→504 check-then-retry). In `ErrorMapper.java`.
2. ✅ `SHA-256(partyId:action:key)` `commandId` gives safe stateless dedup.
3. ⚠️ Clarify `commandId` dedup is per-participant, per-actAs set (not global).

### daml-language (Phase 1)
1. ❌ `DA.Date` does not export `Date` (built-in; no import).
2. ❌ `allocatePartyExact` not in `daml-script` (in `Splice.Testing.Utils`).
3. ⚠️ `submitMulti` deprecated → `submit (actAs [p1,p2]) do …`.

### daml-authorization-patterns (Phase 1)
1. ❌ Authority does NOT propagate into nested sub-exercises; inner `create` fails
   ("missing authorization") unless missing party is a co-controller of the inner choice.
2. ✅ Fix: `controller creditor, newCreditor` on `Assign_Invoice` →
   actors {supplier,financier} ∪ signatories(Invoice){supplier,buyer} sufficient.
3. ⚠️ Add a 3-party multi-hop assignment worked example showing the authority boundary.

### daml-testing (Phase 1)
1. ✅ `dpm build && dpm test` — 9 tests green; structure accurate.
2. ✅ `submitMustFail` for auth rejections correct.
3. ✅ `query @Template party` empty for non-stakeholders — proves privacy.
4. ⚠️ Use `submit (actAs [p1,p2])` not `submitMulti` in 3.4.11.
