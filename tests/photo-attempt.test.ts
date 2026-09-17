import { describe, expect, it, vi } from 'vitest';
import { storePhotoAttempt } from '@memyra/application';

describe('private upload ownership', () => {
  it.each(['P2002', 'P2003'])(
    'cleans only its own object after definitive %s rejection',
    async (code) => {
      const removeOwnedObject = vi.fn().mockResolvedValue(undefined);
      const failure = Object.assign(new Error('rejected'), { code });
      await expect(
        storePhotoAttempt({
          upload: () => Promise.resolve(),
          insert: () => Promise.reject(failure),
          removeOwnedObject,
          findCompleted: () => Promise.resolve(null),
          ownsCompleted: () => false,
          isDefiniteFailure: () => true,
        }),
      ).rejects.toEqual(failure);
      expect(removeOwnedObject).toHaveBeenCalledOnce();
    },
  );
  it('never deletes an object after upload failure', async () => {
    const removeOwnedObject = vi.fn();
    await expect(
      storePhotoAttempt({
        upload: () => Promise.reject(new Error('conflict')),
        insert: vi.fn(),
        removeOwnedObject,
        findCompleted: vi.fn(),
        ownsCompleted: () => false,
      }),
    ).rejects.toThrow('conflict');
    expect(removeOwnedObject).not.toHaveBeenCalled();
  });
  it('reconciles a duplicate without deleting the winning object', async () => {
    const objects = new Set<string>();
    let row: { id: string } | null = null;
    const attempt = (id: string) =>
      storePhotoAttempt({
        upload: () => {
          objects.add(id);
          return Promise.resolve();
        },
        insert: () => {
          if (row) return Promise.reject(new Error('unique'));
          row = { id };
          return Promise.resolve(row);
        },
        removeOwnedObject: () => {
          objects.delete(id);
          return Promise.resolve();
        },
        findCompleted: () => Promise.resolve(row),
        ownsCompleted: (result) => result.id === id,
      });
    expect(await Promise.all([attempt('first'), attempt('second')])).toEqual([
      { id: 'first' },
      { id: 'first' },
    ]);
    expect([...objects]).toEqual(['first']);
  });
  it('does not delete data when database commit outcome is unknown', async () => {
    const removeOwnedObject = vi.fn();
    await expect(
      storePhotoAttempt({
        upload: () => Promise.resolve(),
        insert: () => Promise.reject(new Error('timeout')),
        removeOwnedObject,
        findCompleted: () => Promise.resolve(null),
        ownsCompleted: () => false,
      }),
    ).rejects.toThrow('timeout');
    expect(removeOwnedObject).not.toHaveBeenCalled();
  });
  it('preserves its object when the insert committed before a timeout', async () => {
    const removeOwnedObject = vi.fn();
    expect(
      await storePhotoAttempt({
        upload: () => Promise.resolve(),
        insert: () => Promise.reject(new Error('timeout')),
        removeOwnedObject,
        findCompleted: () => Promise.resolve({ id: 'own' }),
        ownsCompleted: (row) => row.id === 'own',
      }),
    ).toEqual({ id: 'own' });
    expect(removeOwnedObject).not.toHaveBeenCalled();
  });
});
