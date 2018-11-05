import json
import numpy as np
import math
from . import leastsquares

def np_matrix_to_json(np_matrix):
    return [list(row) for row in np_matrix]

def handle_post(json_req):
    transformation_type = json_req["transformation_type"]
    landmark_pairs = json_req["landmark_pairs"]
    source_points = np.array([pair["source_point"]
                                for pair in json_req["landmark_pairs"]])
    target_points = np.array([pair["target_point"]
                                for pair in json_req["landmark_pairs"]])

    if transformation_type == "rigid":
        mat = leastsquares.umeyama(source_points, target_points,
                                    estimate_scale=False,
                                    allow_reflection=False)
    elif transformation_type == "rigid+reflection":
        mat = leastsquares.umeyama(source_points, target_points,
                                    estimate_scale=False,
                                    allow_reflection=True)
    elif transformation_type == "similarity":
        mat = leastsquares.umeyama(source_points, target_points,
                                    estimate_scale=True,
                                    allow_reflection=False)
    elif transformation_type == "similarity+reflection":
        mat = leastsquares.umeyama(source_points, target_points,
                                    estimate_scale=True,
                                    allow_reflection=True)
    elif transformation_type == "affine":
        mat = leastsquares.affine(source_points, target_points)
    else:
        raise ValueError("unrecognized transformation_type" + transformation_type)

    inv_mat = np.linalg.inv(mat)

    mismatches = leastsquares.per_landmark_mismatch(
        source_points, target_points, mat)
    for pair, mismatch in zip(landmark_pairs, mismatches):
        pair["mismatch"] = mismatch
    rmse = math.sqrt(np.mean(mismatches ** 2))

    if np.all(np.isfinite(mat)) and np.all(np.isfinite(inv_mat)):
        transformation_matrix = np_matrix_to_json(mat)
        inverse_matrix = np_matrix_to_json(inv_mat)
        return ({"transformation_matrix": transformation_matrix,
                    "inverse_matrix": inverse_matrix,
                    "landmark_pairs": landmark_pairs,
                    "RMSE": rmse})
    else:
        raise ValueError("cannot compute least-squares solution - singular matrix?)")
        
def handle(req):
    """handle a request to the function
    Args:
        req (str): request body
    """
    
    try:
        json.loads(req)
    except:
        raise ValueError("malformed JSON request")
    json_req = json.loads(req)

    try:
        json_req["transformation_type"]
    except KeyError as error:
        raise KeyError("transformation_type not defined")
    transformation_type = json_req["transformation_type"]
    
    try:
        json_req["landmark_pairs"]
    except KeyError as error:
        raise KeyError("landmark_pairs not defined")
    landmark_pairs = json_req["landmark_pairs"]

    return handle_post(json_req)