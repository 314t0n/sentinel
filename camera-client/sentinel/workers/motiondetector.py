#!/usr/bin/env python
# -*- coding: utf-8 -*-

import time
import cv2
import datetime
import numpy as np
from sentinel.utils.system import System
from sentinel.workers.abstractthread import *
from sentinel.model.sentinelobject import SentinelObject
from sentinel.services.socketservice import SocketService
from socketIO_client import SocketIO, BaseNamespace
from sentinel.utils.logger import *
""" Mozgásérzkelést végző szál """
class MotionDetector(AbstractThread, SentinelObject):

    def __init__(self, camera, socketService, config):
        AbstractThread.__init__(self, camera, socketService)
        self.config = config                                # beállítások   
        self.camera = camera                                # kamera
        self.fps = 10.0                                     # kép készítés gyakorisága
        self.initFrames = 30                                # ennyi frame-t kihagyunk induláskor
        self.initFramesCounter = 0                          # segédváltozó az initFrames-hez 
        self.lastTime = datetime.datetime.now()             # legutolsó vizsgálat ideje    
        self.set_mask()                                     # mozgásérzékelést végző maszk létrehozása
        self.logger.debug("[MotionDetector] init.")    

    """ mozgásérzkelést végző maszk létrehozása """
    def set_mask(self):
        self.fmask = cv2.BackgroundSubtractorMOG2(
            history = int(self.config['MOGhistory']),
            varThreshold=20,
            bShadowDetection=0)

    """ szál leállítása """       
    def stop(self):
        self.logger.debug("[MotionDetector] stops.")
        self.isRun = False
        self.logger.debug("[MotionDetector] socket disconnecting.")
        self.socketService.get_socket().disconnect()
        self.socketService.disconnect()

    """ kép készítés és maszk alkalmazása """
    # Gaussian Mixture-based Background/Foreground Segmentation Algorithm.
    def get_masked_frame(self):
        frame = self.camera.get_frame_as_raw()
        return self.fmask.apply(frame, learningRate=1.0 / int(self.config['MOGhistory']))

    """ mozgásérzékelés """
    def run_action(self):
        # handling closed socket
        # self.socketService.connection_handler()
        # init block
        if self.initFramesCounter < self.initFrames:
            self.initFramesCounter+=1
            self.get_masked_frame()
            time.sleep(1.0 / self.fps)  
            self.logger.debug("[MotionDetector] init.")        
            return            
           
        self.currentTime = datetime.datetime.now()

        frame = self.get_masked_frame() 
        # edge finding
        kernel = np.ones((5,5),np.uint8)
        frame = cv2.morphologyEx(frame, cv2.MORPH_OPEN, kernel)
        self.__motion_detect(frame) 
        self.__show_img(frame)

        time.sleep(1.0 / self.fps)
        # cv2.waitKey(1000 / self.fps)
  
    """ teszt funkció, maszkolt kép mutatása grafikus ablakban """      
    def __show_img(self, frame):
        if self.config['showImg']:
            cv2.imshow("differential image", frame)
            cv2.waitKey(1)

    """ két érzékelést között eltelt idő vizsgálata """
    def __check_sensitivy(self):
        return self.deltaTime(self.currentTime, self.lastTime) >= float(self.config['sensitivy'])

    """ threshold vizsgálata """
    def __check_threshold(self, frame):
        return cv2.countNonZero(frame) > float(self.config['threshold'])

    """ mozgásérzékelés kezelése """
    def __motion_detect(self, frame):

        if self.__check_sensitivy():

            if self.__check_threshold(frame):

                self.log_very_large_message('----------== Motion Detected! ==----------', 5)    

                self.lastTime   = datetime.datetime.now()   

                log_frame, base64_frame   = self.camera.get_frame_for_logging()                    

                self.__notify_server_handler(base64_frame)
            
                self.__store_image_handler(log_frame) 

    """ szerver értesítése """
    def __notify_server_handler(self, frame):
        if self.socketService.get_socket() is not None:
                    self.socketService.send('motiondetect', {'message': "motion:detect", 'date': LogUtils.utc_datetime(
                    ).isoformat(), 'image': frame})
    """ kép tárolása """
    def __store_image_handler(self, frame):
        if self.config['storeImage']:
            formatedTimestamp = LogUtils.log_timestamp()
            System.write_img(frame, formatedTimestamp, 'md_')         
    """ két időbélyeg távolsága ms  """
    def deltaTime(self, current, last):
        return (current - last).total_seconds()
  
    """ szál újraindítása """
    def resume_action(self):
        self.logger.debug("[MotionDetector] resume.")
        self.set_mask()
        if not self.camera.opened:
            self.camera.open()  
            self.initFrames = 30 +  int(self.config['MOGhistory'])  
        else:
            self.initFrames = 10 + int(self.config['MOGhistory']) 
        self.initFramesCounter = 0

    """ szál szünteteltetése """
    def pause_action(self):
        self.logger.debug("[MotionDetector] pause.")      

    """ észrevehető log üzenet """
    def log_very_large_message(self, msg, how_large = 20):
        for i in range(1,how_large):
            self.logger.debug(msg)
