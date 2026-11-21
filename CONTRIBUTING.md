# Contributing to hubnx Video

Thanks for helping. hubnx Video is a free, open-source video editor for Mac, Windows and Linux (AGPL-3.0).

## Before your pull request is merged

Before your first pull request is merged, sign the CLA by commenting on it.
Signing for a company? Email the Corporate CLA, filled in, to video@hubnx.com.

## Build and test

From `app/`, with [pnpm](https://pnpm.io):

| What | Command |
|---|---|
| Install | `pnpm install` |
| The FFmpeg the app carries, for your system | `pnpm ffmpeg mac-arm64` (or `mac-x64`, `win-x64`, `linux-x64`) |
| Build and open the app | `pnpm dev` |
| Tests · type check | `pnpm test` · `pnpm typecheck` |
