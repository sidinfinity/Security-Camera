#!/usr/bin/python3

import os
import re
import sys

import numpy

from PIL import Image
from lxml import etree as ET


class GenerateXml:

    def __init__(self, xml_dir):
        self.xml_dir = xml_dir

    def generate_basic_structure(
        self, file_name, box_array, im_width, im_height, inferred_class
    ):
        annotation = ET.Element("annotation")
        ET.SubElement(annotation, "filename").text = file_name + ".jpg"
        size = ET.SubElement(annotation, "size")
        ET.SubElement(size, "width").text = str(im_width)
        ET.SubElement(size, "height").text = str(im_height)
        ET.SubElement(size, "depth").text = "3"

        count = 0
        for box in box_array:
            objectBox = ET.SubElement(annotation, "object")
            ET.SubElement(objectBox, "name").text = inferred_class[count]
            ET.SubElement(objectBox, "pose").text = "Unspecified"
            ET.SubElement(objectBox, "truncated").text = "0"
            ET.SubElement(objectBox, "difficult").text = "0"
            bndBox = ET.SubElement(objectBox, "bndbox")
            ET.SubElement(bndBox, "xmin").text = str(box["xmin"])
            ET.SubElement(bndBox, "ymin").text = str(box["ymin"])
            ET.SubElement(bndBox, "xmax").text = str(min(im_width, box["xmax"]))
            ET.SubElement(bndBox, "ymax").text = str(min(im_height, box["ymax"]))
            count += 1

        arquivo = ET.ElementTree(annotation)
        img_file = os.path.join(self.xml_dir, file_name+".xml")
        arquivo.write(img_file, pretty_print=True)


def createBox(x, y, height, width):
    return {"xmin": x, "xmax": x + width, "ymin": y, "ymax": y + height}


def get_filename(fname: str) -> str:
    regex = re.compile(r"(.*)/(.*)\.jpg")
    match = re.match(regex, fname)
    if match:
        return match.group(2)

    return None


def read_and_generate_xml_files(src, img_dir, xml_dir):
    aFile = open(src, "r")
    xml = GenerateXml(xml_dir)

    while True:
        try:
            imageFile = get_filename(aFile.readline())
            num = aFile.readline()
            # end of file check
            if num == '':
                break

            num = int(num)
            if num == 0:
                temp = aFile.readline()
                continue
            boxes = []
            inferred = []
            for i in range(0, num):
                rawBox = aFile.readline().split(" ")
                boundBox = createBox(
                    int(rawBox[0]), int(rawBox[1]), int(rawBox[2]), int(rawBox[3])
                )
                boxes.append(boundBox)
                inferred.append("face")

            img = os.path.join(img_dir, imageFile+".jpg")
            image = Image.open(img)
            width, height = image.size
            xml.generate_basic_structure(
                imageFile, boxes, width, height, inferred
            )
        except Exception as e:
            exception_type, exception_object, exception_traceback = sys.exc_info()
            filename = exception_traceback.tb_frame.f_code.co_filename
            line_number = exception_traceback.tb_lineno
            print("Exception type: ", exception_type)
            print("File name: ", filename)
            print("Line number: ", line_number)
            break

    aFile.close()


if __name__ == "__main__":

    dir_path = os.path.dirname(os.path.realpath(__file__))
    img_dir = os.path.join(dir_path, "..", "images")
    src_file = os.path.join(dir_path, "annotations.txt")
    xml_dir = os.path.join(dir_path, "..", "xml")

    read_and_generate_xml_files(src_file, img_dir, xml_dir)
