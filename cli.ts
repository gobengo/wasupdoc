import { existsSync, readFileSync } from "node:fs";
import { parseArgs } from "node:util"
import type { ISigner } from "@did.coop/did-key-ed25519/types"
import sshpk from "sshpk"
import { SshpkSigner } from '@wallet.storage/did-sshpk'
import { getControllerOfDidKeyVerificationMethod } from "@did.coop/did-key-ed25519/did-key";
import dedent from "dedent";

interface WasupDocCLIEnv {
  WASUPDOC_SSH_PASSPHRASE?: string
}

class WasupDocCLI {
  static async main(...argv: string[]) {
    const args = argv.slice(2)
    const parsed = parseArgs({
      options: {
        controller: {
          type: 'string',
        },
        help: {
          type: 'boolean',
          short: 'h',
        },
      },
      args,
    })
    const { values: { controller, help } } = parsed
    const cli = new WasupDocCLI()
    const options = {
      ...parsed,
      env: {
        WASUPDOC_SSH_PASSPHRASE: globalThis?.process?.env?.WASUPDOC_SSH_PASSPHRASE,
      },
    }
    await cli.call(null, options)
  }

  get help() {
    return dedent`
      🥕 🐇
      wasupdoc

      Generate a Document.

      Usage:
        wasupdoc --controller /path/to/key.ed25519.ssh
        wasupdoc -h | --help

      Options:
        -h --help        Show this help
        --controller     Path to SSH key to set as doc.controller did:key
    `
  }

  /**
   * call the CLI with parsed args as options
   * @param self - unused. here to maintain same args as Function#call
   * @param options - options parsed from cli args
   * @param options.values - named values parsed from cli flags
   * @param options.positionals - positional values parsed from cli args other than named flags
   */
  async call(self: unknown, options: {
    env: WasupDocCLIEnv,
    values: {
      help?: boolean
      /**
       * path to key file
       * @todo support path to public key file
       */
      controller?: string
    },
    positionals?: string[],
  }) {
    if (options.values.help) {
      console.debug(this.help)
      return;
    }
    const controller = await this.getControllerDidForController(options.values.controller, options.env)
    const doc = {
      controller,
    }
    console.debug(JSON.stringify(doc, undefined, '\t'))
  }

  async getControllerDidForController(controller?: string, env: WasupDocCLIEnv = {}) {
    if (controller?.startsWith('did:')) return controller
    const signer = this.createSignerFromIdentity(controller, env)
    const did = await this.getControllerDidForSigner(signer)
    return did
  }

  async getControllerDidForSigner(signer: Promise<ISigner>) {
    const verificationMethodId = (await signer).id
    const controller = verificationMethodId ? getControllerOfDidKeyVerificationMethod(verificationMethodId as any) : undefined
    if (!controller) throw new Error('unable to determine controller DID of signer id', { cause: { verificationMethodId } })
    return controller
  }

  async createSignerFromIdentity(identity: string | undefined, env: WasupDocCLIEnv) {
    if (!identity) throw new Error(`unable to create signer from falsy identity`, { cause: { identity } })
    const pathToKey = identity
    const pathToKeyExists = typeof pathToKey === "string" && existsSync(pathToKey.toString())
    let signer: ISigner | undefined
    if (!pathToKeyExists) throw new Error(`file at path does not exist: ${pathToKey}`)
    const keyBuffer = readFileSync(pathToKey)
    const privateKey = sshpk.parsePrivateKey(keyBuffer, undefined, {
      passphrase: env.WASUPDOC_SSH_PASSPHRASE
    })
    signer = await SshpkSigner.fromPrivateKey(privateKey)
    if (!signer) throw new Error(`unable to create signer from identity`)
    return signer
  }
}

export default WasupDocCLI
