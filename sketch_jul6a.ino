#include <ArduinoBLE.h>

const char * deviceServiceUuid = "19b10000-e8f2-537e-4f6c-d104768a1214";
const char * deviceServiceRequestCharacteristicUuid = "19b10001-e8f2-537e-4f6c-d104768a1215";
const char * deviceServiceRequestLengthCharacteristicUuid = "19b10001-e8f2-537e-4f6c-d104768a1216";
const char * deviceServiceResponseCharacteristicUuid = "19b10002-e8f2-537e-4f6c-d104768a1217";

BLEService deviceService(deviceServiceUuid);
BLEStringCharacteristic deviceRequestCharacteristic(deviceServiceRequestCharacteristicUuid, BLEWrite, 4);
BLEStringCharacteristic deviceRequestLengthCharacteristic(deviceServiceRequestLengthCharacteristicUuid, BLEWrite, 4);
BLEStringCharacteristic deviceResponseCharacteristic(deviceServiceResponseCharacteristicUuid, BLERead | BLENotify, 4);

unsigned long lastMillis = 0;

void setup() {
  Serial.begin(9600);

  pinMode(8, OUTPUT); // Set pin 8 as an output for LED1
  pinMode(9, OUTPUT); // Set pin 9 as an output for LED2

  if (!BLE.begin()) {
    Serial.println("- Starting Bluetooth® Low Energy module failed!");
    while (1);
  }

  BLE.setDeviceName("WakeWinch");
  BLE.setLocalName("WakeWinch");

  BLE.setAdvertisedService(deviceService);
  deviceService.addCharacteristic(deviceRequestCharacteristic);
  deviceService.addCharacteristic(deviceRequestLengthCharacteristic);
  deviceService.addCharacteristic(deviceResponseCharacteristic);
  BLE.addService(deviceService);

  BLE.advertise();

  Serial.println("Arduino R4 WiFi BLE (Peripheral Device)");
  Serial.println(" ");
}

void loop() {
  BLEDevice central = BLE.central();
  Serial.println("- Discovering central device...");
  delay(500);

  if (central) {
    Serial.println("* Connected to central device!");
    Serial.print("* Device MAC address: ");
    Serial.println(central.address());
    Serial.println(" ");

    while (central.connected()) {
      if (deviceRequestCharacteristic.written()) {
        String command = deviceRequestCharacteristic.value();
        Serial.print("Received command: ");
        Serial.println(command);

        if (command.equals("in")) {
           digitalWrite(8, HIGH); // Turn on LED1
           Serial.println("debug"); 
        } else if (command.equals("out")) {
           digitalWrite(9, HIGH); // Turn on LED2
        } else { // Command must be 'stop'
          digitalWrite(8, LOW);
          digitalWrite(9, LOW);
        }
      }
      if (deviceRequestLengthCharacteristic.written()) {
        String newValue = deviceRequestLengthCharacteristic.value();
        Serial.print("Received value length: ");
        Serial.println(newValue);
      }

      unsigned long currentMillis = millis();
      if (currentMillis - lastMillis >= 5000) {  // send a random number every 5 seconds
        lastMillis = currentMillis;
        String randomNumber = String(random(0, 100));  // generate a random number between 0 and 99
        deviceResponseCharacteristic.writeValue(randomNumber);
        Serial.print("Sent random number: ");
        Serial.println(randomNumber);
      }
    }
    Serial.println("* Disconnected from central device!");
  }
}
