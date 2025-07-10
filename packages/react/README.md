<h1 align="center">
  gill-react
</h1>

<p align="center">
  React hooks library for the Solana blockchain
</p>

## Overview

Welcome to `gill-react`, a React hooks library for easily interacting with the [Solana](http://solana.com/) blockchain.

> Notice: `gill-react` is in active development. All APIs are subject to change until reaching the first major version
> (v1.0.0).

This React hooks library is built on top of two core libraries:

1. [`gill`](https://www.npmjs.com/package/gill) - modern JavaScript/TypeScript library for interacting with the Solana
   blockchain.
2. [`@tanstack/react-query`](https://www.npmjs.com/package/@tanstack/react-query) - popular and powerful asynchronous
   state management for React.

## Installation

Install `gill-react` with your package manager of choice:

```shell
npm install gill gill-react @tanstack/react-query
```

```shell
pnpm add gill gill-react @tanstack/react-query
```

```shell
yarn add gill gill-react @tanstack/react-query
```

> Note: `gill` and `@tanstack/react-query` are peer dependencies of `gill-react` so you need to explicitly install them.
> This allows you have more/easier control over managing dependencies yourself.

## Quick start

Setup and configure your `SolanaProvider` to use the gill hooks:

- [Wrap your React app in a context provider](#wrap-your-react-app-in-a-context-provider)
- [Create a client-only provider for NextJs and React server components](#create-a-client-only-provider-for-nextjs-and-react-server-components)
- [Wrap your app in the client-only provider for NextJs](#wrap-your-app-in-the-client-only-provider-for-nextjs)
- [Using React hooks in React server component applications](#using-react-hooks-in-react-server-component-applications)

Manage and use your Solana client's connections:

- [`useSolanaClient`](#get-solana-client) - get the current Solana client (including `rpc` and `rpcSubscriptions`)
- [`useUpdateSolanaClient`](#get-account-balance-in-lamports) - update the current Solana client (including `rpc` and
  `rpcSubscriptions`)

Fetch data from the Solana blockchain with the gill hooks:

- [`useAccount`](#get-account-info-and-data) - get the account info for an address
- [`useBalance`](#get-account-balance-in-lamports) - get account balance (in lamports)
- [`useLatestBlockhash`](#get-latest-blockhash) - get the latest blockhash
- [`useSignatureStatuses`](#get-signature-statuses) - get signature statuses
- [`useSignaturesForAddress`](#get-signatures-for-address) - get signatures for address
- [`useProgramAccounts`](#get-program-accounts-gpa) - get program accounts (GPA)
- [`useTokenMint`](#get-token-mint-account) - get a decoded token's Mint account
- [`useTokenAccount`](#get-token-account) - get the token account for a given mint and owner (or ATA)

### Wrap your React app in a context provider

Wrap your app with the `SolanaProvider` React context provider and pass your Solana client to it:

```tsx
import { createSolanaClient } from "gill";
import { SolanaProvider } from "gill-react";

const client = createSolanaClient({
  urlOrMoniker: "devnet",
});

function App() {
  return <SolanaProvider client={client}>{/* ... */}</SolanaProvider>;
}
```

### Create a client-only provider for NextJs and React server components

For application that use React server components, like NextJS, you will need to create a "client only" wrapper for the
`SolanaProvider` exported from `gill-react`:

```tsx
"use client"; // <--- this "use client" directive is required!

import { createSolanaClient } from "gill";
import { SolanaProvider } from "gill-react";

const client = createSolanaClient({
  urlOrMoniker: "devnet",
});

export function SolanaProviderClient({ children }: { children: React.ReactNode }) {
  return <SolanaProvider client={client}>{children}</SolanaProvider>;
}
```

### Wrap your app in the client-only provider for NextJs

After creating your client-only provider, you can wrap your app with this
[`SolanaProviderClient`](#create-a-client-only-provider-for-nextjs-and-react-server-components) (normally inside the
root `layout.tsx`):

```tsx
import { SolanaProviderClient } from "@/providers/solana-provider";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html>
      <body>
        <SolanaProviderClient>{children}</SolanaProviderClient>
      </body>
    </html>
  );
}
```

### Using React hooks in React server component applications

After you have setup your client-only provider, you must set the `use client` directive in any component that uses the
`gill-react` library. Signifying this component is required to be "client only".

See React's [`use client` directive docs](https://react.dev/reference/rsc/use-client).

> Note: NextJs uses React server components by default. Read their docs
> [here](https://react.dev/reference/rsc/use-client) on the `use client` directive.

```tsx
"use client"; // <--- directive required anywhere you use `gill-react`

import { useBalance, ... } from "gill-react";
// ... other imports

export function PageClient() {
  const { balance } = useBalance({
    address: "nicktrLHhYzLmoVbuZQzHUTicd2sfP571orwo9jfc8c",
  });

  return (
    {/* ... */}
  );
}

```

### Get your Solana client

Get the current Solana client configured in the [`SolanaProvider`](#wrap-your-react-app-in-a-context-provider),
including the `rpc` and `rpcSubscriptions` connections:

```tsx
"use client";

import { useSolanaClient } from "gill-react";

export function PageClient() {
  const { rpc, rpcSubscriptions } = useSolanaClient();

  // you can now use `rpc` to access any of the Solana JSON RPC methods

  return { ... }
}
```

### Get account balance (in lamports)

Get an account's balance (in lamports) using the Solana RPC method of
[`getBalance`](https://solana.com/docs/rpc/http/getbalance):

```tsx
"use client";

import { lamportsToSol } from "gill";
import { useBalance } from "gill-react";

export function PageClient() {
  const { balance, isLoading, isError, error } = useBalance({
    address: "nicktrLHhYzLmoVbuZQzHUTicd2sfP571orwo9jfc8c",
  });

  // if (isLoading) { return ... }
  // if (isError) { return ... }

  return (
    <div className="">
      <p>Balance: {lamportsToSol(balance) + " SOL"}</p>
    </div>
  );
}
```

### Get latest blockhash

Get the latest blockhash using the Solana RPC method of
[`getLatestBlockhash`](https://solana.com/docs/rpc/http/getlatestblockhash)

```tsx
"use client";

import { useLatestBlockhash } from "gill-react";

export function PageClient() {
  const { latestBlockhash, isLoading, isError, error } = useLatestBlockhash();

  // if (isLoading) { return ... }
  // if (isError) { return ... }

  return (
    <div className="">
      <pre>latestBlockhash: {JSON.stringify(latestBlockhash, null, "\t")}</pre>
    </div>
  );
}
```

### Get account info (and data)

Get the account info for an address using the Solana RPC method of
[`getAccountInfo`](https://solana.com/docs/rpc/http/getaccountinfo):

> See also: [useTokenMint](#get-token-mint-account) and [`useTokenAccount`](#get-token-account)

```tsx
"use client";

import { useAccount } from "gill-react";

export function PageClient() {
  const { account, isLoading, isError, error } = useAccount({
    address: "nicktrLHhYzLmoVbuZQzHUTicd2sfP571orwo9jfc8c",
  });

  // if (isLoading) { return ... }
  // if (isError) { return ... }

  return (
    <div className="">
      <pre>account: {JSON.stringify(account, null, "\t")}</pre>
    </div>
  );
}
```

You can also provide a `Decoder` for known account data structure in order to decode the `data` byte array into a typed
object:

> ![NOTE] Some popular account types may have their own dedicated hook, like
> [Token Mints (`useTokenMint`)](#get-token-mint-account) and and [`useTokenAccount`](#get-token-account). If a
> dedicated hook exists for an account type, it is highly recommended to use those hooks as opposed to manually
> providing a `decoder` to `useAccount()`.

```tsx
"use client";

import { useAccount } from "gill-react";
import { getMintDecoder } from "gill/programs/token";

export function PageClient() {
  const { account, isLoading, isError, error } = useAccount({
    // USDC mint account (on Solana mainnet)
    address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    decoder: getMintDecoder(),
  });

  // if (isLoading) { return ... }
  // if (isError) { return ... }

  return (
    <div className="">
      <pre>account: {JSON.stringify(account, null, "\t")}</pre>
    </div>
  );
}
```

### Get signature statuses

Get the statuses of signatures using the Solana RPC method of
[`getSignatureStatuses`](https://solana.com/docs/rpc/http/getSignatureStatuses):

```tsx
"use client";

import { useSignatureStatuses } from "gill-react";

export function PageClient() {
  const { statuses, isLoading, isError, error } = useSignatureStatuses({
    signatures: ["5ewJmppABUbsWcDQEvThJj4GH4pRVK8NDjUtMVJXjvEndkhdy23mHjHpDmHVNNGoKsjPAsCwD4vzTQY4V2GEmvKu"],
  });

  // if (isLoading) { return ... }
  // if (isError) { return ... }

  return (
    <div className="">
      <pre>statuses: {JSON.stringify(statuses, null, "\t")}</pre>
    </div>
  );
}
```

### Get program accounts (GPA)

Get all the accounts owned by a `program` using the Solana RPC method of
[`getProgramAccounts`](https://solana.com/docs/rpc/http/getProgramAccounts):

```tsx
"use client";

import { useProgramAccounts } from "gill-react";

export function PageClient() {
  const { accounts, isLoading, isError, error } = useProgramAccounts({
    program: "4Nd1mBQtrMJVYVfKf2PJy9NZUZdTAsp7D4xWLs4gDB4T",
    config: {
      encoding: "base64",
      filters: [
        { dataSize: 17n },
        {
          memcmp: {
            offset: 4n,
            bytes: "3Mc6vR",
            encoding: "base64",
          },
        },
      ],
    },
  });

  // if (isLoading) { return ... }
  // if (isError) { return ... }

  return (
    <div className="">
      <pre>accounts: {JSON.stringify(accounts, null, "\t")}</pre>
    </div>
  );
}
```

### Get token Mint account

Get a decoded [Mint account](https://solana.com/docs/tokens#mint-account) for a given token's Mint address.

> Note: the Mint's information can be accessed via the returned `account.data` field.

```tsx
"use client";

import { useTokenMint } from "gill-react";

export function PageClient() {
  const { account, isLoading, isError, error } = useTokenMint({
    // USDC mint account (on Solana mainnet)
    mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  });

  // if (isLoading) { return ... }
  // if (isError) { return ... }

  return (
    <div className="">
      <pre>account: {JSON.stringify(account, null, "\t")}</pre>
    </div>
  );
}
```

### Get token account

Get the token account for a given mint and owner:

```tsx
"use client";

import { useTokenAccount } from "gill-react";

export function PageClient() {
  const { account, isLoading, isError, error } = useTokenAccount({
    // token on devnet
    mint: "HwxZNMkZbZMeiu9Xnmc6Rg8jYgNsJB47jwabHGUebW4F",
    owner: "nick6zJc6HpW3kfBm4xS2dmbuVRyb5F3AnUvj5ymzR5",
  });

  // if (isLoading) { return ... }
  // if (isError) { return ... }

  return (
    <div className="">
      <pre>account: {JSON.stringify(account, null, "\t")}</pre>
    </div>
  );
}
```

If you already know the specific Associated Token Account's address (ATA), then you can get that specific token account
by providing the `ata` address:

> Note: This is most commonly used for multi-sig protocols like Squads.

```tsx
"use client";

import { useTokenAccount } from "gill-react";

export function PageClient() {
  const { account, isLoading, isError, error } = useTokenAccount({
    ata: "CCMCWh4FudPEmY6Q1AVi5o8mQMXkHYkJUmZfzRGdcJ9P",
  });

  // if (isLoading) { return ... }
  // if (isError) { return ... }

  return (
    <div className="">
      <pre>account: {JSON.stringify(account, null, "\t")}</pre>
    </div>
  );
}
```

### Get Signatures for address

Get the signatures for confirmed transactions using the RPC method of [getSignaturesForAddress](https://solana.com/docs/rpc/http/getsignaturesforaddress)

```tsx
"use client";

import { useSignaturesForAddress } from "gill-react";

export function PageClient() {
  const { signatures, isLoading, isError, error } = useSignaturesForAddress({
    address: "nicktrLHhYzLmoVbuZQzHUTicd2sfP571orwo9jfc8c",
    config : {
      limit: 10
    }
  });

  // if (isLoading) { return ... }
  // if (isError) { return ... }

  return (
    <div className="">
      <pre>signatures: {JSON.stringify(signatures, null, "\t")}</pre>
    </div>
  );
}
```