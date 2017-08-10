#! /bin/sh -e

PYTHONPATH=$(dirname -- "$0")${PYTHONPATH+:}$PYTHONPATH
FLASK_APP=backend
export PYTHONPATH FLASK_APP

flask run "$@"
