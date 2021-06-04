/* Example sketch to control a stepper motor with TB6600 stepper motor driver and Arduino without a library: number of revolutions, speed and direction. More info: https://www.makerguides.com */

#define dirPin D2
#define stepPin D3
#define Trig D4 
#define Echo D5

bool peopleHere = false;
bool lockStatus = false;
float dist; 
int delaytime = 10;
float t = 30.0;
int stepNum = 40;
int lockcount = 100;
int speedcount = 5;
int speedcount2 = 5;
double distance(int trig, int echo)
{
  unsigned long MEASURE_TIMEOUT = 23000UL;
  
  //给Trig发送一个低高低的短时间脉冲,触发测距
  digitalWrite(trig, LOW); //给Trig发送一个低电平
  delayMicroseconds(2);    //等待 2微妙
  digitalWrite(trig, HIGH); //给Trig发送一个高电平
  delayMicroseconds(10);    //等待 10微妙
  digitalWrite(trig, LOW); //给Trig发送一个低电平
  
  long temp = pulseIn(echo, HIGH, MEASURE_TIMEOUT); //存储回波等待时间,
  //pulseIn函数会等待引脚变为HIGH,开始计算时间,再等待变为LOW并停止计时
  //返回脉冲的长度
  
  //声速是:340m/1s 换算成 34000cm / 1000000μs => 34 / 1000
  //因为发送到接收,实际是相同距离走了2回,所以要除以2
  //距离(厘米)  =  (回波时间 * (34 / 1000)) / 2
  //简化后的计算公式为 (回波时间 * 17)/ 1000
  
  float distance_cm = (temp * 17 )/1000; //把回波时间换算成cm
 
//  Serial.print("Echo =");
//  Serial.print(temp);//串口输出等待时间的原始数据
//  Serial.print(" | | Distance = ");
//  Serial.print(distance_cm);//串口输出距离换算成cm的结果
//  Serial.println("cm");
//  delay(100);
  if(distance_cm<0.1 || distance_cm>300){
    return -1.0;
    }else{
  return distance_cm;
    }
  }

void takeDistance(){
    dist = distance(Trig, Echo);

    if(dist < t){
      peopleHere = true;
    }else{
      peopleHere = false;
    }
 
}

void setup() {
  Serial.begin(9600);
  pinMode(stepPin, OUTPUT);
  pinMode(dirPin, OUTPUT);
  pinMode(Trig, OUTPUT);
  pinMode(Echo, INPUT);
//  pinMode(tunePin, INPUT);
 
}


void loop() {
//  int theValue = analogRead(tunePin);
//  int delayTime = map(theValue, 0, 1024, 80, 10);
//  Serial.println(delayTime);
  takeDistance();
  delay(10);
  if(peopleHere == true){
    if (speedcount > 0){
      speedcount -= 1;
    }
    else{
    speedcount = 5;
    stepNum -= 5;
    if (stepNum <0){
      stepNum = 0;
      }
    delaytime+=30;
    if(delaytime>100)
    {
      delaytime = 100;
      lockStatus = true;
      Serial.println("calm down");
      }
    }
    Serial.print("delaytime:");
    Serial.println(delaytime);
  }
  else if (peopleHere == false){
    if (lockcount > 0 && lockStatus == true){
        lockcount -= 1;
        delay(600);
      }else if(lockcount <= 0 && lockStatus == true){
        lockStatus = false;
        delaytime = 100;
        stepNum = 10;
        speedcount2 = 5;
        Serial.println("reset");
        lockcount = 100;
      }
    if (speedcount2 > 0){
      speedcount2 -= 1;
    }
    else{
    speedcount2 = 5;
    stepNum += 5;
    if (stepNum >50){
      stepNum = 50;
      }
    delaytime -=30;
    if(delaytime<10)
    {
      delaytime = 10;
      }
    }
    Serial.print("delaytime:");
    Serial.println(delaytime);
    }

  if(!lockStatus){
  swingOnce(delaytime);
  }
}


void swingOnce(int delayTime){
    turn(true, delayTime);
    turn(false, delayTime);
    turn(false, delayTime);
    turn(true, delayTime);
}

void turn(bool dir, int delayTime){
   // HIGH: clockwise, LOW: counterclockwise
   if (dir == true){
    digitalWrite(dirPin, HIGH); 
   }else{
    digitalWrite(dirPin, LOW); 
   }

  int stepDelay =  map(delayTime, 120, 10, 5000, 0);
  for (int i = 0; i < stepNum; i++) {
    digitalWrite(stepPin, HIGH);
    delayMicroseconds(600);
    digitalWrite(stepPin, LOW);
    delayMicroseconds(600);
    delayMicroseconds(stepDelay);
  }
  delay(delayTime);
}
