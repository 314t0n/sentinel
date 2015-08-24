#!/usr/bin/env python
# -*- coding: utf-8 -*-

import cv2
import numpy as np
import base64
from sentinel.model.sentinelobject import SentinelObject

class Camera(SentinelObject):
    
    def __init__(self, camera_id, config, device_id = 0):
        self.device_id = device_id      # az eszköz azonosítója az operációs rendszeren, alapértelmezetten 0
    	self.camera_id = camera_id      # a kamera neve, pl.: Raspberry Pi 01 
        self.streamingMode = False      # stream üzemmód flag-je
        self.frame = None               # a legutoljára készített kép   
        self.camera = None              # az opencv által nyújtott capture szolgáltatás
        self.width = int(config['w'])   # kamera képének szélessége
        self.height = int(config['h'])  # kamera képének magassága
        self.opened = False

    def id(self):
        return self.camera_id

    def size(self):
        return self.width, self.height

    """ kamera létrehozása """
    def open(self):
        self.logger.debug('Camera opened.')
        if self.camera is None:
            self.camera = cv2.VideoCapture(self.device_id)   
            self.camera.set(3, self.width) 
            self.camera.set(4, self.height) 
            self.opened = True

    """ kamera „elengedése”, lock feloldása az op.rendszeren """        
    def release(self):
        self.logger.debug('Camera released.')
        if self.camera is not None:
            self.camera.release()    

    """ kép készítése """
    def capture(self):        
        err, self.frame = self.camera.read()

    """ streaming mode beállítása """
    def set_streaming_mode(self, mode):
        self.streamingMode = mode

    """ kamera létrehozása """
    def is_frame_empty(self):
        if self.frame is None:
            return True
        return False       
        
    """ időbélyeg elhelyezése az adott frame-en """
    def set_timestamp(self, frame, timestamp):
        cv2.putText(frame, timestamp, (20, 20), cv2.FONT_HERSHEY_PLAIN, 1.0, (249,255,52), thickness=1, lineType=cv2.CV_AA)

    """ a legutóbb készült kép nyers formában """
    def get_frame_as_raw(self):
        self.handle_streaming_mode()         
        return self.frame

    """ loggoláshoz a kép, nyersen a fájlba íráshoz és base64-ként a szervernek """
    def get_frame_for_logging(self, quality = 90):  
        self.handle_streaming_mode() 

        encode_param=[int(cv2.IMWRITE_JPEG_QUALITY), quality]
        result, imgencode = cv2.imencode('.jpg', self.frame, encode_param) 
        return self.frame, base64.encodestring(imgencode)

    """ a kép jpg-é konvertálva, bináris formában """
    def get_frame_as_jpg_binary(self, quality = 90):     

        self.handle_streaming_mode() 

        encode_param=[int(cv2.IMWRITE_JPEG_QUALITY), quality]
        result, imgencode = cv2.imencode('.jpg', self.frame, encode_param) 
        return np.array(imgencode)

    """ a kép jpg-é konvertálva, base64 formában """
    def get_frame_as_jpg(self, preprocessed_frame = None, quality = 90):     

        self.handle_streaming_mode() 

        frame = self.frame
        
        encode_param=[int(cv2.IMWRITE_JPEG_QUALITY), quality]
    	result, imgencode = cv2.imencode('.jpg', frame, encode_param) 
    	return base64.encodestring(imgencode)
        
    """ streaming mode esetén nem készít képet, egyébként igen """
    def handle_streaming_mode(self):
        #and not (self.frame is not None)
        if not self.streamingMode:
            self.capture()
   
