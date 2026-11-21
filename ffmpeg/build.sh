#!/usr/bin/env bash
# Builds the FFmpeg the app carries, for one target, from pinned sources: ffmpeg and ffprobe, static, GPLv3 with x264
# and zimg, and nothing else outside FFmpeg's own code. No x265 (HEVC encoding's patents), no fdk-aac or anything
# "nonfree" (unredistributable), no ffplay, no network protocols (the app only reads and writes local files).
# The sound encoders are the operating system's where it has one (AudioToolbox, Media Foundation), whose patents the
# system's maker licenses; FFmpeg's own AAC encoder is the fallback (docs/research/engine-stack.md › Codecs).
#
#   ffmpeg/build.sh <mac-arm64|mac-x64|linux-x64|win-x64> <output folder>
#
# The Mac builds run on a Mac (this Intel Mac builds both: arm64 is cross-compiled by Apple's clang). linux-x64 and
# win-x64 run on Ubuntu (win-x64 cross-compiled with mingw-w64), on GitHub's machine (.github/workflows/ffmpeg.yml).
# The output is ffmpeg-<version>-<target>.tar.xz holding ffmpeg, ffprobe, COPYING.GPLv3 and BUILD.txt (the sources
# with their SHA-256 and the configure line), which GPL §6 asks to travel with the programs; the sources themselves are
# published beside each release.
set -euo pipefail

target="${1:?target: mac-arm64, mac-x64, linux-x64 or win-x64}"
output="$(mkdir -p "${2:?output folder}" && cd "$2" && pwd)"
here="$(cd "$(dirname "$0")" && pwd)"
work="${FFMPEG_WORK:-$here/../local/ffmpeg-build}"

# The pins: change one, and its SHA-256 with it (scripts/fetch-ffmpeg.ts then pins the new builds' own).
FFMPEG_VERSION=9.0.2 # 2026-09-18, the newest point release two months old; 9.1 was a day old on 2026-11-21
FFMPEG_SHA256=8c3850283eb25fa026482078a04051e0be17347b09ef81a0849bec15a96e002e
X264_COMMIT=b35605ace3ddf7c1a5d67a2eb553f034aef41d55 # x264's stable branch
X264_SHA256=6eeb82934e69fd51e043bd8c5b0d152839638d1ce7aa4eea65a3fedcf83ff224
ZIMG_VERSION=3.0.6
ZIMG_SHA256=be89390f13a5c9b2388ce0f44a5e89364a20c1c57ce46d382b1fcc3967057577
MAC_MINIMUM=12.0 # Electron 45's own minimum

sources="$work/sources"
mkdir -p "$sources"

fetch() { # url file sha256
  local file="$sources/$2"
  if [ ! -f "$file" ]; then
    curl -fsSL --retry 3 -o "$file.part" "$1"
    mv "$file.part" "$file"
  fi
  local actual
  actual="$(shasum -a 256 "$file" | cut -d' ' -f1)"
  if [ "$actual" != "$3" ]; then
    echo "FFMPEG_SOURCE_MISMATCH: $2 has SHA-256 $actual, pinned $3" >&2
    exit 1
  fi
}

fetch "https://ffmpeg.org/releases/ffmpeg-$FFMPEG_VERSION.tar.xz" "ffmpeg-$FFMPEG_VERSION.tar.xz" "$FFMPEG_SHA256"
fetch "https://code.videolan.org/videolan/x264/-/archive/$X264_COMMIT/x264-$X264_COMMIT.tar.bz2" "x264-$X264_COMMIT.tar.bz2" "$X264_SHA256"
fetch "https://github.com/sekrit-twc/zimg/archive/refs/tags/release-$ZIMG_VERSION.tar.gz" "zimg-release-$ZIMG_VERSION.tar.gz" "$ZIMG_SHA256"

build="$work/build/$target"
prefix="$build/prefix"
rm -rf "$build" # each run replaces its own folder: old and new objects never mix
mkdir -p "$build" "$prefix"
jobs="$(getconf _NPROCESSORS_ONLN)"

