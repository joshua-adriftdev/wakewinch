#include <ArduinoBLE.h>
#include <EEPROM.h>
#include <ArduinoJson.h>

// When it stops for the 'changeover' period, it will only go for one black mark.

// BLE UUIDs
const char * deviceServiceUuid = "19b10000-e8f2-537e-4f6c-d104768a1214";
const char * deviceServiceRequestCharacteristicUuid = "19b10001-e8f2-537e-4f6c-d104768a1215";
const char * deviceServiceRequestLengthCharacteristicUuid = "19b10001-e8f2-537e-4f6c-d104768a1216";
const char * deviceServiceResponseCharacteristicUuid = "19b10002-e8f2-537e-4f6c-d104768a1217";

const char * deviceServiceRequestCharacteristicSettings = "19b10001-e8f2-537e-4f6c-d104768a1218";
const char * deviceServiceResponseCharacteristicSettings = "19b10002-e8f2-537e-4f6c-d104768a1219";

BLEService deviceService(deviceServiceUuid);
BLEStringCharacteristic deviceRequestCharacteristic(deviceServiceRequestCharacteristicUuid, BLEWrite, 5); // Manual Control (READ)
BLEStringCharacteristic deviceRequestLengthCharacteristic(deviceServiceRequestLengthCharacteristicUuid, BLEWrite, 4); // Preset Control (READ)
BLEStringCharacteristic deviceResponseCharacteristic(deviceServiceResponseCharacteristicUuid, BLERead | BLENotify, 4); // Return Length (WRITE)

BLEStringCharacteristic deviceRequestSettingsCharacteristic(deviceServiceRequestCharacteristicSettings, BLEWrite, 256); // Settings (READ)
BLEStringCharacteristic deviceResponseSettingsCharacteristic(deviceServiceResponseCharacteristicSettings, BLERead | BLENotify, 256); // Settings (WRITE)

// Color sensor pins
const int S0 = 2;
const int S1 = 3;
const int S2 = 4;
const int S3 = 5;
const int sensorOut = 6;

// LED pins
const int LED1 = 8;
const int LED2 = 9;

// Timing and state variables
unsigned long lastMillis = 0;
unsigned long lastBlackDetectionTime = 0; // Used for general delay & safety feature
const unsigned long blackDetectionInterval = 250; // Interval to ignore repeated detections

const unsigned long directionChangeDelay = 1000;
unsigned long lastDirectionChange = 0;
//String targetDirection = "";

const unsigned long safetyCutoffDelay = 3000;
bool ledIsOn = false;

// Rope length and direction tracking
float ropeLength = 0.0;
float targetLength = -1;
String currentDirection = "none"; // Possible values: "in", "out"

int addr = 0;
struct Settings {
  bool fine;
  float length;
  float interval;
  bool safety;
};
Settings defaultSettings = {false, 25.0, 0.5, true};

bool eStop = false;
String eStopDirection = "none";

void setup() {
  pinMode(S0, OUTPUT);
  pinMode(S1, OUTPUT);
  pinMode(S2, OUTPUT);
  pinMode(S3, OUTPUT);
  pinMode(sensorOut, INPUT);

  // Set frequency scaling to 100% for higher sensitivity
  digitalWrite(S0, HIGH);
  digitalWrite(S1, HIGH);

  pinMode(LED1, OUTPUT);
  pinMode(LED2, OUTPUT);

  Serial.begin(9600);

  byte initialized;
  EEPROM.get(addr, initialized);

  if (initialized != 0x01) {
    // EEPROM is not initialized, write default settings
    Serial.println("EEPROM not initialized, writing default settings...");
    EEPROM.put(addr, (byte)0x01); // Set the initialized flag
    EEPROM.put(addr + sizeof(byte), defaultSettings); // Store default settings
  } else {
    Serial.println("EEPROM already initialized, reading settings...");
  }

  Settings settings;
  EEPROM.get(addr + sizeof(byte), settings);

  if (!BLE.begin()) {
    Serial.println("- Starting Bluetooth® Low Energy module failed!");
    while (1);
  }

  BLE.setDeviceName("WakeWinch (WW267)");
  BLE.setLocalName("WakeWinch (WW267)");

  BLE.setAdvertisedService(deviceService);
  deviceService.addCharacteristic(deviceRequestCharacteristic);
  deviceService.addCharacteristic(deviceRequestLengthCharacteristic);
  deviceService.addCharacteristic(deviceResponseCharacteristic);
  deviceService.addCharacteristic(deviceRequestSettingsCharacteristic);
  deviceService.addCharacteristic(deviceResponseSettingsCharacteristic);
  BLE.addService(deviceService);

  BLE.advertise();

  Serial.println("Arduino R4 WiFi BLE (Peripheral Device)");
  Serial.println(" ");
}

