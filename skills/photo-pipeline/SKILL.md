---
name: photo-pipeline
description: Design or review MEMYRA photo capture, metadata, upload, private storage, processing, comparison, and deletion changes.
---

# Photo pipeline

## Purpose

Keep same-region longitudinal photos comparable and private.

## When to use

Any code or contract touching photos or image metadata.

## When not to use

Unrelated static brand assets.

## Inputs

Flow, data fields, storage/processor behavior and threats.

## Process

Trace capture→validation→metadata→upload→storage→processing→comparison→deletion; require authorization, idempotency, private derivatives and no GPS; involve privacy/security review.

## Checklist

- Bucket/private URLs only
- EXIF minimized; GPS absent
- Same-region context preserved
- Failure/deletion tested

## Expected output

Pipeline impact map, controls, tests and unresolved risks.
