# Security Camera 
This will serve as a brief description of your project. Limit this to three sentences because it can become overly long at that point. This copy should draw the user in and make she/him want to read more.

| **Engineer** | **School** | **Area of Interest** | **Grade** |  
|:Siddharth Maddikayala:|:American High School:|:CS/AI:|:Incoming Freshman:|

# Second Milestone
My second milestone was finishing the AI model to detect faces and getting a livestream on the raspberrypi using the Picamera. I also added a keybind "p", which takes a picture and uploads it to nanonets for processing so I can draw the bounding boxes around the faces when I get a response. 

<iframe width="560" height="315" src="https://www.youtube.com/embed/RP1mWxEz4Vw" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  
# First Milestone

<iframe width="560" height="315" src="https://www.youtube.com/embed/waQt1IAPrvA" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>


![image](https://user-images.githubusercontent.com/56204136/124322639-a8b2bb00-db34-11eb-81d9-cdc7e5f66256.png)

My first milestone was pre-processing my dataset and getting it ready for training. The dataset I used came with a text file that showed where to place the bounding boxes. I wrote a small script that loops through the annotations text file and generates a xml file in the xml directory. This was fairly simple by using the `xml.etree.cElementTree` library in python. I just used the `addElement` fucntion to add elements to my xml variable and then I would just save the varaible contents to a file. I also wrote a few tests to make sure my code works after I make changes. I used the module `py.test`, and a wrote a test for getting the filename and a test for generating an xml file. 

