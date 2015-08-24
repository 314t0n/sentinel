#!/usr/bin/env python
# -*- coding: utf-8 -*-

import time
import textwrap
from sentinel.workers.abstractthread import *
from sentinel.model.sentinelobject import SentinelObject
from sentinel.services.socketservice import SocketService
from socketIO_client import SocketIO, BaseNamespace
from sentinel.utils.logger import *
""" Streamer szál """
class Streamer(AbstractThread, SentinelObject):

    def __init__(self, camera, socketService, captureService):
        AbstractThread.__init__(self, camera, socketService)
        #a service blokkol egy szalat, de ezt nem        
        self.socketService = socketService      # socket 
        self.captureService = captureService    # pufferelő szál
        self.camera = camera                    # kamera           
        self.chunks = []                        # puffer
        self.fps = 10.0                         # stream fps
        self.minimalPufferSize = 2              # pufferbe legalább ennyi kép legyen

    """ szál leállítása """        
    def stop(self):
        self.logger.debug("Stopping Streamer thread...")
        self.isRun = False
        self.logger.debug("Streamer socket disconnecting...")
        self.socketService.get_socket().disconnect()
        self.socketService.disconnect()   

    """ puffer küldése a szervernek """     
    def run_action(self):  
        if len(self.captureService.get_chunks()) > self.minimalPufferSize:
            self.init_chunks = True

        if self.init_chunks:
            while len(self.captureService.get_chunks()) > 0:
                if self.socketService.get_socket() is not None:     
                    chunk = self.captureService.get_chunks().pop(0)                        
                    self.socketService.send('stream:chunk', chunk)   
                    self.logger.debug('Streaming ...')   
            time.sleep(1.0 / self.fps)  
            self.logger.debug('Stream waits')      

    """ szál újraindítása """     
    def resume_action(self):
        self.logger.debug('Starting stream')            
        self.camera.set_streaming_mode(True)
        self.camera.open()
        self.start_time = datetime.datetime.now()  
        self.init_chunks = False
        self.counter = 0

        if self.camera.is_frame_empty():
            self.camera.capture() 

    """ szál szünteltetése """     
    def pause_action(self):
        self.logger.debug('Pausing stream') 
        self.camera.set_streaming_mode(False)
        self.captureService.pause()
        self.chunks = []     

    """ deprecated """           
    def __delta_time(self, start, stop):
        return (start-stop).total_seconds()
    """ deprecated """     
    def __simple_stream(self):       
        self.socketService.get_socket().emit('stream', self.__capture_frame())  
        time.sleep(1.0 / self.fps)   
    """ deprecated """     
    def __add_to_chunks(self, frame):
        chunks = textwrap.wrap(frame, 2*8192)
        chunks.append('end')
        self.chunks.extend(chunks)
        self.counter+=1 + len(chunks)
    """ deprecated """     
    def __capture_frame_with_timestamp(self):
        timestamp = LogUtils.utc_datetime()
        frame_bin= self.camera.get_frame_as_raw()  
        self.camera.set_timestamp(frame_bin, str(timestamp.isoformat()))
        return self.camera.get_frame_as_jpg(frame_bin)
    """  deprecated """     
    def __capture_frame(self):
        self.camera.capture()           
        return self.camera.get_frame_as_jpg_binary()
    """ deprecated """     
    def __stream_frames(self):
        self.logger.debug("__stream_frames") 
        if len(self.chunks) > 0:
            self.logger.debug("remove chunk") 
            chunk = self.chunks.pop(0)
            self.counter-=1
            self.socketService.send('stream:chunk', chunk)    
    """ deprecated """     
    def __debug_stream(self):  
        self.logger.debug("counter merete") 
        self.logger.debug(self.counter) 
        self.logger.debug("chunks merete") 
        self.logger.debug(len(self.chunks)) 
    """ deprecated """     
    def __chunks_stream(self):
        
        self.__debug_stream()

        self.current_time = datetime.datetime.now() 

        delta = self.__delta_time(self.current_time, self.start_time)      

        self.logger.debug(self.current_time)
        self.logger.debug("----")
        self.logger.debug(float(delta))
        self.logger.debug("----")
        self.logger.debug(float(1.0 / self.fps))
        self.logger.debug("----")

        if float(delta) >= float(1.0 / self.fps):                       
            self.__add_to_chunks(self.__capture_frame())
            self.start_time  = datetime.datetime.now()  
            self.logger.debug('frame save ###')          
        
        if self.socketService.get_socket() is not None:     
            self.__stream_frames()  
            self.logger.debug('frame stream') 