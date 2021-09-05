import os
import vision
from msrest.authentication import CognitiveServicesCredentials
from azure.cognitiveservices.vision.computervision import ComputerVisionClient

cog_key = ""    #Key1
cog_endpoint = ""     #endpoint

computervision_client = ComputerVisionClient(cog_endpoint, CognitiveServicesCredentials(cog_key)) 

img_path = os.path.join('Img', 'ppl11.jpg')   #image-file path

features = ['Description', 'Tags', 'Adult', 'Objects', 'Faces']

img_stream = open(img_path, 'rb')

analysis = computervision_client.analyze_image_in_stream(img_stream, visual_features=features)

vision.show_image_analysis(img_path, analysis)