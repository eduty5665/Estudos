import { Text, View, ScrollView } from "react-native";
import { Header } from "../components/header";



export default function Index() {
  return (
    <ScrollView style={{flex: 1}} className="bg-slate-200" showsHorizontalScrollIndicator={false}>
      <View className="w-full">
        <Header/>
      </View>
    </ScrollView>
  );
}
