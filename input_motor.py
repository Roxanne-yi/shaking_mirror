#Libraries
import RPi.GPIO as GPIO
import time
import socketio

# standard Python
sio = socketio.Client()

@sio.event
def connect():
    print("I'm connected!")

@sio.event
def connect_error(data):
    print("The connection failed!")

@sio.event
def disconnect():
    print("I'm disconnected!")

@sio.event
def message(data):
    print('I received a message!')

sio.connect('http://localhost:8080')
print 'my sid is', sio.sid

#GPIO Mode (BOARD / BCM) BCM for GPIO
GPIO.setmode(GPIO.BCM)

#set GPIO Pins
TRIG = 23
ECHO = 24
# i=0
#
PUL = 17  # Stepper Drive Pulses
DIR = 27  # Controller Direction Bit (High for Controller default / LOW to Force a Direction Change).
ENA = 22  # Controller Enable Bit (High to Enable / LOW to Disable).
#
#
GPIO.setup(PUL, GPIO.OUT)
GPIO.setup(DIR, GPIO.OUT)
GPIO.setup(ENA, GPIO.OUT)
#

#set GPIO direction (IN / OUT)
GPIO.setup(TRIG,GPIO.OUT)
GPIO.setup(ECHO,GPIO.IN)

stepDelay = 0.0005 # pulse delay
turnDelay = 0.03 # fast 0.03 --mid  - slow 0.1
step = 50
distTresh = 30
peopleFLag = False
#

GPIO.output(TRIG, False)
print "Calibrating....."
time.sleep(2)

print "Start......"

def distance():
    # set Trigger to HIGH, after 0.01ms to LOW
    GPIO.output(TRIG, True)
    time.sleep(0.00001)
    GPIO.output(TRIG, False)

    while GPIO.input(ECHO)==0:
        pulse_start = time.time()
    while GPIO.input(ECHO)==1:
        pulse_end = time.time()
    
    # time difference between start and arrival
    pulse_duration = pulse_end - pulse_start

    distance = pulse_duration * 17150

    distance = round(distance+1.15, 2)

    if distance < distTresh:
        peopleFLag = True
    else:
        peopleFLag = False


    return distance

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
        time.sleep(stepDelay)
        GPIO.output(PUL, GPIO.LOW)
        time.sleep(stepDelay)

    GPIO.output(ENA, GPIO.LOW)
    time.sleep(turnDelay) # pause for possible change direction
    return
#

if __name__ == '__main__':
    try:
        while True:
            dist = distance()
            if peopleFLag == True:
                if step < 1:
                    step = 50
                step -= 1
                turnDelay += 0.005
            elif peopleFLag == False:
                if turnDelay < 0.02:
                    turnDelay = 0.1
                step += 1
                turnDelay -= 0.005
            turn(True)
            turn(False)
            turn(False)
            turn(True)

            sio.emit('test_python', {'turnDelay': str(turnDelay)})
            print "Measured Distance = %.1f cm" % dist
        
            time.sleep(.00001)
            
 
        # Reset by pressing CTRL + C
    except KeyboardInterrupt:
        print "Measurement stopped by User"
        GPIO.cleanup()
        sio.disconnect()
