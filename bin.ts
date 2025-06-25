#!/usr/bin/env node --no-warnings

import { realpathSync } from "node:fs"
import { fileURLToPath } from "node:url"
import WasupDocCLI from "./cli.ts"

async function main(...argv: string[]) {
  await WasupDocCLI.main(...argv)
}

// Check if this file is being executed by nodejs.
// If so, run the main function.
const isNodeMain = realpathSync(globalThis?.process.argv[1]) === fileURLToPath(import.meta.url)
if (isNodeMain) {
  await main(...process.argv)
}
