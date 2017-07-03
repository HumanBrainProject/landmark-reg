#! /usr/bin/env python3
#
# Copyright (c) 2016, 2017, Forschungszentrum Juelich GmbH
# Author: Yann Leprince <y.leprince@fz-juelich.de>
#
# This software is made available under the MIT licence, see LICENCE.txt.


import gzip
import json
import os
import pathlib
import sys

import numpy as np
import PIL.Image
from tqdm import tqdm, trange

RAW_CHUNK_PATTERN = "{key}/{0}-{1}/{2}-{3}/{4}-{5}"

TILE_SIZE = 256
TILE_PATTERN = "{level:d}/{slice_axis}/{slice_number:04d}/{0}{1:02d}_{2}{3:02d}.png"


def convert_scale(info, level, input_dir, output_dir):
    # Key is the resolution in micrometres
    scale_info = info["scales"][level]
    chunk_size = scale_info["chunk_sizes"][0]
    key = scale_info["key"]
    size = scale_info["size"]
    dtype = np.dtype(info["data_type"]).newbyteorder("<")
    num_channels = info["num_channels"]
    assert num_channels == 1

    def load_chunk(xmin, xmax, ymin, ymax, zmin, zmax):
        chunk_path = input_dir / RAW_CHUNK_PATTERN.format(
            xmin, xmax, ymin, ymax, zmin, zmax, key=key)

        try:
            f = chunk_path.open("rb")
        except OSError:
            gz_name = str(chunk_path.with_name(chunk_path.name + ".gz"))
            f = gzip.open(gz_name, "rb")
        with f:
            chunk = np.frombuffer(f.read(), dtype=dtype).reshape(
                [num_channels, zmax - zmin, ymax - ymin, xmax - xmin])
        return chunk

    def load_tilechunk(xmin, xmax, ymin, ymax, zmin, zmax):
        ret = np.empty(
            [num_channels, zmax - zmin, ymax - ymin, xmax - xmin],
            dtype=dtype
        )
        for x_idx in range(xmin // chunk_size[0],
                           (xmax - 1) // chunk_size[0] + 1):
            for y_idx in range(ymin // chunk_size[1],
                               (ymax - 1) // chunk_size[1] + 1):
                for z_idx in range(zmin // chunk_size[2],
                                   (zmax - 1) // chunk_size[2] + 1):
                    chunk_xmin = chunk_size[0] * x_idx
                    chunk_xmax = min(chunk_size[0] * (x_idx + 1), size[0])
                    chunk_ymin = chunk_size[1] * y_idx
                    chunk_ymax = min(chunk_size[1] * (y_idx + 1), size[1])
                    chunk_zmin = chunk_size[2] * z_idx
                    chunk_zmax = min(chunk_size[2] * (z_idx + 1), size[2])
                    chunk = load_chunk(chunk_xmin, chunk_xmax,
                                       chunk_ymin, chunk_ymax,
                                       chunk_zmin, chunk_zmax)
                    ret[:,
                        chunk_zmin - zmin:chunk_zmax - zmin,
                        chunk_ymin - ymin:chunk_ymax - ymin,
                        chunk_xmin - xmin:chunk_xmax - xmin] = chunk
        return ret

    def write_x_tiles(tilechunk):
        for x in range(tilechunk.shape[3]):
            tile = tilechunk[0, :, :, x].T
            tile_path = output_dir / TILE_PATTERN.format(
                "y", y_idx, "z", z_idx,
                level=level, slice_axis="x", slice_number=x_idx * TILE_SIZE + x
            )
            write_tile(tile, tile_path)

    def write_y_tiles(tilechunk):
        for y in range(tilechunk.shape[2]):
            tile = tilechunk[0, :, y, :]
            tile_path = output_dir / TILE_PATTERN.format(
                "z", z_idx, "x", x_idx,
                level=level, slice_axis="y", slice_number=y_idx * TILE_SIZE + y
            )
            write_tile(tile, tile_path)

    def write_z_tiles(tilechunk):
        for z in range(tilechunk.shape[1]):
            tile = tilechunk[0, z, :, :]
            tile_path = output_dir / TILE_PATTERN.format(
                "y", y_idx, "x", x_idx,
                level=level, slice_axis="z", slice_number=z_idx * TILE_SIZE + z
            )
            write_tile(tile, tile_path)

    def write_tile(tile, tile_path):
        os.makedirs(str(tile_path.parent), exist_ok=True)
        img = PIL.Image.fromarray(tile)
        img.save(tile_path)

    progress_bar = tqdm(
        total=(((size[0] - 1) // TILE_SIZE + 1)
               * ((size[1] - 1) // TILE_SIZE + 1)
               * ((size[2] - 1) // TILE_SIZE + 1)),
        desc="converting scale {}".format(key), unit="tilechunks", leave=True)
    for x_idx in range((size[0] - 1) // TILE_SIZE + 1):
        for y_idx in range((size[1] - 1) // TILE_SIZE + 1):
            for z_idx in range((size[2] - 1) // TILE_SIZE + 1):
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


def convert_scales(input_dir, output_dir):
    """Convert all scales from an input info file"""
    with (input_dir / "info").open() as f:
        info = json.load(f)
    # TODO ensure that factor of 2 downscaling happens for every axis at every
    # level (Zoomer assumption)
    for level in range(len(info["scales"])):
        convert_scale(info, level, input_dir, output_dir)


def parse_command_line(argv):
    """Parse the script's command line."""
    import argparse
    parser = argparse.ArgumentParser(
        description="""\
Convert Neuroglancer raw chunks to Zoomer tiles.

The list of scales is read from a file named "info" in the current directory.
""")
    args = parser.add_argument("input_dir", type=pathlib.Path)
    args = parser.add_argument("output_dir", type=pathlib.Path)
    args = parser.parse_args(argv[1:])
    # TODO sanity checks on paths
    return args


def main(argv):
    """The script's entry point."""
    args = parse_command_line(argv)
    return convert_scales(args.input_dir, args.output_dir) or 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
