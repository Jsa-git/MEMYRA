/** Each attempt owns a server-generated object key, never a client-supplied key. */
export async function storePhotoAttempt<T>(operations: {
  upload: () => Promise<void>;
  insert: () => Promise<T>;
  removeOwnedObject: () => Promise<void>;
  findCompleted: () => Promise<T | null>;
  ownsCompleted: (result: T) => boolean;
  isDefiniteFailure?: (error: unknown) => boolean;
}): Promise<T> {
  // Upload failure does not grant ownership of an existing object.
  await operations.upload();
  try {
    return await operations.insert();
  } catch (error) {
    // A duplicate request may have won the database uniqueness race.
    // If reconciliation is unavailable, retain the object rather than risk
    // deleting data after an ambiguous database commit.
    const completed = await operations.findCompleted();
    if (completed) {
      if (!operations.ownsCompleted(completed)) await operations.removeOwnedObject();
      return completed;
    }
    if (operations.isDefiniteFailure?.(error)) await operations.removeOwnedObject();
    throw error;
  }
}
