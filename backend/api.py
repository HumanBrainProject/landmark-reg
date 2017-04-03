#!/usr/bin/env python3

import pprint

import flask_restful
from flask_restful import request, url_for


class CreateAlignmentTaskAPI(flask_restful.Resource):
    def post(self):
        pprint.pprint(request.json)
        return {"alignment-task": url_for("alignment-task", id=3)}, 201


class AlignmentTaskAPI(flask_restful.Resource):
    def get(self):
        pprint.pprint(request.json)
        return {"status": ""}, 201


def register_api(app, *args, **kwargs):
    api = flask_restful.Api(app, *args, **kwargs)
    api.add_resource(CreateAlignmentTaskAPI, "/alignment-task")
    api.add_resource(AlignmentTaskAPI, "/alignment-task/<int:id>",
                     endpoint="alignment-task")
