# gill

## 0.11.0

### Minor Changes

- [#197](https://github.com/DecalLabs/gill/pull/197)
  [`7f77aa4`](https://github.com/DecalLabs/gill/commit/7f77aa47385680bfb331e36f4f2a8d6a0c8aa250) Thanks
  [@nickfrosty](https://github.com/nickfrosty)! - allow transactions without a latest blockhash and auto fetch them when
  not provided in `sendAndConfirmTransactionWithSignersFactory`

### Patch Changes

- [#196](https://github.com/DecalLabs/gill/pull/196)
  [`a828da0`](https://github.com/DecalLabs/gill/commit/a828da0b2e4e87436d254062d339167fed3db8ab) Thanks
  [@nickfrosty](https://github.com/nickfrosty)! - make `version` optional (default of `legacy`) in `createTransaction`

## 0.10.3

### Patch Changes

- [#178](https://github.com/DecalLabs/gill/pull/178)
  [`0473034`](https://github.com/DecalLabs/gill/commit/0473034aaac424195b120e939d6501bfd6a24a9d) Thanks
  [@nickfrosty](https://github.com/nickfrosty)! - add rust client support for the `createCodamaConfig` function

- [#191](https://github.com/DecalLabs/gill/pull/191)
  [`37b88f1`](https://github.com/DecalLabs/gill/commit/37b88f1a3951db73e46d0969e2c0a2d400ba0579) Thanks
  [@gitteri](https://github.com/gitteri)! - updated `@solana/kit` and `@solana-program/token-2022`

- [#179](https://github.com/DecalLabs/gill/pull/179)
  [`b9e1027`](https://github.com/DecalLabs/gill/commit/b9e102793b30b0bf8a5c8e512ecc20f04a1e6ddc) Thanks
  [@nickfrosty](https://github.com/nickfrosty)! - update repo location

- [#164](https://github.com/DecalLabs/gill/pull/164)
  [`e1c47e9`](https://github.com/DecalLabs/gill/commit/e1c47e9a84340bed35d5b33298c600a3b23628ff) Thanks
  [@nickfrosty](https://github.com/nickfrosty)! - added typedoc comment to createCodamaConfig

## 0.10.2

### Patch Changes

- [#153](https://github.com/DecalLabs/gill/pull/153)
  [`29b0b02`](https://github.com/DecalLabs/gill/commit/29b0b0260b03ad2434a2e838204d248061e0fdfa) Thanks
  [@nickfrosty](https://github.com/nickfrosty)! - refactor program client exports to be explicit

- [#161](https://github.com/DecalLabs/gill/pull/161)
  [`81c6bed`](https://github.com/DecalLabs/gill/commit/81c6beddc314a98b75180e5241c7808da16c4f42) Thanks
  [@beeman](https://github.com/beeman)! - add create-codama-config function

## 0.10.1

### Patch Changes

- [#149](https://github.com/DecalLabs/gill/pull/149)
  [`c3f7b64`](https://github.com/DecalLabs/gill/commit/c3f7b64ce7e2c2ed045ede39885e36c054fa1403) Thanks
  [@nickfrosty](https://github.com/nickfrosty)! - manually fix gill version to deprecate the broken gill@0.10.0 version
  see https://github.com/DecalLabs/gill/pull/140

- [#145](https://github.com/DecalLabs/gill/pull/145)
  [`2571cec`](https://github.com/DecalLabs/gill/commit/2571ceca9efab70fbe8b7e451a3be35db106dfd6) Thanks
  [@nickfrosty](https://github.com/nickfrosty)! - rename token metadata mint args and fixed type reexports

## 0.9.2

### Patch Changes

- [#143](https://github.com/DecalLabs/gill/pull/143)
  [`0be650e`](https://github.com/DecalLabs/gill/commit/0be650e92c1f8de1011e6fdbde0a66aaf07cc120) Thanks
  [@nickfrosty](https://github.com/nickfrosty)! - refactor system program reexports

## 0.9.1

### Patch Changes

- [#140](https://github.com/DecalLabs/gill/pull/140)
  [`537c26d`](https://github.com/DecalLabs/gill/commit/537c26daa62519f9061891103862e902e1605a25) Thanks
  [@nickfrosty](https://github.com/nickfrosty)! - bump @solana/kit and @solana-program/\*

- [#142](https://github.com/DecalLabs/gill/pull/142)
  [`ebbc4d6`](https://github.com/DecalLabs/gill/commit/ebbc4d6f5b8e616d600fd3542226a201a5d5df40) Thanks
  [@nickfrosty](https://github.com/nickfrosty)! - manually add to declarations

## 0.9.0

### Minor Changes

- [#119](https://github.com/DecalLabs/gill/pull/119)
  [`4bac16e`](https://github.com/DecalLabs/gill/commit/4bac16ef9d11a11ca59bf2ffa99d23ad77e8bd21) Thanks
  [@nickfrosty](https://github.com/nickfrosty)! - added token ui amount helpers for converting token's `amount` based on
  the mint's `decimals`

- [#106](https://github.com/DecalLabs/gill/pull/106)
  [`3f456f2`](https://github.com/DecalLabs/gill/commit/3f456f297f4a656edc6d47c2bbcaf3350fb0cdf9) Thanks
  [@nickfrosty](https://github.com/nickfrosty)! - added the `getOldestSignatureForAddress` function

- [#115](https://github.com/DecalLabs/gill/pull/115)
  [`7dedc33`](https://github.com/DecalLabs/gill/commit/7dedc33397a0346a8a56344d77a719e7238ef930) Thanks
  [@nickfrosty](https://github.com/nickfrosty)! - added typed Node ENV variable name support for the keypair loader
  functions

- [#120](https://github.com/DecalLabs/gill/pull/120)
  [`7e51f34`](https://github.com/DecalLabs/gill/commit/7e51f34002e5ac5e54bf54f2a86d4c8a0149392d) Thanks
  [@nickfrosty](https://github.com/nickfrosty)! - added `insertReferenceKeysToTransactionMessage` and
  `insertReferenceKeyToTransactionMessage` functions to insert reference keys into transactions

### Patch Changes

- [#114](https://github.com/DecalLabs/gill/pull/114)
  [`90f7a8e`](https://github.com/DecalLabs/gill/commit/90f7a8eeb9fbce3b4dd815912438075e3c6852ac) Thanks
  [@nickfrosty](https://github.com/nickfrosty)! - fix (and test for) creating tokens using custom `decimals` input

  note: the fix was added in [PR #113](https://github.com/DecalLabs/gill/pull/113) by
  [@0xIchigo](https://github.com/0xIchigo)

## 0.8.3

### Patch Changes

- [#101](https://github.com/DecalLabs/gill/pull/101)
  [`6f547ff`](https://github.com/DecalLabs/gill/commit/6f547fff0731bd7530b1266f8a5c15eac2e80d32) Thanks
  [@nickfrosty](https://github.com/nickfrosty)! - fixed token builders to accept address or signer as fee payer

- [#104](https://github.com/DecalLabs/gill/pull/104)
  [`56a7af8`](https://github.com/DecalLabs/gill/commit/56a7af87878b914275f5189d99ea7c2674f45c0c) Thanks
  [@nickfrosty](https://github.com/nickfrosty)! - removed the ts-ignore on create token as it is no longer needed

- [#89](https://github.com/DecalLabs/gill/pull/89)
  [`1314cda`](https://github.com/DecalLabs/gill/commit/1314cda705d9734d4cdf1a42c985f25ae3737a92) Thanks
  [@nickfrosty](https://github.com/nickfrosty)! - clarify the readme and examples on getting the signature from a singed
  transaction

## 0.8.2

### Patch Changes

- [#84](https://github.com/DecalLabs/gill/pull/84)
  [`93b875a`](https://github.com/DecalLabs/gill/commit/93b875a088a4830ef39e8084d3d5e6038c8a96cc) Thanks
  [@hwsimmons17](https://github.com/hwsimmons17)! - Fix bug with converting https -> wss

## 0.8.1

### Patch Changes

- [#83](https://github.com/DecalLabs/gill/pull/83)
  [`b99ac65`](https://github.com/DecalLabs/gill/commit/b99ac65a6de6d379e5f0f65b80c1f2a1a492d061) Thanks
  [@nickfrosty](https://github.com/nickfrosty)! - fixed ts config module resolution

## 0.8.0

### Minor Changes

- [#75](https://github.com/DecalLabs/gill/pull/75)
  [`2cb27d5`](https://github.com/DecalLabs/gill/commit/2cb27d5b2450002038bf6501015c259eb4c43ee6) Thanks
  [@nickfrosty](https://github.com/nickfrosty)! - added multiple "keypair from base58" functions

### Patch Changes

- [#74](https://github.com/DecalLabs/gill/pull/74)
  [`6415cd7`](https://github.com/DecalLabs/gill/commit/6415cd774ea333135756863a227613d8d075fa8a) Thanks
  [@jim4067](https://github.com/jim4067)! - fix broken link in tsdoc comment

- [#72](https://github.com/DecalLabs/gill/pull/72)
  [`6b24c98`](https://github.com/DecalLabs/gill/commit/6b24c982a7cd00b71be82ef65753d0cce074b868) Thanks
  [@mcintyre94](https://github.com/mcintyre94)! - Refactor `lamportsPerSol` to use scientific format

## 0.7.0

### Minor Changes

- [#64](https://github.com/DecalLabs/gill/pull/64)
  [`523c2a2`](https://github.com/DecalLabs/gill/commit/523c2a2995a00ee995d2f227a406ba5ca393c63f) Thanks
  [@nickfrosty](https://github.com/nickfrosty)! - add a parser for token program monikers

- [#68](https://github.com/DecalLabs/gill/pull/68)
  [`a320da8`](https://github.com/DecalLabs/gill/commit/a320da828dc0a36dd2eb020fd88a15117b5f9d65) Thanks
  [@nickfrosty](https://github.com/nickfrosty)! - consume kit instead of manually reexporting

### Patch Changes

- [#66](https://github.com/DecalLabs/gill/pull/66)
  [`8819f14`](https://github.com/DecalLabs/gill/commit/8819f149cb41d4d47e51c9daa9f11fa39da2e7a0) Thanks
  [@nickfrosty](https://github.com/nickfrosty)! - accept 'localhost' in the public endpoint getter

- [#70](https://github.com/DecalLabs/gill/pull/70)
  [`134027c`](https://github.com/DecalLabs/gill/commit/134027c391fea4b2881e15e93fdc0b64a9804da3) Thanks
  [@nickfrosty](https://github.com/nickfrosty)! - added more token metadata helpers for parsing metadata accounts

- [#69](https://github.com/DecalLabs/gill/pull/69)
  [`bc03847`](https://github.com/DecalLabs/gill/commit/bc03847092b4f2ada01ab16cf5a03b4d3bb575e6) Thanks
  [@nickfrosty](https://github.com/nickfrosty)! - remove the submodule imports and use kit when possible

- [#71](https://github.com/DecalLabs/gill/pull/71)
  [`b046783`](https://github.com/DecalLabs/gill/commit/b0467839e9366f6a6f2b0787d082933d413bfb4c) Thanks
  [@nickfrosty](https://github.com/nickfrosty)! - add tsdoc comments to the debug globals

## 0.6.0

### Minor Changes

- [#60](https://github.com/DecalLabs/gill/pull/60)
  [`2b1f604`](https://github.com/DecalLabs/gill/commit/2b1f604ff0b538cfa81138e1f25f8cd48c908fad) Thanks
  [@nickfrosty](https://github.com/nickfrosty)! - export the `fetchLookupTables` function

- [#63](https://github.com/DecalLabs/gill/pull/63)
  [`bf67203`](https://github.com/DecalLabs/gill/commit/bf6720391dc62056d734f7e1d46ac19484d2b2e7) Thanks
  [@nickfrosty](https://github.com/nickfrosty)! - added `simulateTransaction` and factory

- [#62](https://github.com/DecalLabs/gill/pull/62)
  [`c8205fb`](https://github.com/DecalLabs/gill/commit/c8205fb80950aa3d61f7a573b5e59e3c7a087002) Thanks
  [@nickfrosty](https://github.com/nickfrosty)! - replace web3js v2 with kit

## 0.5.0

### Minor Changes

- [#54](https://github.com/DecalLabs/gill/pull/54)
  [`8139481`](https://github.com/DecalLabs/gill/commit/813948162c84e7ddad12493ed78f9190182b99bf) Thanks
  [@nickfrosty](https://github.com/nickfrosty)! - allow `sendAndConfirmTransaction` to also handle signing

- [#52](https://github.com/DecalLabs/gill/pull/52)
  [`9e01463`](https://github.com/DecalLabs/gill/commit/9e01463d7d38ca9b073fbb96472093dd6ccf379c) Thanks
  [@nickfrosty](https://github.com/nickfrosty)! - added `lamportsToSol` function

- [#56](https://github.com/DecalLabs/gill/pull/56)
  [`3439498`](https://github.com/DecalLabs/gill/commit/343949824950f700e572ada151b4dc07fd68d229) Thanks
  [@nickfrosty](https://github.com/nickfrosty)! - added `transactionFromBase64` function

### Patch Changes

- [#58](https://github.com/DecalLabs/gill/pull/58)
  [`7c997f7`](https://github.com/DecalLabs/gill/commit/7c997f7cde676beeeb89200fe389c79dba708082) Thanks
  [@nickfrosty](https://github.com/nickfrosty)! - refactored client type names

- [#53](https://github.com/DecalLabs/gill/pull/53)
  [`452359c`](https://github.com/DecalLabs/gill/commit/452359c08c5fd089fb1f1e7959e70fb34e148697) Thanks
  [@nickfrosty](https://github.com/nickfrosty)! - declare imports as type

- [#50](https://github.com/DecalLabs/gill/pull/50)
  [`5dd8366`](https://github.com/DecalLabs/gill/commit/5dd8366084727541394d90e5044e030fdcfc246c) Thanks
  [@nickfrosty](https://github.com/nickfrosty)! - add `localhost` support to explorer urls

- [#55](https://github.com/DecalLabs/gill/pull/55)
  [`7e1ce79`](https://github.com/DecalLabs/gill/commit/7e1ce79e05793c0b0422de05d1b7505e6fdca864) Thanks
  [@metasal1](https://github.com/metasal1)! - remove duplicate entry from changelog

- [#59](https://github.com/DecalLabs/gill/pull/59)
  [`585bdc7`](https://github.com/DecalLabs/gill/commit/585bdc788d8291d6712e4df704f97c50034b484f) Thanks
  [@nickfrosty](https://github.com/nickfrosty)! - forced resolutions for web3js and kit

## 0.4.0

### Minor Changes

- [#40](https://github.com/DecalLabs/gill/pull/40)
  [`9ae5ee8`](https://github.com/DecalLabs/gill/commit/9ae5ee8c3549c15df5c71a072bd9686b55afeb1a) Thanks
  [@nickfrosty](https://github.com/nickfrosty)! - added transfer token transaction/instruction builders

- [#43](https://github.com/DecalLabs/gill/pull/43)
  [`b9491e4`](https://github.com/DecalLabs/gill/commit/b9491e43ed0841c08b6de0d37a3e06df8161ce46) Thanks
  [@nickfrosty](https://github.com/nickfrosty)! - added transactionToBase64WithSigners to sign and base64 encode

- [#44](https://github.com/DecalLabs/gill/pull/44)
  [`e18fc1b`](https://github.com/DecalLabs/gill/commit/e18fc1bf78b68eff089f61e93444f222f5374b90) Thanks
  [@nickfrosty](https://github.com/nickfrosty)! - added functions for generating extractable keypairs, saving keypairs
  to files, and loading/saving keypairs to env variables

### Patch Changes

- [#42](https://github.com/DecalLabs/gill/pull/42)
  [`7a220bc`](https://github.com/DecalLabs/gill/commit/7a220bc67c6987e30105f3bdab24ff86ee6328ee) Thanks
  [@nickfrosty](https://github.com/nickfrosty)! - fix createSolanaClient to accept port numbers and set the localnet
  port

- [#49](https://github.com/DecalLabs/gill/pull/49)
  [`64d138a`](https://github.com/DecalLabs/gill/commit/64d138a03e3c09b340c54273455b44ae582ff0c6) Thanks
  [@nickfrosty](https://github.com/nickfrosty)! - vendor in spl memo

- [#48](https://github.com/DecalLabs/gill/pull/48)
  [`18a8eec`](https://github.com/DecalLabs/gill/commit/18a8eecba39d4c133e90c90905a5bb87f4eb7ba9) Thanks
  [@nickfrosty](https://github.com/nickfrosty)! - fix create token instructions to correctly handle desired token
  program

## 0.3.0

### Minor Changes

- [#30](https://github.com/DecalLabs/gill/pull/30)
  [`446a9d1`](https://github.com/DecalLabs/gill/commit/446a9d1a4ce1a74ce7e9d25865166bc1c08699a5) Thanks
  [@nickfrosty](https://github.com/nickfrosty)! - added create token helpers

- [#34](https://github.com/DecalLabs/gill/pull/34)
  [`dc635bb`](https://github.com/DecalLabs/gill/commit/dc635bb83a930ff12aea22ab2b81a2c5fd1476e7) Thanks
  [@nickfrosty](https://github.com/nickfrosty)! - removed token client but keep the program address

- [#27](https://github.com/DecalLabs/gill/pull/27)
  [`93674ab`](https://github.com/DecalLabs/gill/commit/93674ab32c9b25baccf7293775e84c0253130419) Thanks
  [@nickfrosty](https://github.com/nickfrosty)! - added genesis hash constant and to moniker function

- [#25](https://github.com/DecalLabs/gill/pull/25)
  [`a7c3ee4`](https://github.com/DecalLabs/gill/commit/a7c3ee44dfb4b0a97dcf71ae9f47d82b69da706e) Thanks
  [@nickfrosty](https://github.com/nickfrosty)! - add the address lookup table program as a reexport

- [#29](https://github.com/DecalLabs/gill/pull/29)
  [`94c1210`](https://github.com/DecalLabs/gill/commit/94c12107ca22d07c1ffb59879c81a0027ebf10de) Thanks
  [@nickfrosty](https://github.com/nickfrosty)! - added client for Metaplex's Token Metadata program

- [#33](https://github.com/DecalLabs/gill/pull/33)
  [`be3110d`](https://github.com/DecalLabs/gill/commit/be3110d21652f3d31e238a55962a872f65f63faf) Thanks
  [@nickfrosty](https://github.com/nickfrosty)! - added mint token functions

### Patch Changes

- [#35](https://github.com/DecalLabs/gill/pull/35)
  [`a1e342a`](https://github.com/DecalLabs/gill/commit/a1e342adfcd556ea6d51b8e345a19317a217d775) Thanks
  [@nickfrosty](https://github.com/nickfrosty)! - refactor common type and use `feePayer` vs `payer` for consistency

- [#28](https://github.com/DecalLabs/gill/pull/28)
  [`e28620c`](https://github.com/DecalLabs/gill/commit/e28620c075206c0df29e29406c3eaec2eb4008d2) Thanks
  [@nickfrosty](https://github.com/nickfrosty)! - allow `getExplorerLink` to return the base transaction url for each
  cluster

- [#37](https://github.com/DecalLabs/gill/pull/37)
  [`c489242`](https://github.com/DecalLabs/gill/commit/c489242ac71327fb70b08a83590a43e90daf5558) Thanks
  [@nickfrosty](https://github.com/nickfrosty)! - document transaction builders in the readme

- [#32](https://github.com/DecalLabs/gill/pull/32)
  [`7bf0137`](https://github.com/DecalLabs/gill/commit/7bf0137159e503c42241bc1ce7d25b30a240f726) Thanks
  [@nickfrosty](https://github.com/nickfrosty)! - fix prepareTransaction to correct return type to always have a
  blockhash

## 0.2.0

### Minor Changes

- [#21](https://github.com/DecalLabs/gill/pull/21)
  [`cdefdcd`](https://github.com/DecalLabs/gill/commit/cdefdcd112b28a207b08b38aed810772a993bc4c) Thanks
  [@nickfrosty](https://github.com/nickfrosty)! - added the `debug` logger to facilitate common debug patterns

- [#20](https://github.com/DecalLabs/gill/pull/20)
  [`ee28853`](https://github.com/DecalLabs/gill/commit/ee288539b631b7e215421a217abc7156263b03fd) Thanks
  [@nickfrosty](https://github.com/nickfrosty)! - added `transactionToBase64` function

- [#17](https://github.com/DecalLabs/gill/pull/17)
  [`f59381b`](https://github.com/DecalLabs/gill/commit/f59381b0b87e7670fd7e6debbd7827c0b98e73bd) Thanks
  [@nickfrosty](https://github.com/nickfrosty)! - re-export token and token22

- [#22](https://github.com/DecalLabs/gill/pull/22)
  [`3495a3c`](https://github.com/DecalLabs/gill/commit/3495a3cf70a6ae7933616059d54f40501712b931) Thanks
  [@nickfrosty](https://github.com/nickfrosty)! - added `sendAndConfirmTransaction` to the client creator

- [#23](https://github.com/DecalLabs/gill/pull/23)
  [`f0044ad`](https://github.com/DecalLabs/gill/commit/f0044aded5b1d5b86194361c0f5865f4d6475ffd) Thanks
  [@nickfrosty](https://github.com/nickfrosty)! - easily add compute budget instructions when creating a transaction

### Patch Changes

- [#18](https://github.com/DecalLabs/gill/pull/18)
  [`4b139da`](https://github.com/DecalLabs/gill/commit/4b139dab06a274777e15ff47c92fec001c2f6e93) Thanks
  [@nickfrosty](https://github.com/nickfrosty)! - getExplorerUrl to return a string and accepted a signed transaction

- [#13](https://github.com/DecalLabs/gill/pull/13)
  [`1727586`](https://github.com/DecalLabs/gill/commit/17275861d0bbbfd1daf74a31e7445373c9612117) Thanks
  [@nickfrosty](https://github.com/nickfrosty)! - fixed types for the solana client and added tests

- [#16](https://github.com/DecalLabs/gill/pull/16)
  [`33e8974`](https://github.com/DecalLabs/gill/commit/33e8974d0dc1ad5f877827a7964a61d02737048f) Thanks
  [@nickfrosty](https://github.com/nickfrosty)! - fixed types for createTransaction

- [#19](https://github.com/DecalLabs/gill/pull/19)
  [`81cbff6`](https://github.com/DecalLabs/gill/commit/81cbff68a44e569141ad844cb4e661b57da2b8c7) Thanks
  [@nickfrosty](https://github.com/nickfrosty)! - refactor getExplorerLink to not accept a signed transaction

## 0.1.0

### Minor Changes

- [#10](https://github.com/DecalLabs/gill/pull/10)
  [`0c03cb8`](https://github.com/DecalLabs/gill/commit/0c03cb8ce794a2a79d2eee7a56d98caa3007fc8a) Thanks
  [@nickfrosty](https://github.com/nickfrosty)! - added a `getMinimumBalanceForRentExemption` function that does not
  make an rpc call

### Patch Changes

- [#7](https://github.com/DecalLabs/gill/pull/7)
  [`d3e7220`](https://github.com/DecalLabs/gill/commit/d3e7220c8f7d23cc2bc1e583887ef45ef621134e) Thanks
  [@nickfrosty](https://github.com/nickfrosty)! - make the `latestBlockhash` in `createTransaction` optional

- [#8](https://github.com/DecalLabs/gill/pull/8)
  [`5de7acb`](https://github.com/DecalLabs/gill/commit/5de7acbc7500fe76d2592b1f989f156f477e85f5) Thanks
  [@nickfrosty](https://github.com/nickfrosty)! - added readme

- [`acf3df9`](https://github.com/DecalLabs/gill/commit/acf3df98c49cbc82af2a4655a9979f1bc4471c9e) Thanks
  [@nickfrosty](https://github.com/nickfrosty)! - added tests for createTransaction

## 0.0.4

### Patch Changes

- [`6ae676f`](https://github.com/DecalLabs/gill/commit/6ae676f0f06c0ab07af8b2d03fd2e0f3fb051916) Thanks
  [@nickfrosty](https://github.com/nickfrosty)! - fix rpc functions

- [#6](https://github.com/DecalLabs/gill/pull/6)
  [`1438ba7`](https://github.com/DecalLabs/gill/commit/1438ba7fbf1a572d7c8c7936b70ba85e775d2cf0) Thanks
  [@nickfrosty](https://github.com/nickfrosty)! - added the `createTransaction` function
