#! /usr/bin/env python3
#
# Copyright (c) 2016, 2017, Forschungszentrum Juelich GmbH
# Author: Yann Leprince <y.leprince@fz-juelich.de>
#
# This software is made available under the MIT licence, see LICENCE.txt.


import io
import json
import os
import sys

import numpy as np
import PIL.Image
from tqdm import tqdm, trange

import neuroglancer_scripts.accessor
import neuroglancer_scripts.data_types
import neuroglancer_scripts.precomputed_io
from neuroglancer_scripts.utils import ceil_div


# TODO deal with input_min... handle signed dtypes?
def get_chunk_scaler_to_uint8(input_dtype):
    if np.issubdtype(input_dtype, np.integer):
        input_min = np.iinfo(input_dtype).min
        input_max = np.iinfo(input_dtype).max
    else:
        input_min = 0.0
        input_max = 1.0

    scaling_factor = 255.0 / input_max

    post_scaling_converter = neuroglancer_scripts.data_types.get_chunk_dtype_transformer(np.float32, np.uint8)

    def chunk_scaler(chunk):
        return post_scaling_converter(scaling_factor * chunk.astype("float32"))

    return chunk_scaler


TILE_SIZE = 256
TILE_PATTERN = "{level:d}/{slice_axis}/{slice_number:04d}/{0}{1:02d}_{2}{3:02d}.png"


def convert_scale(pyramid_io, level, zoomer_accessor):
    # Key is the resolution in micrometres
    key = pyramid_io.info["scales"][level]["key"]
    scale_info = pyramid_io.scale_info(key)
    chunk_size = scale_info["chunk_sizes"][0]
    key = scale_info["key"]
    size = scale_info["size"]
    dtype = np.dtype(pyramid_io.info["data_type"]).newbyteorder("<")
    num_channels = pyramid_io.info["num_channels"]
    assert num_channels == 1

    scale_chunk_to_uint8 = get_chunk_scaler_to_uint8(dtype)

    def load_tilechunk(xmin, xmax, ymin, ymax, zmin, zmax):
        ret = np.empty(
            [num_channels, zmax - zmin, ymax - ymin, xmax - xmin],
            dtype=np.uint8
        )
        for x_idx in range(xmin // chunk_size[0],
                           ceil_div(xmax, chunk_size[0])):
            for y_idx in range(ymin // chunk_size[1],
                               ceil_div(ymax, chunk_size[1])):
                for z_idx in range(zmin // chunk_size[2],
                                   ceil_div(zmax, chunk_size[2])):
                    chunk_xmin = chunk_size[0] * x_idx
                    chunk_xmax = min(chunk_size[0] * (x_idx + 1), size[0])
                    chunk_ymin = chunk_size[1] * y_idx
                    chunk_ymax = min(chunk_size[1] * (y_idx + 1), size[1])
                    chunk_zmin = chunk_size[2] * z_idx
                    chunk_zmax = min(chunk_size[2] * (z_idx + 1), size[2])
                    chunk = pyramid_io.read_chunk(
                        key, (chunk_xmin, chunk_xmax,
                              chunk_ymin, chunk_ymax,
                              chunk_zmin, chunk_zmax)
                    )
                    chunk = scale_chunk_to_uint8(chunk)
                    ret[:,
                        chunk_zmin - zmin:chunk_zmax - zmin,
                        chunk_ymin - ymin:chunk_ymax - ymin,
                        chunk_xmin - xmin:chunk_xmax - xmin] = chunk
        return ret

    def write_x_tiles(tilechunk):
        for x in range(tilechunk.shape[3]):
            tile = tilechunk[0, :, :, x].T
            tile_path = TILE_PATTERN.format(
                "y", y_idx, "z", z_idx,
                level=level, slice_axis="x", slice_number=x_idx * TILE_SIZE + x
            )
            write_tile(tile, tile_path)

    def write_y_tiles(tilechunk):
        for y in range(tilechunk.shape[2]):
            tile = tilechunk[0, :, y, :]
            tile_path = TILE_PATTERN.format(
                "z", z_idx, "x", x_idx,
                level=level, slice_axis="y", slice_number=y_idx * TILE_SIZE + y
            )
            write_tile(tile, tile_path)

    def write_z_tiles(tilechunk):
        for z in range(tilechunk.shape[1]):
            tile = tilechunk[0, z, :, :]
            tile_path = TILE_PATTERN.format(
                "y", y_idx, "x", x_idx,
                level=level, slice_axis="z", slice_number=z_idx * TILE_SIZE + z
            )
            write_tile(tile, tile_path)

    def write_tile(tile, tile_path):
        img = PIL.Image.fromarray(tile)
        io_buf = io.BytesIO()
        img.save(io_buf, format="png")
        zoomer_accessor.store_file(tile_path, io_buf.getvalue(),
                                   mime_type="image/png")

    progress_bar = tqdm(
        total=(ceil_div(size[0], TILE_SIZE)
               * ceil_div(size[1], TILE_SIZE)
               * ceil_div(size[2], TILE_SIZE)),
        desc="converting scale {}".format(key), unit="tilechunk", leave=True)
    for x_idx, y_idx, z_idx in np.ndindex((ceil_div(size[0], TILE_SIZE),
                                               ceil_div(size[1], TILE_SIZE),
                                               ceil_div(size[2], TILE_SIZE))):
            xmin = TILE_SIZE * x_idx
            xmax = min(TILE_SIZE * (x_idx + 1), size[0])
            ymin = TILE_SIZE * y_idx
            ymax = min(TILE_SIZE * (y_idx + 1), size[1])
            zmin = TILE_SIZE * z_idx
            zmax = min(TILE_SIZE * (z_idx + 1), size[2])

            tilechunk = load_tilechunk(xmin, xmax, ymin, ymax, zmin, zmax)

            write_x_tiles(tilechunk)
            write_y_tiles(tilechunk)
            write_z_tiles(tilechunk)

            progress_bar.update()


