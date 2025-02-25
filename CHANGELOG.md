# @zerodev/intent

## 0.0.24

### Patch Changes

- feat: add projectId as params to createIntentClient

## 0.0.23

### Patch Changes

- fix: package type issue

## 0.0.22

### Patch Changes

- feat: multi-chain validator

  - sign once when account's root validator is multi-chain validator

  - return inputs/output uiHash

## 0.0.18

### Patch Changes

- fix: use gasToken

## 0.0.17

### Patch Changes

- fix: gasTokens usage

  - gasTokens could be either NATIVE or SPONSORED

  - add 'gasTokens' to estimateUserIntentFees

  - change sendUserIntent to gather signatures and send them in one call

## 0.0.16

### Patch Changes

- chore: add v0.0.3 address

## 0.0.15

### Patch Changes

- feat: multi-input tokens

## 0.0.14

### Patch Changes

- fix: use testnet relayer url

## 0.0.13

### Patch Changes

- chore: update intentExecutor v2 address

## 0.0.10

### Patch Changes

- feat: add fee estimation

## 0.0.9

### Patch Changes

- feat: add gasTokens: "CAB" feature

## 0.0.8

### Patch Changes

- feat: add getCAB action

## 0.0.6

### Patch Changes

- feat: update @zerodev/sdk to 5.4.6 and @zerodev/ecdsa-validator to 5.4.1

## 0.0.5

### Patch Changes

- feat: export installIntentExecutor util

## 0.0.4

### Patch Changes

- chore: update address

## 0.0.2

### Patch Changes

- Updated prepareUserIntent to use factory address and factory data regardless of account deployment status

## 0.0.1

### Patch Changes

- Initial release
