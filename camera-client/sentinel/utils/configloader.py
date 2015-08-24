#!/usr/bin/env python
# -*- coding: utf-8 -*-

import ConfigParser
import json
import os.path
from sentinel.model.sentinelobject import SentinelObject

def write_file(data, fileName):
    f = open(fileName, 'w')
    f.write(data)
    f.close()

def read_file(fileName):
    f = open(fileName, 'r')
    config = json.load(f)
    f.close()
    return config

""" Menthető konfig objektum """
class Config(SentinelObject):

    def __init__(self, config, fileName, env = 'dev'):
        self.config = config
        self.fileName = fileName
        self.env = env
    """   """
    def get_dictionary(self):
        return self.config
    """ adott kulcs értéke  """
    def get(self, key):     
        return self.config[key]
    """ Konfiguráció mentése fájlba  """
    def update(self):    
        data = read_file(self.fileName)
        data[self.env] = self.config
        write_file(json.dumps(data, sort_keys=True, indent=4, separators=(',', ': ')), self.fileName)

""" Konfiguráció betöltése """
class ConfigLoader(object):

    def __init__(self, fileName = 'config.json'):
        
        self.fileName = fileName

        if not os.path.isfile('config.json'):
            self.config = self.__set_defaults() 
        else:
            data = read_file(self.fileName)
            self.config = data

    """ alapértelmezett értékek """
    def __get_defaults(self):
        return {'id':'cam1', 'camera':'0', 'ip':'localhost', 'port':'3000', 'syslog':'system.log',
            'imagelog': {'status': False, 'storeImage': False, 'interval': 1, 'storeDays': 2},
            'motionDetect': {'status': False, 'storeImage': False,'history': 50,'nmixtures':50, 'ratio':1,  'sensitivy': 1,'threshold': 50, 'storeDays': 2,'sendEmail':True, 'showImg': True},  'resolution': { 'x': 320, 'y': 240 },
            }

    """ alapértelmezett értékek mentése fájlba """
    def __set_defaults(self):   
        d = {}
        d['dev'] = self.__get_defaults()     
        d['test'] = self.__get_defaults()     
        data =  json.dumps(d,  sort_keys=True, indent=4, separators=(',', ': '))

        write_file(data, self.fileName)

        return read_file(self.fileName) 

    """ Konfiguráció készítése """
    def get_config(self, env):
        return Config(self.config[env], self.fileName, env)