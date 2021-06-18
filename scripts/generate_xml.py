import xml.etree.cElementTree as ET
from PIL import Image

class GenerateXml(object):
    def __init__(self, box_array, im_width, im_height, inferred_class, file_name):
        self.inferred_class = inferred_class
        self.box_array = box_array
        self.im_width = im_width
        self.im_height = im_height
        self.file_name = file_name

    def generate_basic_structure(self):
        annotation = ET.Element('annotation')
        ET.SubElement(annotation, 'filename').text = "../images/" + self.file_name + '.jpg'
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
        arquivo.write('../xml' + self.file_name + '.xml')


def createBox(x, y, height, width):
    return {'xmin': x, 'xmax': x + width, 'ymin': y, 'ymax': y + height}

def createXML(fileName, count):
    width, height = Image.open("../images/" + fileName + ".jpg")
    print(width, height)

    xml = GenerateXml([createBox(449, 330, 122, 149)], width, height, ["face"], fileName)
    xml.generate_basic_structure()

def main():
    createXML("0--Parade/0_Parade_marchingband_1_849", 1)


if __name__ == "__main__":
    main()
