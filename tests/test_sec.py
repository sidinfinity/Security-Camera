#!/usr/bin/python3

import filecmp
import os
import pytest
import re
import sys

dir_path = os.path.dirname(os.path.realpath(__file__))
sys.path.append(os.path.join(dir_path, ".."))

from scripts.generate_xml import get_filename, read_and_generate_xml_files

@pytest.mark.parametrize(
    "fstr, fname", [
        ("xyz/1.jpg", "1"),
        ("xyz/1.jpg.jpg", "1.jpg"),
        ("xyz/1.jg", None)
    ]
)
def test_regex(fstr, fname):
    assert get_filename(fstr) == fname

def test_GenerateXml():
    try:
        dir_path = os.path.dirname(os.path.realpath(__file__))
        img_dir = os.path.join(dir_path, "data")
        src_file = os.path.join(img_dir, "annotations.txt")

        read_and_generate_xml_files(src_file, img_dir, img_dir)

        expected_out1 = os.path.join(img_dir, "test1.out")
        expected_out2 = os.path.join(img_dir, "test2.out")
        out1 = os.path.join(img_dir, "test1.xml")
        out2 = os.path.join(img_dir, "test2.xml")

        assert filecmp.cmp(expected_out1, out1) == True
        assert filecmp.cmp(expected_out2, out2) == True

    finally:
        for f in os.listdir(img_dir):
            if re.search(r".*\.xml$", f):
                #os.remove(os.path.join(img_dir, f))
                pass