float roundToTwoDecimalPlaces(float value) {
  return roundf(value * 100) / 100;
}

int readColorFrequency(int s2State, int s3State) {
  digitalWrite(S2, s2State);
  digitalWrite(S3, s3State);
  return pulseIn(sensorOut, LOW, 100000); // 1000ms timeout - NOTE: This may need to be decreased when the spool is on.
}

/* 
  GLOBAL DIRECTION HANDLING
*/

unsigned long resumeMovement = 0;
unsigned long resumeAfterStop = 0;
String targetDirection = "none";

void setTargetDirection(String dir) {
  unsigned long currentMillis = millis();
  targetDirection = dir;

  Serial.println(currentDirection);
  if (currentDirection != "none" && currentDirection != targetDirection) { // The winch is currently moving
    stop();
    resumeMovement = currentMillis + directionChangeDelay;
  }
}

void checkChangeDirection() {
  unsigned long currentMillis = millis();
  if (currentMillis > resumeMovement && currentMillis > resumeAfterStop) { // Exited the delay
    resumeMovement = 0;
    resumeAfterStop = 0;
    if (targetDirection == "in") {
        digitalWrite(LED1, HIGH); // Turn on LED1
        digitalWrite(LED2, LOW);  // Turn off LED2
        Serial.println("Going in");

        if (eStop && eStopDirection == "in") {
          ropeLength += 0.5;

          eStop = false;
          eStopDirection = "none";
        }
      } else if (targetDirection == "out") {
        digitalWrite(LED1, LOW);  // Turn off LED1
        digitalWrite(LED2, HIGH); // Turn on LED2
        Serial.println("Going out");

        if (eStop && eStopDirection == "out") {
          ropeLength -= 0.5;

          eStop = false;
          eStopDirection = "none";
        }
      }

    currentDirection = targetDirection;
  }
}

void safety() {
  unsigned long currentMillis = millis();
  if (currentDirection != "none") {
    if ((currentMillis - lastBlackDetectionTime) > safetyCutoffDelay) {
      // Engage Safety
      digitalWrite(LED1, LOW);
      digitalWrite(LED2, LOW);
      currentDirection = "none";
      targetDirection = "none";
      Serial.println("Safety Engaged - Motor turned off");
      deviceResponseSettingsCharacteristic.writeValue("safe");
    }
  }
}

void stop() {
  unsigned long currentMillis = millis();

  currentDirection = "none";
  digitalWrite(LED1, LOW);  // Turn off LED1
  digitalWrite(LED2, LOW);  // Turn off LED2
  resumeAfterStop = currentMillis + directionChangeDelay;
}

unsigned long sendMillis = 0;
bool stopOnBlack = false;

