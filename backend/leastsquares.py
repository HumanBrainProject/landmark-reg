#!/usr/bin/env python3

import numpy as np

def per_landmark_mismatch(src, dst, matrix):
    src_block = np.r_[src.T, np.ones((1, len(src)))]
    transformed_src_block = np.dot(matrix, src_block)
    distances = np.sqrt(np.sum((dst - transformed_src_block[:3].T) ** 2, axis=1))
    return distances


def affine(src, dst):
    """Estimate the best affine matrix by least-squares in target space"""
    flat_dst = dst.flatten(order="C")  # order: dst1x, dst1y, dst1z, dst2x...

    src_mat = np.zeros((len(flat_dst), 12))
    for src_idx, src_vec in enumerate(src):
        src_mat[3 * src_idx][:3] = src_vec
        src_mat[3 * src_idx][3] = 1
        src_mat[3 * src_idx + 1][4:7] = src_vec
        src_mat[3 * src_idx + 1][7] = 1
        src_mat[3 * src_idx + 2][8:11] = src_vec
        src_mat[3 * src_idx + 2][11] = 1

    flat_mat, _, _, _ = np.linalg.lstsq(src_mat, flat_dst)
    mat = flat_mat.reshape((3, 4), order="C")
    mat = np.concatenate((mat, [[0, 0, 0, 1]]), axis=0)
    return mat


def affine_gergely(src, dst):
    """Estimate the best affine matrix by least-squares in source space"""
    hsrc = np.c_[src, np.ones(len(src))]
    hdst = np.c_[dst, np.ones(len(dst))]
    # TODO handle LinAlgError (non-invertible matrix)
    mat = np.dot(np.dot(hdst.T, hdst), np.linalg.inv(np.dot(hsrc.T, hdst)))
    assert np.allclose(mat[3], [0, 0, 0, 1])
    mat[3, :] = [0, 0, 0, 1]
    return mat


# This function is mostly from scikit-image, copyright and licence below:
# (https://github.com/scikit-image/scikit-image/blob/8022d048bbcb74ef072e45faf925a4106414308e/skimage/transform/_geometric.py#L72)
#
# Copyright (C) 2011, the scikit-image team
# All rights reserved.
#
# Redistribution and use in source and binary forms, with or without
# modification, are permitted provided that the following conditions are
# met:
#
#  1. Redistributions of source code must retain the above copyright
#     notice, this list of conditions and the following disclaimer.
#  2. Redistributions in binary form must reproduce the above copyright
#     notice, this list of conditions and the following disclaimer in
#     the documentation and/or other materials provided with the
#     distribution.
#  3. Neither the name of skimage nor the names of its contributors may be
#     used to endorse or promote products derived from this software without
#     specific prior written permission.
#
# THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
# IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
# WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
# DISCLAIMED. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT,
# INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
# (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
# SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
# HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
# STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING
# IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
# POSSIBILITY OF SUCH DAMAGE.
def umeyama(src, dst, estimate_scale=False, allow_reflection=False):
    """Estimate N-D similarity transformation with or without scaling.
    Parameters
    ----------
    src : (M, N) array
        Source coordinates.
    dst : (M, N) array
        Destination coordinates.
    estimate_scale : bool
        Whether to estimate scaling factor.
    Returns
    -------
    T : (N + 1, N + 1)
        The homogeneous similarity transformation matrix. The matrix contains
        NaN values only if the problem is not well-conditioned.
    References
    ----------
    .. [1] "Least-squares estimation of transformation parameters between two
            point patterns", Shinji Umeyama, PAMI 1991, DOI: 10.1109/34.88573
    """

    num = src.shape[0]
    dim = src.shape[1]

    # Compute mean of src and dst.
    src_mean = src.mean(axis=0)
    dst_mean = dst.mean(axis=0)

    # Subtract mean from src and dst.
    src_demean = src - src_mean
    dst_demean = dst - dst_mean

    # Eq. (38).
    A = np.dot(dst_demean.T, src_demean) / num

    T = np.eye(dim + 1, dtype=np.double)

    U, S, V = np.linalg.svd(A)

    rank = np.count_nonzero(S)

    if rank == 0:
        return np.nan * T
    # TODO return error or warning if the solution is ambiguous (rank < dim - 1)
    # TODO handle ill-conditioned matrix

    # Eq. (39).
    # assert ((np.linalg.det(U) * np.linalg.det(V)) * np.linalg.det(A) >= 0
    #         or np.isclose(np.linalg.det(A), 0))
    d = np.ones((dim,), dtype=np.double)
    if ((not allow_reflection or rank < dim)
        and np.linalg.det(U) * np.linalg.det(V) < 0):
        d[dim - 1] = -1

    # Eq. (40) and (43).
    T[:dim, :dim] = np.dot(U, np.dot(np.diag(d), V))

    if estimate_scale:
        # Eq. (41) and (42).
        scale = 1.0 / src_demean.var(axis=0).sum() * np.dot(S, d)
    else:
        scale = 1.0

    T[:dim, dim] = dst_mean - scale * np.dot(T[:dim, :dim], src_mean.T)
    T[:dim, :dim] *= scale

    return T
