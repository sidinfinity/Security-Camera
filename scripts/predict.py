#!/usr/bin/python3

import requests

url = 'https://app.nanonets.com/api/v2/ObjectDetection/Model/49fb94bf-128b-4a8b-8242-dbf2d7f06f65/LabelFile/'

filename = '0_Parade_marchingband_1_5.jpg'

data = {'file': open('../images/' + filename, 'rb')}

response = requests.post(url, auth=requests.auth.HTTPBasicAuth('WbeirrLIJJ696lyWin1TAw6z25NxS4Mq', ''), files=data)

print(response.text)
print(response.status_code)
