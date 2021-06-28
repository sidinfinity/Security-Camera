#!/usr/bin/python3

import requests

url = 'https://app.nanonets.com/api/v2/ObjectDetection/Model/49fb94bf-128b-4a8b-8242-dbf2d7f06f65/Train/'
response = requests.request('POST', url, auth=requests.auth.HTTPBasicAuth('WbeirrLIJJ696lyWin1TAw6z25NxS4Mq', ''))

print(response.status_code)
