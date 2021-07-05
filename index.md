# Security Camera 
My project was about using machine learning to do object detection on the raspberry pi. I wanted to create a machine learning model that determined whether there was a face in the image passed, and if there was it would draw bounding boxes around each image in the face. 

| **Engineer** | **School** | **Area of Interest** | **Grade** |  
|Siddharth Maddikayala|American High School|CS/AI|Incoming Freshman|

# Final Milestone

My final milestone was a similar to my second milestone, except I wanted to run a `node.js` server to display my livestream and take pictures. I used `WebRTC` to livestream video on html's `canvas` object which displays an image. I also added a button, `snap`, that takes a picture and display's it on the canvas below. Unfortunately, I couldn't finish the webpage because I couldn't get Nanonet's API call to work. The `canvas` element allows you to generate a `DataUrl` for the image, but Nanonet's API call uses `XMLHttpRequest`, which doesn't support data urls. In the future, I would like to draw bouding boxes in a livestream per frame. For each frame, I would call the API to get the response, and then draw boxes. I tried doing this with Nanonets but their API is too slow so I would like to do this with tensorflow. 

![image](https://user-images.githubusercontent.com/56204136/124403915-75fff280-dced-11eb-8ff2-c3e9482e5e01.png)


<hr>

# Second Milestone

<iframe width="560" height="315" src="https://www.youtube.com/embed/RP1mWxEz4Vw" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

My second milestone was finishing the AI model to detect faces and getting a livestream on the raspberrypi using the Picamera. I also added a keybind "p", which takes a picture and uploads it to nanonets for processing so I can draw the bounding boxes around the faces when I get a response. 

I used Nanonet's API to create, train, and test a model. My first script `create-model.py` just created a model on my account, with the api key that I passed. The next script `upload-model.py` uploaded all my images and the annotations to the model. I had a lot of issues with uploading because it gave a weird formatting issue that didn't make any sense. I eventually figured out that the format has to be a `json` format, so I used `json.dumps()` to format my input properly and finally uploaded all my images. The third script `train-model.py` was the easiest to write. All it did was start the training process. `model-state.py` just printed out the status of my model. For example if the model was finished training or if the images still needed to be uploaded. After the model was finished training, `predict.py` sent an image to the model, and the model then gave a response showing where the bounding boxes on the image go.

After finishing the model and making sure that it works, I started working on a program that uses `opencv` to display a livestream of the raspberrypi camera. I used `videoCapture()` to start taking a video with the camera, and each frame of the video I would display the image. To take a picture I added a keybind `p` that takes a picture and sends the image to Nanonets for processing. After I got back the result, I drew the bounding boxes given and saved the image with bounding boxes in `Desktop`.  

![Livestream Code](https://user-images.githubusercontent.com/56204136/124390920-b5552180-dca2-11eb-9258-0c4ba0e1442a.png)
Livestream Code



<hr>

# First Milestone

<iframe width="560" height="315" src="https://www.youtube.com/embed/waQt1IAPrvA" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

My first milestone was pre-processing my dataset and getting it ready for training. The dataset I used came with a text file that showed where to place the bounding boxes. I wrote a small script that loops through the annotations text file and generates a xml file in the xml directory. This was fairly simple by using the `xml.etree.cElementTree` library in python. I just used the `addElement` fucntion to add elements to my xml variable and then I would just save the varaible contents to a file. I also wrote a few tests to make sure my code works after I make changes. I used the module `py.test`, and a wrote a test for getting the filename and a test for generating an xml file. 




![generateXml Code](https://user-images.githubusercontent.com/56204136/124322639-a8b2bb00-db34-11eb-81d9-cdc7e5f66256.png)
Generate XML Code


