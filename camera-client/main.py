#!/usr/bin/env python
# -*- coding: utf-8 -*-
# 
# :: Imports ::
import logging
import sys
import cv2
import sys, os

# :: Sentinel modules ::

from sentinel.services.sentinelservice import *
from sentinel.services.commandservice import *
from sentinel.workers.imagelogger import *
from sentinel.workers.stream_capturer import *
from sentinel.workers.streamer import *
from sentinel.workers.motiondetector import *
from sentinel.utils.configloader import *
from sentinel.model.camera import *
from sentinel.utils.logger import *


def getserial():
  # Extract serial from cpuinfo file
  cpuserial = "0000000000000000"
  try:
    f = open('/proc/cpuinfo','r')
    for line in f:
      if line[0:6]=='Serial':
        cpuserial = line[10:26]
    f.close()
  except:
    cpuserial = "ERROR000000000"

  return cpuserial

# :: Main Config :: 

f 					= open('env', 'r')
env 				= f.readline()
config 				= ConfigLoader().get_config(env)

camera_id 			= config.get('id')
ip 					= config.get('ip')
port 				= int(config.get('port'))
imageLogInterval 	= float(config.get('imagelog')['interval'])
camera_device_id 	= int(config.get('camera'))
camera_config 		= config.get('resolution')
serial 				= getserial()
print serial

# dependencies

camera 				= Camera(camera_id, camera_config, camera_device_id)

# sockets

streamSocket 		= SocketService({'socket-id':'/stream', 'ip':ip, 'port':port, 'camera-id':camera_id, 'token': serial})

motionDetectSocket 	= SocketService({'socket-id':'/motion-detect', 'ip':ip, 'port':port, 'camera-id':camera_id, 'token': serial})

cameraSocket 		= SocketService({'socket-id':'/camera', 'ip':ip, 'port':port, 'camera-id':camera_id, 'token': serial})

# workers

motion_detector 	= MotionDetector(camera, motionDetectSocket, config.get('motionDetect'))

capturerService 	= CapturerService(camera)

streamer 			= Streamer(camera, streamSocket, capturerService)

image_logger 		= ImageLogger(camera, imageLogInterval, cameraSocket, config.get('imagelog'))

options = {}
options['streamer'] = streamer
options['imagelog'] = image_logger
options['mdetect'] 	= motion_detector
options['camera'] 	= camera
options['capture'] 	= capturerService

# services

sentinel_service 	= SentinelService(options, config)
command_service 	= CommandService(sentinel_service, cameraSocket, config)

# :: Main :: 

# itt kell elinditani a socketeket, kulonben blockkolnak a worker szalakat

if __name__ == '__main__': 	
	try:
		command_service.setDaemon(True)
		command_service.start()	
		
		# streamSocket.start()	
		# cameraSocket.start()	
		# motionDetectSocket.start()	

		# nem szal, csak elinditja a worker szalakat
		sentinel_service.start_service()	
		
		command_service.join()

		streamSocket.join()
		cameraSocket.join()
		motionDetectSocket.join()

		print " --- - - - done - - - --- "
	except KeyboardInterrupt:		
	    print 'Interrupted, exiting.'
	finally:
		print "release"
		camera.release()	
		capturerService.start()	
		capturerService.join()

