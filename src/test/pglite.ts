import { PGlite } from '@electric-sql/pglite'
import type { PGliteInterface } from '@electric-sql/pglite'

import { setupPgliteSchema } from '@/services/pgliteDb'

export async function createTestPgliteDb(): Promise<PGliteInterface> {
  const db = await PGlite.create()

  await setupPgliteSchema(db)

  return db
}

