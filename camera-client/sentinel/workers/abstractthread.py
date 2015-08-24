#!/usr/bin/env python
# -*- coding: utf-8 -*-

from abc import ABCMeta, abstractmethod
from sentinel.utils.system import System
import threading
import sys
""" Szünteltethető szál """
class AbstractThread(threading.Thread):
    __metaclass__ = ABCMeta

    def __init__(self, camera, socketService):
        threading.Thread.__init__(self)
        self.paused = True
        self.state = threading.Condition()
        self.camera = camera
        self.isRun = True
        self.socketService = socketService

    """ socket kapcsolat indítása """
    def init(self):
        self.socketService.start() 
        try:
            self.socket = self.socketService.get_socket()
        except:
            self.socket = None    

    """ szál ciklus """
    def run(self):
        while self.isRun:
            # self.logger.debug(self.state)
            with self.state:
                if self.paused:
                    self.state.wait()           
              
            self.run_action()   

    """ szál leállítása """           
    def stop(self):
        self.logger.debug("Stopping thread.")
        self.isRun = False

    """ szál újraindítása """
    def resume(self):       
        with self.state:
            self.paused = False
            self.resume_action()
            self.state.notify()

    """ szál szünteltetése """
    def pause(self):
        with self.state:
            self.paused = True
            self.pause_action()

    """ tárhely méret küldése a szervernek """    
    def send_space_data(self):
        space_data = System.get_free_space_mb('.')
        self.socketService.get_socket().emit('freespace', {
            'total': space_data[0],
            'free': space_data[1]
        })

    @abstractmethod
    def run_action(self):
        pass

    @abstractmethod
    def pause_action(self):
        pass

    @abstractmethod
    def resume_action(self):
        pass
