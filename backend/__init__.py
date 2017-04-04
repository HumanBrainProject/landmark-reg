#!/usr/bin/env python3

import flask

from .api import register_api


app = flask.Flask(__name__, static_folder="../frontend", static_url_path="")

@app.route("/")
def root():
    return app.send_static_file('index.xhtml')

register_api(app, prefix="/api")
