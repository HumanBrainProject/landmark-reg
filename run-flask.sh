#! /bin/sh -e

export PYTHONPATH=$(dirname -- "$0")
export FLASK_APP=backend

if [ "$1" = debug ]; then
    export FLASK_DEBUG=1
fi

flask run
