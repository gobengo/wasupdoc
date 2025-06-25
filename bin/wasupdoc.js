#!/usr/bin/env node
import 'tsx'
const cli = await import('../cli.ts')
await cli.default.main(...process.argv)
