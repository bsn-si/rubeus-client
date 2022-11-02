## Disclaimer
> 💀 **Work in Progress**.  
> Current status: Common PoC, data storage methods available. Partially tested.   
> **Use at your own risk**.

<h1 align="center">
    🎟️ ✨ Rubeus dApp 🎁 👛
</h1>

Rubeus browser extension.

## Features
DApp can interact with custom RPC and contracts and use polkadot.js extensions to sign transactions.
This is hybrid dapp with build as SPA app and chrome extension. 

- Adding new credentials
- Updating credentials
- Deleting credentials
- List of credentials by groups 
- May work with anonymous session and with save session data

## Usage
To use this plugin you need to active Rubeus contract and setup you signer key and contract address in the dApp, also you can enter RPC URL to target node. 

Current version of the dApp:
[Run DApp](https://bsn-si.github.io/rubeus/)

To use this dapp as extension, please load unpacked build in chrome by `chrome://extensions`.

## Build & Run
```
git clone git@github.com:bsn-si/rubeus-client.git
cd rubeus-client/

# install dependencies via yarn
yarn
# OR
npm install

# For dev-server run
npm run start
# For production build SPA app
npm run build
# For production build chrome extension 
npm run build:extension
```

Also you can preset RPC URL and contract address from `.env` before build.  

```
# You can preset RPC node URL
RPC_URL=ws://127.0.0.1:9944
# You can preset contract address
CONTRACT=<contract address hex or ss58>
```

## License
[Apache License 2.0](https://github.com/bsn-si/rubeus-client/blob/main/license) © Bela Supernova ([bsn.si](https://bsn.si))
