#!/usr/bin/env python
# -*- coding: utf-8 -*-

import threading
import time
import websocket

from sentinel.model.sentinelobject import SentinelObject
from socketIO_client import SocketIO, BaseNamespace,SocketIONamespace, LoggingNamespace, find_callback, ConnectionError
import jwt
from random import randint
import os

class SocketServiceNamespace(SocketIONamespace):

    def initialize(self):        
        self.connected = True
        self.name = "None"  

    def on_event(self, event, *args):  
        self.on('on_disconnect', disconnect)

    def is_connected(self):
        return self.connected
    
    def set_name(self, name):
        self.name = name

class SocketService(threading.Thread, SentinelObject):

    def __init__(self, options, pingTimeout=1):
        threading.Thread.__init__(self)

        self.static_token = options['token']
        self.options = options  # saved for reconnect
        # self.__init_socket()
        self.commands = {}  # this will hold the possible commands from server
        self._stop = threading.Event()  # for stopping the thread, testing
        self.socket = None    
        self.socketIO = None  
    """  """
    def init(self):
        self.__init_socket()
    """  """
    def __init_socket(self):       
        token = jwt.encode({"name": self.options["camera-id"]}, 'secret')

        ip      = self.options["ip"]
        port    = self.options["port"]
        socket  = self.options["socket-id"]
        camera  = self.options["camera-id"] 

        self.socketIO   = SocketIO(ip, port,  params={'id': camera, 'token': token})      
        self.socket     = self.socketIO.define(SocketServiceNamespace, socket)
        self.logger.debug("Init socket: [%s]" % socket)   
    """  """
    def get_socket(self):
        return self.socket
    """  """
    def get_socketIO(self):
        return self.socketIO
    """  """
    def __apply_command(self, command, param=None):
        if command in self.commands:
            if param is None:
                self.commands[command]()
            else:
                self.commands[command](param)
    """  """
    def __handle_server_message(self, message):
        self.logger.debug("[%s] handle_server_message" % self.options["socket-id"])
        # todo key check
        self.logger.debug(message)
        if 'command' not in message:
            self.logger.error("Missing command key.")
            self.logger.error(message)
        else:
            print len(message)
            if len(message) < 2:
                self.__apply_command(message['command'])
            else:
                self.__apply_command(message['command'], message)
    """  """
    def disconnect(self):
        self.socketIO.disconnect(self.options["socket-id"])         
        # try:
        #     self.socketIO.disconnect(self.options["socket-id"])           
        # except  ConnectionError:
        #     self.logger.error(self.options["socket-id"] + " connection error")  
    """  """
    def send(self, id, msg):     
        try:
            self.connection_handler()
            self.socket.emit(id, msg)          
        except websocket.WebSocketConnectionClosedException:
            self.logger.debug("[%s] reconnecting ..." % self.options["socket-id"]) 
        except AttributeError, IndexError:
            self.logger.debug('Hiba történt az üzenet küldésekor')
        except ConnectionError:
            self.logger.debug('Kapcsolati hiba')
            self.__init_socket()
            self.socket.on(self.options["camera-id"], self.__handle_server_message)    
    """  """
    def connection_handler(self):  
        while self.socket is None:
            self.logger.debug("Socket [%s] closed -> retry." % self.options["socket-id"])   
            time.sleep(1.0 / 5.0)                         
    """ for testing """
    def __reconnect(self):
        self.logger.error("[%s] reconnecting ..." % self.options["socket-id"])
        self.disconnect()     
        self.__init_socket()
        self.socket.on(self.options["camera-id"], self.__handle_server_message)    
    """  """
    def socket_wait(self):
        try:       
            if self.socketIO.connected:
                self.logger.debug("[%s] waiting ..." % self.options["socket-id"])
                self.socketIO.wait()     
        except ConnectionError, UnicodeDecodeError:         
            # for testing  
            self.__reconnect()       
            self.socket_wait()      
    """  """
    def run(self):
        self.__init_socket()  
        self.socket.on(self.options["camera-id"], self.__handle_server_message)  
        self.socket_wait() 
        self.__shutdown()
    """  """
    def __shutdown(self):
        time.sleep(2)
        self.socket = None
        self.socketIO = None
        self.logger.info("***************")
        self.logger.info("I'm done: [%s]." % self.options["socket-id"])
        self.logger.info("***************")