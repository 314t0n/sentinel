#!/usr/bin/env python
# -*- coding: utf-8 -*-

import logging
import sys
import time
import datetime

""" Logger factory """
class SimpleLogger(object):

    @staticmethod
    def getLogger(level):

        logger = logging.getLogger()
        logger.setLevel(level)

        ch = logging.StreamHandler(sys.stdout)
        # ch = logging.FileHandler('sys.log')
        ch.setLevel(level)
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        ch.setFormatter(formatter)
        logger.addHandler(ch)

        return logger

timeformat = "%Y_%m_%d_%H%M%S"

""" Utils """
class LogUtils():

    @staticmethod
    def timestamp(timestamp):
        return time.strftime(timeformat, timestamp)

    @staticmethod
    def localtime():
        return time.localtime()

    @staticmethod
    def log_timestamp():
        return LogUtils.timestamp(time.localtime())

    @staticmethod
    def utc_datetime():
        return datetime.datetime.utcnow()
        return datetime.datetime.now()

    @staticmethod
    def convert_to_utc(timestamp):
        return time.strftime("%Y-%m-%d %H:%M:%S",
                             time.gmtime(time.mktime(time.strptime(timestamp,
                                                                   timeformat))))
