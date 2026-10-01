# Architecture Decision Records

Record every significant, hard-to-reverse choice here: library selection, provider choice, data
model trade-offs, delivery guarantees, security boundaries, and deployment topology.

## Conventions

- File name: `NNNN-short-kebab-title.md`, numbered sequentially and never renumbered.
- Status: `Proposed`, `Accepted`, `Superseded by NNNN`, or `Deprecated`.
- Do not rewrite an accepted ADR's decision. Supersede it with a new ADR and link both ways.
  Clarifications and "consequences observed" notes may be appended with a date.
- Reference official documentation with the version and date checked. Never cite an API, version,
  or Azure SKU that has not been verified.

## Template

```markdown
# NNNN. Title

- Status: Proposed | Accepted | Superseded by NNNN
- Date: YYYY-MM-DD
- Milestone: NN

## Context
What forces are at play: requirements, constraints, verified facts.

## Decision
What we chose, stated plainly.

## Alternatives considered
Options rejected and why.

## Consequences
Positive, negative, and follow-up work. How we would detect that the decision is wrong.

## References
Official documentation (with version and date checked).
```

## Index

| # | Title | Status | Milestone |
| --- | --- | --- | --- |
| [0001](0001-architecture-baseline.md) | Architecture baseline | Accepted | 00 |

### Expected upcoming ADRs

| Milestone | Topic |
| --- | --- |
| 01 | Toolchain and pinned version set |
| 07 | Authentication library and session strategy |
| 08 | Transaction correction and concurrency policy |
| 12 | Live quote/news provider selection |
| 13 | Outbox, Redis Streams, and delivery guarantees |
| 14 | SSE fan-out across API instances |
| 27 | Durable agent run execution and fencing |
| 28 | SDK session artifact persistence |
| 29 | Threat and execution trust boundary |
| 35 | AKS gateway/ingress controller |
