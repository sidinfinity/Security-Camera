#!/usr/bin/python3

import requests, os, json

url = "https://app.nanonets.com/api/v2/ObjectDetection/Model/"
api_key = "lAKaGYHp5e4BMxLJhB1UMfDSxklAfmp0"

payload = "{\"categories\" : [\"face\"]}"
headers = {'Content-Type': "application/json",}

response = requests.request("POST", url, headers=headers, auth=requests.auth.HTTPBasicAuth(api_key, ''), data=payload)

print(response.text)
model_id = json.loads(response.text)

print("NEXT RUN: export NANONETS_MODEL_ID=" + model_id)
print("THEN RUN: python ./code/upload-training.py")
