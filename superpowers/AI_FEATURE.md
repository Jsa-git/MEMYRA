# AI Feature

Workflow: AI Agent defines capability/refusals/evals → Product Agent validates user value and non-medical language → Privacy/Security review data/provider/tools → record safety boundaries and feature flag → implement provider through `AIProvider` port → evaluate allowed and prohibited cases → staged rollout/review.

No integration begins without provider/data/retention decisions and explicit authorization.
