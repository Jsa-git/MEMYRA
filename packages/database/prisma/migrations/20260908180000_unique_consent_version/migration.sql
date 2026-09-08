-- A consent version is recorded once per user and purpose.
CREATE UNIQUE INDEX "consent_records_user_id_type_version_key"
ON "consent_records"("user_id", "type", "version");