case "$target" in
  mac-arm64|mac-x64)
    arch="${target#mac-}"; [ "$arch" = x64 ] && arch=x86_64
    host="$([ "$arch" = arm64 ] && echo aarch64-apple-darwin || echo x86_64-apple-darwin)"
    sdk="$(xcrun --show-sdk-path)"
    export CC="clang -arch $arch -isysroot $sdk -mmacosx-version-min=$MAC_MINIMUM"
    export CXX="clang++ -arch $arch -isysroot $sdk -mmacosx-version-min=$MAC_MINIMUM"
    cross=(); [ "$arch" = arm64 ] && [ "$(uname -m)" != arm64 ] && cross=(--enable-cross-compile --arch=aarch64 --target-os=darwin)
    system=(--enable-videotoolbox --enable-audiotoolbox --extra-ldflags="-mmacosx-version-min=$MAC_MINIMUM")
    x264_host=(--host="$host")
    exe=""
    ;;
  linux-x64)
    export CC=gcc CXX=g++
    cross=(); system=(); x264_host=(); exe=""
    ;;
  win-x64)
    export CC=x86_64-w64-mingw32-gcc CXX=x86_64-w64-mingw32-g++
    cross=(--enable-cross-compile --arch=x86_64 --target-os=mingw32 --cross-prefix=x86_64-w64-mingw32-)
    system=(--enable-mediafoundation --extra-ldflags=-static)
    x264_host=(--host=x86_64-w64-mingw32 --cross-prefix=x86_64-w64-mingw32-)
    exe=".exe"
    ;;
  *) echo "unknown target: $target" >&2; exit 1 ;;
esac

export PKG_CONFIG_PATH="$prefix/lib/pkgconfig"
export PKG_CONFIG_LIBDIR="$prefix/lib/pkgconfig" # only what we built: never a library this machine happens to have

echo "== x264"
tar -xjf "$sources/x264-$X264_COMMIT.tar.bz2" -C "$build"
(cd "$build/x264-$X264_COMMIT" && ./configure --prefix="$prefix" --enable-static --disable-cli --enable-pic "${x264_host[@]}" && make -j"$jobs" && make install)

echo "== zimg"
tar -xzf "$sources/zimg-release-$ZIMG_VERSION.tar.gz" -C "$build"
zimg_host=(); [ "${#x264_host[@]}" -gt 0 ] && zimg_host=("${x264_host[0]}")
(cd "$build/zimg-release-$ZIMG_VERSION" && ./autogen.sh && ./configure --prefix="$prefix" --enable-static --disable-shared --with-pic "${zimg_host[@]}" && make -j"$jobs" && make install)

echo "== ffmpeg"
tar -xJf "$sources/ffmpeg-$FFMPEG_VERSION.tar.xz" -C "$build"
configure=(--prefix="$prefix" --pkg-config-flags=--static --enable-static --disable-shared
  --enable-gpl --enable-version3 --enable-libx264 --enable-libzimg
  --disable-autodetect --disable-ffplay --disable-doc --disable-network --disable-debug
  --extra-cflags="-I$prefix/include" --extra-ldflags="-L$prefix/lib"
  "${cross[@]}" "${system[@]}")
(cd "$build/ffmpeg-$FFMPEG_VERSION" && ./configure --cc="$CC" --cxx="$CXX" "${configure[@]}" && make -j"$jobs" && make install)

echo "== pack"
pack="$build/pack"
mkdir -p "$pack"
cp "$prefix/bin/ffmpeg$exe" "$prefix/bin/ffprobe$exe" "$pack/"
cp "$build/ffmpeg-$FFMPEG_VERSION/COPYING.GPLv3" "$pack/"
{
  echo "FFmpeg $FFMPEG_VERSION for $target, built by hubnx Video's ffmpeg/build.sh on $(date -u +%Y-%m-%d)."
  echo "Licence: GPL version 3 or later (COPYING.GPLv3). The sources are published beside each hubnx Video release."
  echo
  echo "Sources:"
  echo "  ffmpeg-$FFMPEG_VERSION.tar.xz  sha256 $FFMPEG_SHA256  https://ffmpeg.org/releases/"
  echo "  x264 $X264_COMMIT  sha256 $X264_SHA256  https://code.videolan.org/videolan/x264"
  echo "  zimg $ZIMG_VERSION  sha256 $ZIMG_SHA256  https://github.com/sekrit-twc/zimg"
  echo
  echo "Configure: ${configure[*]}"
} > "$pack/BUILD.txt"
archive="$output/ffmpeg-$FFMPEG_VERSION-$target.tar.xz"
tar -cJf "$archive" -C "$pack" .
shasum -a 256 "$archive"
