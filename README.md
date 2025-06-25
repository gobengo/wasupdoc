# wasupdoc 🥕 🐇

A simple command line interface for generating controlled documents for use with [wasup][] et al.

[wasup]: https://github.com/gobengo/wasup

## Usage

```shell

⚡ wasupdoc --help
🥕 🐇
wasupdoc

Generate a Document.

Usage:
  wasupdoc --controller /path/to/key.ed25519.ssh
  wasupdoc -h | --help

Options:
  -h --help        Show this help
  --controller     Path to SSH key to set as doc.controller did:key

⚡ wasupdoc --controller ~/.ssh/example_space
{
        "controller": "did:key:z6Mkee3PxKbUQFFQeP765QGSXfLzkJNPpagDSLGqSfpBH5du"
}
```

stdout is JSON, so you can combine it with [jq][] or other filters:

```shell
⚡ wasupdoc --controller ~/.ssh/example_space | jq '. + {link:"linkset.json"}'
{
  "controller": "did:key:z6Mkee3PxKbUQFFQeP765QGSXfLzkJNPpagDSLGqSfpBH5du",
  "link": "linkset.json"
}
```

[jq]: https://en.wikipedia.org/wiki/Jq_(programming_language)