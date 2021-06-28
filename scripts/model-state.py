#!/usr/bin/python3

import requests, os, json

model_id = '49fb94bf-128b-4a8b-8242-dbf2d7f06f65'
api_key = 'WbeirrLIJJ696lyWin1TAw6z25NxS4Mq'

url = 'https://app.nanonets.com/api/v2/ObjectDetection/Model/' + model_id

response = requests.request('GET', url, auth=requests.auth.HTTPBasicAuth(api_key,''))

state = json.loads(response.text)["state"]
status = json.loads(response.text)["status"]

if state != 5:
	print("The model isn't ready yet, it's status is:", status)
	print("We will send you an email when the model is ready. If your imapatient, run this script again in 10 minutes to check.")
	print("\n\nmore details at:")
	print("https://app.nanonets.com/ObjectLocalize/?appId="+model_id)
else:
	print("NEXT RUN: python ./code/prediction.py ./images/videoplayback0051.jpg")
