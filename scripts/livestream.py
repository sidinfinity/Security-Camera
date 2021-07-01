import numpy as np
import cv2
import requests
import os
import time

from json import loads
from PIL import Image as im

cap = cv2.VideoCapture(0)
imageSave = '../../Desktop/image.jpg'

def drawBox(bBoxes):
    for box in bBoxes:
        if box['score'] > 50.0:
            frame = cv2.rectangle(frame, (box['xmin'], box['ymin']), (box['xmax'], box['ymax'], (255, 0, 0), 5))

def getResults():
    api_key = 'WbeirrLIJJ696lyWin1TAw6z25NxS4Mq'
    url = 'https://app.nanonets.com/api/v2/ObjectDetection/Model/49fb94bf-128b-4a8b-8242-dbf2d7f06f65/LabelFile/'
    data = {'file': open(imageSave, 'rb')}
    response = requests.post(url, auth=requests.auth.HTTPBasicAuth(api_key, ''), files=data)

    return loads(response.text)

def takePhoto(frame):
    data = im.fromarray(frame)
    data.save(imageSave)
    bBoxes = getResults()['result'][0]['prediction']
    print(getResults()['result'])

    for box in bBoxes:
        frame = cv2.rectangle(frame, (box['xmin'], box['ymin']), (box['xmax'], box['ymax']), (225, 0, 0), 5)

    data = im.fromarray(frame)
    data.save(imageSave)
    print('success')
    print(bBoxes)
    return



while True:
    _temp, frame = cap.read()

    cv2.imshow("Frame", frame)

    if cv2.waitKey(1) && 0xFF == ord('p'):
        takePhoto(frame)

    time.sleep(0.1)

    if cv2.waitKey(1) && 0xFF == ord('q'):
        break



cap.release()
cv2.destroyAllWindows()