def convert_scales(source_url, output_url, options={}):
    """Convert all scales from an input info file"""
    accessor = neuroglancer_scripts.accessor.get_accessor_for_url(
        source_url, options)

    # TODO ensure that factor of 2 downscaling happens for every axis at every
    # level (Zoomer assumption)

    pyramid_io = neuroglancer_scripts.precomputed_io.get_IO_for_existing_dataset(
        accessor
    )
    info = pyramid_io.info

    zoomer_accessor = neuroglancer_scripts.accessor.get_accessor_for_url(
        output_url, options
    )
    zoomer_accessor.store_file(
        "zoomer-info.json",
        json.dumps({
            "size": info["scales"][0]["size"],
            "voxel_size": [sz * 1e-6 for sz in info["scales"][0]["resolution"]],
            "max_level": len(info["scales"]) - 1,
            "tile_size": TILE_SIZE
        }).encode("utf-8"),
        mime_type="application/json"
    )
    for level in range(len(info["scales"])):
        convert_scale(pyramid_io, level, zoomer_accessor)


def parse_command_line(argv):
    """Parse the script's command line."""
    import argparse
    parser = argparse.ArgumentParser(
        description="""\
Convert Neuroglancer raw chunks to Zoomer tiles.

The list of scales is read from a file named "info" in the source directory.
""")
    args = parser.add_argument("source_url")
    args = parser.add_argument("output_url")

    neuroglancer_scripts.accessor.add_argparse_options(parser, write=False)

    args = parser.parse_args(argv[1:])
    # TODO sanity checks on paths
    return args


def main(argv=sys.argv):
    """The script's entry point."""
    args = parse_command_line(argv)
    return convert_scales(args.source_url, args.output_url,
                          options=vars(args)) or 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
