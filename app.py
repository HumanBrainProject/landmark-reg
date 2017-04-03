#!/usr/bin/env python3

from flask import Flask

from backend.api import register_api


app = Flask(__name__, static_folder="app")
register_api(app, prefix="/api")


if __name__ == "__main__":
    app.run(debug=True)
