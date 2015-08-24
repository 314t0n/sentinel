#!/usr/bin/env python
# -*- coding: utf-8 -*-

from sentinel.model.sentinelobject import SentinelObject
import threading
import time
import socketservice
import threading

import ctypes
import os
import platform
import sys

from sentinel.utils.system import System
from sentinel.model.sentinelobject import SentinelObject
from socketservice import SocketService
from socketIO_client import SocketIO, BaseNamespace
from random import randint
""" Szervertől érkező parancsok kezelése """
class CommandService(threading.Thread, SentinelObject):

    def __init__(self, sentinel, socketService, config):
        threading.Thread.__init__(self)

        self.config = config                # Config adatok
        self.socketService = socketService  # camera socket
        self.sentinel = sentinel            # 
        self._stop = threading.Event()      # leállításhoz
        self.isRun = True                   # fut-
        # worker command handlers

        self.__register_system_commands()

    """ események regisztrálása """       
    def __register_system_commands(self):

        commands = self.socketService.commands

        commands['stream'] = self.stream_command
        # commands['imagelog'] = self.imagelog_command
        commands['system:config'] = self.__set_config
        commands['system:config:batch'] = self.__set_config_batch
        commands['system:shutdown'] = self.__shutdown_process
        commands['system:freespace'] = self.__freespace  

    """ socket init """
    def init(self):   
        self.socket = self.socketService.__init_socket()
        self.socket = self.socketService.get_socket()

        socketService.start()
        socketService.join()

    """ implements Thread """
    def run(self):
        self.logger.info("****************")
        self.logger.info("*CommandService*")
        self.logger.info("****************")

    """  """
    def stop(self):
        self.logger.info("*CommandService stop.*")
        self._stop.set()

    """ szabad terület küldése a szervernek """
    def __freespace(self):
        self.logger.debug("freespace")
        space_data = System.get_free_space_mb('.')
        self.socketService.get_socket().emit('freespace', {
            'total': space_data[0],
            'free': space_data[1]
            })

    """ egy adott konfiguráció módosítása """
    def __set_config(self, param, save = True):
        # hiearchy
        keys = param['name'].split('.')
        # actual key
        last_key = keys[len(keys)-1]   
        #iterating to the actual key
        self.__set_json_value(self.config.get_dictionary(), keys, last_key, param['value'])
        # update config.json
        if save:
            self.config.update()
        if keys[0] == 'imagelog':
            if keys[1] == 'status':
                self.logger.debug("Imagelog switch. [%r]" % param['value'])
                self.sentinel.switch_imagelog(param['value'])
        if keys[0] == 'motionDetect':
            if keys[1] == 'status':
                self.logger.debug("Motion Detect switch. [%r]" % param['value'])
                self.sentinel.switch_mdetect(param['value'])

    """ összes konfiguráció módosítása """
    def __set_config_batch(self, param):
        self.logger.debug('*** Sync Config ***')       
        data = param['data']
        for config in data:            
            self.__set_config(config, False)
        self.config.update()

    """ adott szótárban megkeresi a kulcsot és beállítja az adott értéket """
    def __set_json_value(self, dictionary, keys, key, value):
        # print dictionary
        for k, v in dictionary.iteritems():
            # print k, v
            if k == key:
                dictionary[k] = value
            elif k in keys:
                self.__set_json_value(v, keys, key, value)

    """ eszköz leállítása """
    def __shutdown_process(self):        
        self.sentinel.stop_service()
        self.socketService.get_socketIO().disconnect()
        self.socketService.disconnect()
        self.stop()
        self.isRun = False
        self.logger.info(".------------------.")
        self.logger.info("| System shutdown. |")
        self.logger.info(".------------------.")
        # force shutdown
        time.sleep(1)
        self.logger.info("Bye")
        os._exit(1)
    """ turn on/off streaming """
    def stream_command(self, param):        
        self.logger.debug("Stream switch.")        
        self.sentinel.switch_stream(param['value'])
    """ for testing only """        
    def motion_detector_show_img_command(self, param):
        self.sentinel.show_diff_img(param)