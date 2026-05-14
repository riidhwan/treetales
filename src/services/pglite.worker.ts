import { PGlite } from '@electric-sql/pglite'
import { worker } from '@electric-sql/pglite/worker'

import { PGLITE_DATA_DIR } from '@/services/pgliteConfig'

await worker({
  init: (options) => PGlite.create(PGLITE_DATA_DIR, options),
})