void loop() {
  BLEDevice central = BLE.central();
  Serial.println("- Discovering central device...");
  delay(500);

  if (central) {
    Serial.println("* Connected to central device!");
    Serial.print("* Device MAC address: ");
    Serial.println(central.address());
    Serial.println(" ");

    Settings currentSettings;
    EEPROM.get(addr + sizeof(byte), currentSettings);
    
    StaticJsonDocument<256> doc;
    doc["fine"] = currentSettings.fine;
    doc["length"] = currentSettings.length;
    doc["interval"] = currentSettings.interval;
    doc["safety"] = currentSettings.safety;

    String jsonString;
    serializeJson(doc, jsonString);    

    bool a = false;
    bool b = false;

    while (central.connected()) {
      unsigned long currentMillis = millis();

      if (!a) {
        sendMillis = currentMillis;
        a = true;
      }

      if (!b) {
        if (currentMillis - sendMillis > 1000) {
          if (deviceResponseSettingsCharacteristic.writeValue(jsonString)) {
            Serial.println("Data sent successfully over BLE.");
          } else {
            Serial.println("Failed to send data over BLE.");
          }
          Serial.print(jsonString);
          b = true;
        }
      }

      
      // Handle BLE characteristics
      if (deviceRequestCharacteristic.written()) {
        String command = deviceRequestCharacteristic.value();
        Serial.print("Received command: ");
        Serial.println(command);

        if (command.equals("in") && ropeLength != 0) {
          setTargetDirection("in");
          Serial.print("In");
          lastBlackDetectionTime = currentMillis;
          stopOnBlack = false;
        } else if (command.equals("out") && ropeLength != currentSettings.length) {
          setTargetDirection("out");
          Serial.print("Out");
          lastBlackDetectionTime = currentMillis;
          stopOnBlack = false;
        } else if (command.equals("stop")) {
          if (!currentSettings.fine) {
            stopOnBlack = true;
          } else {
            currentDirection = "none";
            targetDirection = "none";

            digitalWrite(LED1, LOW);
            digitalWrite(LED2, LOW);
            
            resumeAfterStop = currentMillis + directionChangeDelay;
          }
          Serial.println("Motor turned OFF");
          
          targetLength = -1;
          
        } else if (command.equals("estop")) {
          eStop = true;
          eStopDirection = currentDirection;
          if (currentDirection == "in") {
            ropeLength -= currentSettings.interval;
          } else if (currentDirection == "out") {
            ropeLength += currentSettings.interval;
          }

          currentDirection = "none";
          targetDirection = "none";

          digitalWrite(LED1, LOW);
          digitalWrite(LED2, LOW);

          resumeAfterStop = currentMillis + directionChangeDelay;
          Serial.println("Emergency Stop");
          
          targetLength = -1;
          
        }
      }

      if (currentSettings.safety) {
        safety();
      }

      if (deviceRequestLengthCharacteristic.written()) {
        String newValue = deviceRequestLengthCharacteristic.value();
        targetLength = newValue.toFloat();
        Serial.print("Received preset length: ");
        Serial.println(targetLength);
        Serial.println("Starting adjustment... | " + (ropeLength < targetLength));
        
        // PRESET
        if (ropeLength < targetLength) {
          setTargetDirection("out");
          Serial.println("Adjusting rope length: winding out");
        } else if (ropeLength > targetLength) {
          setTargetDirection("in");
          Serial.println("Adjusting rope length: winding in");
        }

        lastBlackDetectionTime = currentMillis;
      }

      if (deviceRequestSettingsCharacteristic.written()) {
        Serial.println("Debug");
        String receivedString = deviceRequestSettingsCharacteristic.value();
        Serial.print("Received JSON: ");
        Serial.println(receivedString);

        // Parse the JSON
        StaticJsonDocument<256> receivedDoc;
        DeserializationError error = deserializeJson(receivedDoc, receivedString);
        if (error) {
          Serial.print("deserializeJson() failed: ");
          Serial.println(error.f_str());
          return;
        }

        // Update settings from JSON
        currentSettings.fine = receivedDoc["fine"];
        currentSettings.length = receivedDoc["length"];
        currentSettings.interval = receivedDoc["interval"];
        currentSettings.safety = receivedDoc["safety"];

        // Save updated settings to EEPROM
        EEPROM.put(addr + sizeof(byte), currentSettings);
        Serial.println("Settings updated and saved to EEPROM.");
        
      }

      //handleDirectionChange();
      checkChangeDirection();

      // Read frequencies for red, green, and blue
      digitalWrite(S2, LOW);
      digitalWrite(S3, LOW);
      int redFrequency = readColorFrequency(LOW, LOW);
      digitalWrite(S2, HIGH);
      digitalWrite(S3, HIGH);
      int greenFrequency = readColorFrequency(HIGH, HIGH);
      digitalWrite(S2, LOW);
      digitalWrite(S3, HIGH);
      int blueFrequency = readColorFrequency(LOW, HIGH);

      // Convert frequency to color intensity
      int redValue = map(redFrequency, 25, 70, 255, 0);
      int greenValue = map(greenFrequency, 30, 80, 255, 0);
      int blueValue = map(blueFrequency, 25, 70, 255, 0);

      // Check if the detected color is black
      if (redValue < 100 && greenValue < 100 && blueValue < 100) {
        unsigned long currentMillis = millis();
        if (currentMillis - lastBlackDetectionTime > blackDetectionInterval) {
          Serial.println("Black Detected");
          lastBlackDetectionTime = currentMillis;

          // Update rope length based on direction
          if (eStop) {
            if (eStopDirection == "in") {
              ropeLength += currentSettings.interval;
            } else if (eStopDirection == "out") {
              ropeLength -= currentSettings.interval;
            }
            eStopDirection = "none";
            eStop = false;
          }

          if (currentDirection == "in") {
              if (ropeLength <= 0.5) {
                ropeLength = 0;
                targetDirection = "none";
                stop();
              } else {
                ropeLength -= currentSettings.interval;
              }
              Serial.print("Rope length decreased: ");
            } else if (currentDirection == "out") {
              ropeLength += currentSettings.interval; // Move the rope length forward
              if (ropeLength == currentSettings.length) {
                stop();
              }
              Serial.print("Rope length increased: ");
            } else {
              Serial.print("Rope length unchanged: ");
            }

            if (ropeLength == targetLength || stopOnBlack) {
              Serial.println("Stopping... I hope");
              targetDirection = "none";
              stop();
              stopOnBlack = false;
              
            }

          
          deviceResponseCharacteristic.writeValue(String(ropeLength));
        }
      } else if (redValue < 150) {
        //Serial.print("STOPPPPPPPPPPP!!! !OR DIE!");
      }
    }
    Serial.println("* Disconnected from central device!");
  }
}