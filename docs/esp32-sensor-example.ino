/*
 * ESP32 - Tirtha Pawitan IoT Sensor
 * Mengirim data debit air ke server via MQTT
 * 
 * Hardware:
 *   - ESP32 DevKit V1
 *   - YF-S201 Water Flow Sensor (GPIO 27)
 *   - DS18B20 Temperature Sensor (GPIO 4) [optional]
 * 
 * Library yang dibutuhkan:
 *   - PubSubClient (Nick O'Leary)
 *   - WiFi (built-in ESP32)
 *   - ArduinoJson (Benoit Blanchon)
 */

#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

// ========== KONFIGURASI WiFi ==========
const char* WIFI_SSID     = "WIFI_SSID";
const char* WIFI_PASSWORD = "WIFI_PASSWORD";

// ========== KONFIGURASI MQTT ==========
const char* MQTT_SERVER   = "broker.hivemq.com";  // Ganti dengan broker Anda
const int   MQTT_PORT     = 1883;
const char* MQTT_CLIENT   = "tirtha-esp32-001";
const char* MQTT_TOPIC    = "tirtha-pawitan/sensor/cigugur"; // Sesuaikan dengan titik air

// ========== KONFIGURASI SENSOR ==========
#define FLOW_SENSOR_PIN   27
#define LED_STATUS_PIN    2   // LED bawaan ESP32

// ========== VARIABEL GLOBAL ==========
WiFiClient espClient;
PubSubClient mqtt(espClient);

volatile int pulseCount = 0;
float flowRate = 0.0;
float totalLiters = 0.0;
unsigned long lastFlowCheck = 0;
unsigned long lastPublish = 0;

// Interval pengiriman data (dalam milidetik)
const unsigned long PUBLISH_INTERVAL = 10000; // 10 detik

// ========== INTERRUPT HANDLER ==========
void IRAM_ATTR pulseCounter() {
  pulseCount++;
}

// ========== SETUP ==========
void setup() {
  Serial.begin(115200);
  Serial.println("\n=================================");
  Serial.println("  Tirtha Pawitan - ESP32 Sensor");
  Serial.println("=================================\n");

  pinMode(LED_STATUS_PIN, OUTPUT);
  pinMode(FLOW_SENSOR_PIN, INPUT_PULLUP);

  // Attach interrupt untuk flow sensor
  attachInterrupt(digitalPinToInterrupt(FLOW_SENSOR_PIN), pulseCounter, FALLING);

  // Koneksi WiFi
  connectWiFi();

  // Setup MQTT
  mqtt.setServer(MQTT_SERVER, MQTT_PORT);
  mqtt.setCallback(mqttCallback);
  connectMQTT();

  Serial.println("[OK] Sistem siap mengirim data!\n");
}

// ========== LOOP UTAMA ==========
void loop() {
  // Pastikan koneksi tetap aktif
  if (!mqtt.connected()) {
    connectMQTT();
  }
  mqtt.loop();

  // Hitung flow rate setiap 1 detik
  if (millis() - lastFlowCheck >= 1000) {
    calculateFlow();
    lastFlowCheck = millis();
  }

  // Kirim data sesuai interval
  if (millis() - lastPublish >= PUBLISH_INTERVAL) {
    publishSensorData();
    lastPublish = millis();
  }
}

// ========== FUNGSI WiFi ==========
void connectWiFi() {
  Serial.printf("[WiFi] Menghubungkan ke %s", WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.printf("\n[WiFi] Terhubung! IP: %s\n", WiFi.localIP().toString().c_str());
    digitalWrite(LED_STATUS_PIN, HIGH);
  } else {
    Serial.println("\n[WiFi] Gagal terhubung! Restart...");
    ESP.restart();
  }
}

// ========== FUNGSI MQTT ==========
void connectMQTT() {
  while (!mqtt.connected()) {
    Serial.print("[MQTT] Menghubungkan ke broker...");
    
    if (mqtt.connect(MQTT_CLIENT)) {
      Serial.println(" Terhubung!");
      
      // Subscribe untuk menerima perintah dari server
      mqtt.subscribe("tirtha-pawitan/command/#");
      Serial.println("[MQTT] Subscribed ke tirtha-pawitan/command/#");
    } else {
      Serial.printf(" Gagal (rc=%d). Coba lagi dalam 5 detik...\n", mqtt.state());
      delay(5000);
    }
  }
}

void mqttCallback(char* topic, byte* payload, unsigned int length) {
  String message = "";
  for (unsigned int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  
  Serial.printf("[MQTT] Pesan masuk [%s]: %s\n", topic, message.c_str());
  
  // Handle perintah dari server
  if (String(topic) == "tirtha-pawitan/command/restart") {
    Serial.println("[CMD] Restart ESP32...");
    ESP.restart();
  }
}

// ========== FUNGSI SENSOR ==========
void calculateFlow() {
  // YF-S201: 1 liter = 450 pulsa (kalibrasi sesuai sensor Anda)
  float calibrationFactor = 7.5; // pulsa per detik per L/min
  
  detachInterrupt(digitalPinToInterrupt(FLOW_SENSOR_PIN));
  
  flowRate = pulseCount / calibrationFactor; // L/min
  float flowLiters = flowRate / 60.0;        // L/s (konversi ke per detik)
  totalLiters += flowLiters;
  
  pulseCount = 0;
  attachInterrupt(digitalPinToInterrupt(FLOW_SENSOR_PIN), pulseCounter, FALLING);
}

// ========== KIRIM DATA ==========
void publishSensorData() {
  // Buat JSON payload
  StaticJsonDocument<256> doc;
  
  doc["device_id"]   = MQTT_CLIENT;
  doc["debit"]       = round(flowRate * 100) / 100.0;  // L/min, 2 desimal
  doc["total_liter"] = round(totalLiters * 100) / 100.0;
  doc["status"]      = determineStatus(flowRate);
  doc["uptime"]      = millis() / 1000;
  doc["rssi"]        = WiFi.RSSI(); // Kekuatan sinyal WiFi
  
  char jsonBuffer[256];
  serializeJson(doc, jsonBuffer);
  
  // Publish ke MQTT
  if (mqtt.publish(MQTT_TOPIC, jsonBuffer)) {
    Serial.printf("[PUBLISH] %s -> %s\n", MQTT_TOPIC, jsonBuffer);
    
    // Blink LED sebagai indikator
    digitalWrite(LED_STATUS_PIN, LOW);
    delay(100);
    digitalWrite(LED_STATUS_PIN, HIGH);
  } else {
    Serial.println("[ERROR] Gagal mengirim data!");
  }
}

// ========== KLASIFIKASI STATUS ==========
const char* determineStatus(float debit) {
  if (debit >= 20.0) return "Layak/Aman";
  if (debit >= 10.0) return "Butuh Konservasi";
  return "Kritis";
}
