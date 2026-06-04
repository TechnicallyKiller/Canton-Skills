-- PQS (Participant Query Store) example reads. PQS is event-sourced and
-- Postgres-backed; use it for STATE and HISTORY queries (use the Ledger API's
-- transaction stream for low-latency events). Targets Daml SDK 3.4.x.

-- Active Contract Set for one template via the active() table function.
-- Project only the columns you need (avoid SELECT *); filter on the JSONB payload.
select
    contract_id,
    payload->>'owner'   as owner,
    payload->>'balance' as balance
from active('PACKAGE:MinimalTemplate:Account')
where payload->>'owner' = 'ALICE_PARTY'
order by contract_id            -- keyset pagination: WHERE contract_id > $last
limit 100;

-- Historical state at a particular ledger offset is supported by PQS's
-- event-sourcing model (query the state as of an offset rather than streaming).
-- Index frequently-filtered JSONB expressions, e.g.:
--   create index on <table> ((payload->>'owner'));
