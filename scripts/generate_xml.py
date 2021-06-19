#!/usr/bin/python3

import re
import sys

import numpy

from PIL import Image
from lxml import etree as ET

class GenerateXml:
    def __init__(
        self, box_array, im_width, im_height, inferred_class, file_name
    ):
        self.inferred_class = inferred_class
        self.box_array = box_array
        self.im_width = im_width
        self.im_height = im_height
        self.file_name = file_name

    def generate_basic_structure(self):
        annotation = ET.Element('annotation')
        ET.SubElement(annotation, 'filename').text = self.file_name + '.jpg'
        size = ET.SubElement(annotation, 'size')
        ET.SubElement(size, 'width').text = str(self.im_width)
        ET.SubElement(size, 'height').text = str(self.im_height)
        ET.SubElement(size, 'depth').text = '3'

        count = 0
        for box in self.box_array:
            objectBox = ET.SubElement(annotation, 'object')
            ET.SubElement(objectBox, 'name').text = self.inferred_class[count]
            ET.SubElement(objectBox, 'pose').text = 'Unspecified'
            ET.SubElement(objectBox, 'truncated').text = '0'
            ET.SubElement(objectBox, 'difficult').text = '0'
            bndBox = ET.SubElement(objectBox, 'bndbox')
            ET.SubElement(bndBox, 'xmin').text = str(box['xmin'])
            ET.SubElement(bndBox, 'ymin').text = str(box['ymin'])
            ET.SubElement(bndBox, 'xmax').text = str(box['xmax'])
            ET.SubElement(bndBox, 'ymax').text = str(box['ymax'])
            count += 1

        arquivo = ET.ElementTree(annotation)
        arquivo.write('../images/' + self.file_name + '.xml', pretty_print=True)


def createBox(x, y, height, width):
    return {'xmin': x, 'xmax': x + width, 'ymin': y, 'ymax': y + height}

def get_filename(fname: str) -> str:
    regex = re.compile(r'(.*)\.jpg')
    match = re.match(regex, fname)
    if match:
        return match.group(1)
    return None

def main():
    aFile = open("annotations.txt", "r")
    while True:
        try:
            imageFile = get_filename(aFile.readline())
            num = int(aFile.readline())
            if num == 0:
                temp = aFile.readline()
                continue
            boxes = []
            inferred = []
            for i in range(0, num):
                rawBox = aFile.readline().split(' ')
                boundBox = createBox(
                    int(rawBox[0]), int(rawBox[1]), int(rawBox[2]),
                    int(rawBox[3])
                )
                boxes.append(boundBox)
                inferred.append("face")

            image = Image.open("../images/" + imageFile + ".jpg")
            width, height = image.size
            print(len(boxes), len(inferred))
            xml = GenerateXml(boxes, width, height, inferred, imageFile)
            xml.generate_basic_structure()
        except Exception:
            break;

    aFile.close()


if __name__ == "__main__":
    main()
