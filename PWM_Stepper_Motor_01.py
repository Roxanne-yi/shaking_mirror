# Based on: https://www.raspberrypi.org/forums/viewtopic.php?t=242928\.
#
# Software to drive 4 wire stepper motor using a TB6600 Driver
# PRi - RPi 3B
#
# Route 3.3 VDC to the controller "+" input for each: ENA, PUL, and DIR
#
# Connect GPIO pins as shown below) to the "-" input for each: ENA, PUL, and DIR
#
#
from time import sleep
import RPi.GPIO as GPIO
#
PUL = 17  # Stepper Drive Pulses
DIR = 27  # Controller Direction Bit (High for Controller default / LOW to Force a Direction Change).
ENA = 22  # Controller Enable Bit (High to Enable / LOW to Disable).
#
# 
GPIO.setmode(GPIO.BCM)
#
GPIO.setup(PUL, GPIO.OUT)
GPIO.setup(DIR, GPIO.OUT)
GPIO.setup(ENA, GPIO.OUT)
#
stepDelay = 0.0005 # pulse delay
turnDelay = 0.03 # fast 0.03 --mid  - slow 0.1
step = 50
#

# GPIO.output(ENA, GPIO.HIGH)

def turn(direction):
    GPIO.output(ENA, GPIO.HIGH)
    #
    # sleep(0.005)
    if (direction == True):
        GPIO.output(DIR, GPIO.LOW)
    else:
        GPIO.output(DIR, GPIO.HIGH)

    for x in range(step):
        GPIO.output(PUL, GPIO.HIGH)
        sleep(stepDelay)
        GPIO.output(PUL, GPIO.LOW)
        sleep(stepDelay)

    GPIO.output(ENA, GPIO.LOW)
    sleep(turnDelay) # pause for possible change direction
    return
#
    
if __name__ == '__main__':
    while True:
        turn(True)
        turn(False)
        turn(False)
        turn(True)
    # for x in range(50):
    #     step -= 1
    #     turnDelay += 0.005
    #     turn(True)
    #     turn(False)
    #     turn(False)
    #     turn(True)          
#
    GPIO.cleanup()
#

