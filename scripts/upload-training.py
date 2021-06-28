#!/usr/bin/python3

import json
import os
import requests
import time
import xml.etree.ElementTree as ET
import socket

from tqdm import tqdm

model_id = "49fb94bf-128b-4a8b-8242-dbf2d7f06f65"
api_key = "WbeirrLIJJ696lyWin1TAw6z25NxS4Mq"


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

        url = 'https://app.nanonets.com/api/v2/ObjectDetection/Model/' + model_id + '/UploadFile/'
        info = ("", json.dumps(([{"filename": filename, "object": bBoxes}])))


        try:
            data = {"file": open("../images/" + filename, 'rb'), 'data': info, 'modelId' :('', model_id)}
            response = requests.post(url, auth=requests.auth.HTTPBasicAuth(api_key, ''), files=data, timeout = 10)
            if response.status_code > 250 or response.status_code<200:
                print(response.text, response.status_code, filename)

        except requests.Timeout:
            print(f"Got requests.Timeout  {filename}")
            time.sleep(10)
            continue

        except requests.exceptions.ConnectionError:
            print(f"Got requests.exceptions.ConnectionError  {filename}")
            time.sleep(10)
            continue

        except requests.exceptions.ReadTimeout:
            print(f"Got requests.exceptions.ReadTimeout  {filename}")
            time.sleep(10)
            continue
