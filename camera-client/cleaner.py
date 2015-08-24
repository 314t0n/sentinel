#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import time
import sys
import json


def get_data(path):
    try:
        with open(path + 'config.json') as data_file:
            data = json.load(data_file)
        return data
    except IOError, e:
        print "Hiba, nem található az config.json fájl!"
        print str(e)
        sys.exit(1)


def get_env(path):
    try:
        f = open(path + 'env', 'r')
        return f.readline()
    except IOError, e:
        print "Hiba, nem található az env fájl!"
        print str(e)
        sys.exit(1)


def is_file_old_enough(f, now, days):
    if os.stat(f).st_mtime < now - 1 * days:
        return True
    return False


def get_days(data, env, key):
    try:
        return data[env][key]['storeDays']
    except KeyError, e:
        print "Hibas a config.json fájl!"
        print str(e)
        sys.exit(1)


def remove_file(path, f):
    if os.path.isfile(f):
        os.remove(f)
        # os.remove(os.path.join(path, f))

syspath = '/home/pi/camera-client/'
logpath = 'log/images/'
sys.path.append(syspath)
env = get_env(syspath)
data = get_data(syspath)
imagelogDays = get_days(data, env, 'imagelog')
motionDetectDays = get_days(data, env, 'motionDetect')
now = time.time()
deletedImgLog = 0
deletedMDLog = 0

path = syspath + logpath

for f in os.listdir(path):

    f = os.path.join(path, f)

    fragments = f.split('.')
    extension = fragments[len(fragments) - 1]

    days = imagelogDays

    if fragments[0].startswith(path + 'log_'):
        days = imagelogDays
        deletedImgLog += 1
    elif fragments[0].startswith(path + 'md_'):
        days = motionDetectDays
        deletedMDLog += 1
    else:
        continue

    if extension != 'jpg':
        continue

    if is_file_old_enough(f, now, days):
        remove_file(path, f)


print "Deleted #Imagelog: ", deletedImgLog
print "Deleted #MotionDetectlog: ", deletedMDLog
