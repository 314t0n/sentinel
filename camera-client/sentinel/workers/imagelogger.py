#!/usr/bin/env python
# -*- coding: utf-8 -*-

import logging
import sys
import time
import datetime
import cv2
import websocket

from sentinel.utils.system import System
from socketIO_client import ConnectionError
from sentinel.workers.abstractthread import *
from sentinel.model.sentinelobject import SentinelObject
from sentinel.utils.logger import *

# @TODO image path from config

import traceback

class ImageLogger(AbstractThread, SentinelObject):

    def __init__(self, camera, deltaTime, socketService, config):
        AbstractThread.__init__(self, camera, socketService)
        self.config = config
        self.camera = camera
        self.socketService = socketService
        # self.socket = socketService.get_socket()
        self.deltaTime = deltaTime
        self.socketService.uname = "Imagelog"
        self.initFrames = 10
        self.initCounter = 0

    def set_delta(self, deltaTime):
        self.deltaTime = deltaTime

    def __write_log(self, frame, timestamp):       
        System.write_img(frame, timestamp)

    def stop(self):
        self.logger.debug("Stopping ImageLogger thread.")
        self.isRun = False
        self.logger.debug("ImageLogger socket disconnecting...")
        self.socketService.get_socket().disconnect()
        self.socketService.disconnect()

    def run_action(self):

        if self.initFrames > self.initCounter:
            self.initCounter += 1
            time.sleep(float(self.config['interval'])) 
            return

        self.logger.debug("Writing Image Log")
        
        formatedTimestamp = LogUtils.log_timestamp()

        timestamp = LogUtils.utc_datetime()
 
        frame_bin, frame_b64 = self.camera.get_frame_for_logging()

        # self.__timestamp_handler(frame_bin, timestamp)

        self.__send_frame_to_server_handler(frame_b64, timestamp)

        self.__store_img_handler(frame_bin, formatedTimestamp)

        time.sleep(float(self.config['interval']))        
        
    def __timestamp_handler(self, frame, timestamp):
        if self.config['timestamp']:
            self.camera.set_timestamp(frame, str(timestamp.isoformat()))

    def __store_img_handler(self, frame, timestamp):
        if self.config['storeImage']:
            self.__write_log(frame, timestamp)
            self.send_space_data()

    def __send_frame_to_server_handler(self, frame, timestamp):

        try:
            # if self.socketService.get_socket() is not None and self.socketService.get_socket().is_connected():
            if self.socketService.get_socket() is not None:
                self.socketService.get_socket().emit("imagelog", {
                    "id": self.camera.id(),
                    "date": timestamp.isoformat(),
                    "image": frame
                })

        except websocket.WebSocketConnectionClosedException:
            self.logger.warn("Failed to send image")
        except ConnectionError:
            self.logger.warn("Failed to send image")

    def pause_action(self):
        self.logger.debug("Pausing Image Log")
        # debug
        # for line in traceback.format_stack():
        #     print line.strip()

    def resume_action(self):      
        self.logger.debug("Starting Image Log")
        self.camera.open()
