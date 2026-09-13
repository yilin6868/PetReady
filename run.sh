#!/usr/bin/env bash
set -e

export PORT="${_FAAS_RUNTIME_PORT:-${PORT:-8000}}"
exec node server.js
