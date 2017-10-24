#!/usr/bin/env python3

import flask
from flask_cors import CORS

from .api import register_api

app = flask.Flask(__name__, static_folder="../frontend", static_url_path="")
CORS(app)

@app.route("/")
def root():
    return app.send_static_file('index.html')

register_api(app, prefix="/api")
