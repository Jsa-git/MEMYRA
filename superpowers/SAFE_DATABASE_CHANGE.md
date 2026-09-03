# Safe Database Change

Workflow: Backend/Architecture model ownership → Database Change skill designs additive migration → assess locks/data volume → deploy expand step compatible with old code → backfill idempotently → enforce constraints → contract/remove only in later deploy → integration tests → rollback/roll-forward plan → review.

Never edit an applied migration or combine destructive cleanup with the first deploy.
