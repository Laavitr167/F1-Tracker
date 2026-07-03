import { View } from 'react-native';

export default function SkeletonRow() {
  return (
    <View style={{
      flexDirection: 'row', alignItems: 'center',
      paddingHorizontal: 20, paddingVertical: 16,
      borderBottomWidth: 1, borderBottomColor: '#1f1f1f'
    }}>
      <View style={{
        width: 4, height: 40, borderRadius: 4,
        backgroundColor: '#1f1f1f', marginRight: 16
      }} />
      <View style={{ flex: 1 }}>
        <View style={{
          height: 14, backgroundColor: '#1a1a1a',
          borderRadius: 7, marginBottom: 8, width: '60%'
        }} />
        <View style={{
          height: 11, backgroundColor: '#161616',
          borderRadius: 6, width: '40%'
        }} />
      </View>
      <View style={{
        height: 14, backgroundColor: '#1a1a1a',
        borderRadius: 7, width: 48
      }} />
    </View>
  );
}
        