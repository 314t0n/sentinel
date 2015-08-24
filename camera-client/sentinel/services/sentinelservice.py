#!/usr/bin/env python
# -*- coding: utf-8 -*-
# 
from sentinel.model.sentinelobject import SentinelObject

class SentinelService(SentinelObject):

    def __init__(self, options, config):
        self.config = config
        self.streamer = options.get('streamer')
        self.imagelog = options.get('imagelog')        
        self.mdetect = options.get('mdetect')        
        self.camera = options.get('camera')        
        self.capture = options.get('capture')   
        self.streamClients = 0     
    """ elindítja az összes szálat és lefoglalja a kamerát  """
    def start_service(self):
        self.logger.info('Starting service.')      

        self.camera.open()

        self.streamer.init()
        self.imagelog.init()    
        self.mdetect.init()       

        self.streamer.setDaemon(True)
        self.imagelog.setDaemon(True) 
        self.mdetect.setDaemon(True) 
        self.capture.setDaemon(True) 

        self.logger.debug('Service initialized.')    

        self.streamer.start()
        self.imagelog.start()    
        self.mdetect.start() 
        self.capture.start()

        if(self.config.get('motionDetect')['status']):
            self.mdetect.resume()   

        if(self.config.get('imagelog')['status']):
            self.imagelog.resume()         

        self.logger.debug('Service running.')

        self.streamer.join()
        self.imagelog.join()  
        self.mdetect.join()  
        self.capture.join()  
        return self   
    """ szálak leállítása, kamera elengedése """
    def stop_service(self):  
        self.streamer.stop()
        self.imagelog.stop()
        self.mdetect.stop()
        self.camera.release()
    """ stream indítása/leállítása, leállítás, 
    csak ha streamClients nem nagyobb mint 0 """
    def switch_stream(self, param):      
 
        if param is True:
            self.streamClients+=1
            self.streamer.resume()
            self.capture.resume() 
        else:
            self.streamClients-=1
            if not (self.streamClients > 0):
                self.streamer.pause()
                self.capture.pause() 
    """ naplózás ki/be """
    def switch_imagelog(self, param): 
        if param is True:
            self.imagelog.resume()
        else:
            self.imagelog.pause()
    """ mozgás érzékelés ki/be """
    def switch_mdetect(self, param):            
        if param is True:
            self.mdetect.resume()
        else:
            self.mdetect.pause()
    """ for testing only """
    def show_diff_img(self, param):
        if param is True:
            self.mdetect.show_img(True)
        else:
            self.mdetect.show_img(False)