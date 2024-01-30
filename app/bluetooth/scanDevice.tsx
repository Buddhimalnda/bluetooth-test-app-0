import React, { useEffect, useState } from 'react';
import { SafeAreaView, Text, View, Button, FlatList } from 'react-native';
import { BleManager, Device } from 'react-native-ble-plx';

const Bluetooth: React.FC = () => {
  const [manager] = useState(new BleManager());
  const [deviceInfo, setDeviceInfo] = useState<Device | null>(null);
  const [data, setData] = useState<string>('');

  const SERVICE_UUID = '12345678-1234-1234-1234-123456789abc';
  const CHARACTERISTIC_UUID = 'abcd1234-1234-1234-1234-123456789abc';

  const scanAndConnect = () => {
    manager.startDeviceScan(null, null, (error: any, device: any) => {
      if (error) {
        console.log(error);
        return;
      }

      // Stop scanning if the desired device is found
      if (device.name === 'ESP32_BLE') {
        manager.stopDeviceScan();
        device.connect()
          .then((connectedDevice: any) => {
            return connectedDevice.discoverAllServicesAndCharacteristics();
          })
          .then((connectedDevice: any) => {
            setDeviceInfo(connectedDevice);
            return connectedDevice.readCharacteristicForService(SERVICE_UUID, CHARACTERISTIC_UUID);
          })
          .then((characteristic: any) => {
            setData(characteristic.value);
            device.monitorCharacteristicForService(SERVICE_UUID, CHARACTERISTIC_UUID, (err: any, monitoredCharacteristic: any) => {
              if (monitoredCharacteristic) {
                setData(monitoredCharacteristic.value);
              }
            });
          })
          .catch((error: any) => {
            console.log(error);
          });
      }
    });
  };

  useEffect(() => {
    return () => manager.destroy();
  }, [manager]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ margin: 20 }}>
        <Button title="Scan and Connect" onPress={scanAndConnect} />
        <Text>Device: {deviceInfo?.name}</Text>
        <Text>Data: {data}</Text>
      </View>
    </SafeAreaView>
  );
};

export default Bluetooth;
