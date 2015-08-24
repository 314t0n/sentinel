#!/usr/bin/env python
# -*- coding: utf-8 -*-
# 
import ctypes
import os
import platform
import sys
import cv2
import operator
import time

""" Oprendszeren végzett feladatok """
class System(object):
	free_bytes = 0
	""" Kép mentése fájlba """
	@staticmethod
	def write_img(img, timestamp, prefix = 'log'):		
		img_size = sys.getsizeof(img)		
		# remove first if necesseary
		if System.free_bytes < 10*img_size:
			os.remove('log/images/' + System.get_oldest_file('log/images/'))
		# save
		cv2.imwrite('log/images/' + prefix + '_' + timestamp + '.jpg', img)	
	
	""" Legrégebbi fájl neve """
	@staticmethod
	def get_oldest_file(path):	
		# ordered by filename, where filename is date
	    dirList = os.listdir(path)
	    # first item is the oldest
	    return dirList[0]

	""" Összes terület/Szabad terület """
	@staticmethod
	def get_free_space_mb(folder): 		
	    if platform.system() == 'Windows':
	        free_bytes = ctypes.c_ulonglong(0)
	        total_bytes = ctypes.c_ulonglong(0)
	        f = ctypes.windll.kernel32.GetDiskFreeSpaceExW
	        f(ctypes.c_wchar_p(folder), None,  ctypes.pointer(total_bytes), ctypes.pointer(free_bytes))
	        System.free_bytes = free_bytes.value
	        return total_bytes.value/1024/1024, free_bytes.value/1024/1024
	    else:
	        st = os.statvfs(folder)
	        System.free_bytes = st.f_bavail * st.f_frsize
	        return (st.f_blocks * st.f_frsize)/1024/1024, (st.f_bavail * st.f_frsize)/1024/1024
