import { View, Pressable, Text } from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";

type HeaderProps = {
  cartCount?: number;
};

export function Header({ cartCount = 0 }: HeaderProps) {
  return (
    <View className="flex-row items-center justify-between px-5 pt-12 pb-4 bg-white">
      <Pressable
        className="h-11 w-11 items-center justify-center rounded-full bg-slate-100"
        accessibilityLabel="Abrir menu"
      >
        <Ionicons name="menu" size={22} color="#0f172a" />
      </Pressable>

      <View className="flex-1 px-4">
        <Text className="text-xs font-medium text-slate-500">Entregar em</Text>
        <View className="flex-row items-center">
          <Feather name="map-pin" size={14} color="#0f766e" />
          <Text className="ml-1 text-base font-bold text-slate-950" numberOfLines={1}>
            Av. Beira Mar, 128
          </Text>
        </View>
      </View>

      <Pressable
        className="relative h-11 w-11 items-center justify-center rounded-full bg-teal-700"
        accessibilityLabel="Abrir carrinho"
      >
        <Feather name="shopping-bag" size={20} color="#ffffff" />
        {cartCount > 0 ? (
          <View className="absolute -right-1 -top-1 h-5 min-w-5 items-center justify-center rounded-full bg-amber-400 px-1">
            <Text className="text-[10px] font-bold text-slate-950">{cartCount}</Text>
          </View>
        ) : null}
      </Pressable>
    </View>
  );
}
