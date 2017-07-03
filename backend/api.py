#!/usr/bin/env python3

import pprint

import flask_restful
from flask_restful import request, url_for

import numpy as np

from . import leastsquares


# Standard codes
HTTP_200_OK = 200
HTTP_501_NOT_IMPLEMENTED = 501


def np_matrix_to_json(np_matrix):
    return [list(row) for row in np_matrix]


class LeastSquaresAPI(flask_restful.Resource):
    def post(self):
        pprint.pprint(request.json)
        transformation_type = request.json["transformation_type"]
        source_points = np.array([pair["source_point"]
                                  for pair in request.json["landmark_pairs"]])
        target_points = np.array([pair["target_point"]
                                  for pair in request.json["landmark_pairs"]])

        if transformation_type == "translation":
            return {"error": "not implemented yet"}, HTTP_200_OK
        elif transformation_type == "rigid":
            mat = leastsquares.umeyama(source_points, target_points, False)
        elif transformation_type == "similarity":
            mat = leastsquares.umeyama(source_points, target_points, True)
        elif transformation_type == "affine":
            return {"error": "not implemented yet"}, HTTP_200_OK
        else:
            return ({"error": "unrecognized transformation_type"},
                    HTTP_501_NOT_IMPLEMENTED)

        inv_mat = np.linalg.inv(mat)
        if np.all(np.isfinite(mat)) and np.all(np.isfinite(inv_mat)):
            transformation_matrix = np_matrix_to_json(mat)
            inverse_matrix = np_matrix_to_json(inv_mat)
            return ({"transformation_matrix": transformation_matrix,
                     "inverse_matrix": inverse_matrix},
                    HTTP_200_OK)
        else:
            return {"error": "cannot compute least-squares solution "
                    "(singular matrix?)"}, HTTP_200_OK


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
    api.add_resource(LeastSquaresAPI, "/least-squares")
    api.add_resource(CreateAlignmentTaskAPI, "/alignment-task")
    api.add_resource(AlignmentTaskAPI, "/alignment-task/<int:id>",
                     endpoint="alignment-task")
