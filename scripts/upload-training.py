#!/usr/bin/python3
import os, requests
from tqdm import tqdm
import xml.etree.ElementTree as ET

model_id = "b1f02c19-e5ad-4716-9686-2d3f136ef9a2"
api_key = "yrs83CpwwAvgFXrAwNrLyT0iPmXYSGe6"
url = 'https://app.nanonets.com/api/v2/ObjectDetection/Model/' + str(model_id) + '/UploadFile/'

for xmlFile in tqdm(os.listdir("../xml/")):
    if xmlFile.endswith(".xml"):
        bBoxes = []

        tree = ET.parse("../xml/" + xmlFile)
        tree = tree.getroot()
        filename = ""

        for i in tree:
            if i.tag == "filename":
                filename = i.text

            if str(i.tag) == "object":
                objDict = {}
                for element in i:
                    if element.tag == "truncated" or element.tag == "difficult" or element.tag == "pose":
                        continue

                    if element.tag == "bndbox":
                        boundDict = {}
                        for value in element:
                            boundDict[str(value.tag)] = int(value.text)
                        objDict[str("bndbox")] = boundDict

                        continue
                    objDict[str(element.tag)] = element.text

                bBoxes.append(objDict)

        print(filename)
        data = {"file": open("../images/" + filename, 'rb'),
            'data': (
                ' ',
                '[{"filename":' + filename + ', "object":' + f"{bBoxes}" +  '}]'
            ), 'model_id' :('', model_id)
        }

        print(data)
        response = requests.post(url, auth=requests.auth.HTTPBasicAuth(api_key, ''), files=data)

        print(response.text)
        break
