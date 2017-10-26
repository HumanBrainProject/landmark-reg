#!/bin/sh -e

if [ "$(git clean -xnd backend/)" != '' ]; then
    cat <<EOF
The backend/ directory contains untracked files, please clean it (e.g. with
"git clean -xid backend/") before running this script again.
EOF
    exit 1
fi

python -m compileall -b ./backend
tar --exclude='*.py' -czf landmark-reg-compiled-backend.tar.gz backend/

echo 'Output written to landmark-reg-compiled-backend.tar.gz'
