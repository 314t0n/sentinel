#!/usr/bin/env python
# -*- coding: utf-8 -*-

import time
import cv2
import textwrap
from sentinel.workers.abstractthread import *
from sentinel.model.sentinelobject import SentinelObject
from sentinel.services.socketservice import SocketService
from socketIO_client import SocketIO, BaseNamespace
from sentinel.utils.logger import *
""" Kép rögzítés stream-elés esetén """
class CapturerService(AbstractThread, SentinelObject):

    def __init__(self, camera):
        AbstractThread.__init__(self, camera, None)    
        self.fps = 10.0     # stream fps értéke
        self.chunks = []    # puffer

    """ szál leállítása """
    def stop(self):
        self.logger.debug("Stopping Stream Capturer thread...")
        self.isRun = False 

    """ init blokk felüldefiniálása, mivel socket nem tartozik a szálhoz """
    def init():
        pass

    """ puffer """
    def get_chunks(self):
        return self.chunks

    """ 
    kép berakása pufferbe
    minden képkocka végét end string jelzi
    így akár darabokban is lehetne küldeni a frame-t
    a tesztek alapján jobb egyben küldeni

    """
    def __add_to_chunks(self, frame):
        chunks = textwrap.wrap(frame, len(frame))         
        # chunks = textwrap.wrap(frame, 8192)         
        chunks.append('end')
        self.chunks.extend(chunks)

    """ kép készítés időbélyeggel """
    def __capture_frame_with_timestamp(self):
        timestamp = LogUtils.utc_datetime()
        frame_bin= self.camera.get_frame_as_raw()  
        self.camera.set_timestamp(frame_bin, str(timestamp.isoformat()))
        return self.camera.get_frame_as_jpg(frame_bin)

    """ kép készítés """
    def __capture_frame(self):
        self.camera.capture()           
        return self.camera.get_frame_as_jpg()

    """ szál futása közben végrehajtott műveletek """
    def run_action(self):          
        self.__chunks_stream()      

    """ képek pufferbe helyezése """
    def __chunks_stream(self):
        frame = self.__capture_frame()
        self.__add_to_chunks(frame)
        time.sleep(1.0/self.fps)  

    """ deprecated """      
    def __delta_time(self, start, stop):
        return (start-stop).total_seconds()

    """ szál újraindítása """
    def resume_action(self):
        self.logger.debug('Starting capture service')             
        self.start_time = datetime.datetime.now()  

    """ szál szünteltetése  """
    def pause_action(self):
        self.logger.debug('Pausing capture service')     
        self.chunks = []