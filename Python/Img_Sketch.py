import cv2

#reading image
image = cv2.imread("data\Demon_Slayer.jpg")

#converting BGR image to grayscale
gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

'''
Invert the grayscale image also called the negative image, this will be our inverted grayscale image. 
Inversion is basically used to enhance details.
'''

#image inversion
inverted_image = 255 - gray_image
'''
Finally create the pencil sketch by mixing the grayscale image with the inverted blurry image. 
This is done by dividing the grayscale image by the inverted blurry image.
'''

blurred = cv2.GaussianBlur(inverted_image, (21, 21), 0)
inverted_blurred = 255 - blurred
pencil_sketch = cv2.divide(gray_image, inverted_blurred, scale=256.0)

#We now got our pencil_sketch. So, display it using OpenCV.
cv2.imshow("Original Image", image)
cv2.imshow("Pencil Sketch of Dog", pencil_sketch)
cv2.waitKey(0)