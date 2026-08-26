import { useMemo, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Header } from "../components/header";

const categories = [
  { id: "all", label: "Tudo", icon: "silverware-fork-knife" },
  { id: "fish", label: "Peixes", icon: "fish" },
  { id: "japanese", label: "Japa", icon: "rice" },
  { id: "burger", label: "Burger", icon: "hamburger" },
  { id: "healthy", label: "Leve", icon: "leaf" },
];

const restaurants = [
  {
    id: "mar-azul",
    name: "Mar Azul Cozinha",
    category: "fish",
    rating: 4.8,
    deliveryTime: "25-35 min",
    fee: "R$ 4,99",
    image:
      "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?auto=format&fit=crop&w=900&q=80",
    tags: ["Peixes", "Moqueca", "Premium"],
  },
  {
    id: "sushi-pier",
    name: "Sushi Pier 12",
    category: "japanese",
    rating: 4.7,
    deliveryTime: "30-45 min",
    fee: "Grátis",
    image:
      "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=900&q=80",
    tags: ["Sushi", "Temaki", "Combo"],
  },
  {
    id: "dock-burger",
    name: "Dock Burger",
    category: "burger",
    rating: 4.6,
    deliveryTime: "20-30 min",
    fee: "R$ 3,99",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80",
    tags: ["Artesanal", "Batata", "Molhos"],
  },
];

const popularDishes = [
  {
    id: "poke-salmao",
    name: "Poke de salmao",
    restaurant: "Mar Azul Cozinha",
    price: 42.9,
    category: "healthy",
    image:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: "combo-sushi",
    name: "Combo Sushi 24 pecas",
    restaurant: "Sushi Pier 12",
    price: 59.9,
    category: "japanese",
    image:
      "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: "tilapia",
    name: "Tilapia crocante",
    restaurant: "Mar Azul Cozinha",
    price: 36.5,
    category: "fish",
    image:
      "https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=700&q=80",
  },
];

function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function Index() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [cartItems, setCartItems] = useState<string[]>([]);

  const filteredRestaurants = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return restaurants.filter((restaurant) => {
      const matchesCategory =
        selectedCategory === "all" || restaurant.category === selectedCategory;
      const matchesSearch =
        normalizedSearch.length === 0 ||
        restaurant.name.toLowerCase().includes(normalizedSearch) ||
        restaurant.tags.some((tag) => tag.toLowerCase().includes(normalizedSearch));

      return matchesCategory && matchesSearch;
    });
  }, [search, selectedCategory]);

  const filteredDishes = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return popularDishes.filter((dish) => {
      const matchesCategory =
        selectedCategory === "all" || dish.category === selectedCategory;
      const matchesSearch =
        normalizedSearch.length === 0 ||
        dish.name.toLowerCase().includes(normalizedSearch) ||
        dish.restaurant.toLowerCase().includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    });
  }, [search, selectedCategory]);

  const cartTotal = cartItems.reduce((total, itemId) => {
    const dish = popularDishes.find((item) => item.id === itemId);
    return total + (dish?.price ?? 0);
  }, 0);

  return (
    <View className="flex-1 bg-slate-100">
      <Header cartCount={cartItems.length} />

      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-28"
        showsVerticalScrollIndicator={false}
      >
        <View className="bg-white px-5 pb-5">
          <View className="rounded-3xl bg-teal-700 p-5">
            <View className="flex-row items-center justify-between">
              <View className="mr-4 flex-1">
                <Text className="text-sm font-medium text-teal-100">Hoje no FishDelivery</Text>
                <Text className="mt-2 text-3xl font-extrabold leading-9 text-white">
                  Comida fresca chegando rapido
                </Text>
                <Text className="mt-2 text-sm leading-5 text-teal-50">
                  Restaurantes selecionados, pratos quentes e entrega acompanhada.
                </Text>
              </View>
              <View className="h-24 w-24 items-center justify-center rounded-2xl bg-white/15">
                <MaterialCommunityIcons name="fish" size={58} color="#facc15" />
              </View>
            </View>

            <View className="mt-5 flex-row rounded-2xl bg-white px-4 py-3">
              <Feather name="search" size={20} color="#64748b" />
              <TextInput
                className="ml-3 flex-1 text-base text-slate-950"
                placeholder="Buscar prato ou restaurante"
                placeholderTextColor="#94a3b8"
                value={search}
                onChangeText={setSearch}
              />
            </View>
          </View>
        </View>

        <View className="mt-5">
          <ScrollView
            horizontal
            contentContainerClassName="px-5"
            showsHorizontalScrollIndicator={false}
          >
            {categories.map((category) => {
              const isSelected = selectedCategory === category.id;

              return (
                <Pressable
                  key={category.id}
                  className={`mr-3 flex-row items-center rounded-full px-4 py-3 ${
                    isSelected ? "bg-slate-950" : "bg-white"
                  }`}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <MaterialCommunityIcons
                    name={category.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                    size={18}
                    color={isSelected ? "#ffffff" : "#0f766e"}
                  />
                  <Text
                    className={`ml-2 font-semibold ${
                      isSelected ? "text-white" : "text-slate-700"
                    }`}
                  >
                    {category.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View className="mt-7 px-5">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-xl font-extrabold text-slate-950">Restaurantes perto</Text>
            <Text className="font-semibold text-teal-700">Ver todos</Text>
          </View>

          {filteredRestaurants.length > 0 ? (
            filteredRestaurants.map((restaurant) => (
              <Pressable
                key={restaurant.id}
                className="mb-4 overflow-hidden rounded-2xl bg-white"
              >
                <Image source={{ uri: restaurant.image }} className="h-40 w-full" />
                <View className="p-4">
                  <View className="flex-row items-start justify-between">
                    <View className="mr-3 flex-1">
                      <Text className="text-lg font-extrabold text-slate-950">
                        {restaurant.name}
                      </Text>
                      <Text className="mt-1 text-sm text-slate-500">
                        {restaurant.tags.join(" • ")}
                      </Text>
                    </View>
                    <View className="flex-row items-center rounded-full bg-amber-100 px-2 py-1">
                      <Ionicons name="star" size={13} color="#d97706" />
                      <Text className="ml-1 text-xs font-bold text-amber-700">
                        {restaurant.rating}
                      </Text>
                    </View>
                  </View>

                  <View className="mt-4 flex-row items-center">
                    <Feather name="clock" size={15} color="#64748b" />
                    <Text className="ml-2 text-sm font-medium text-slate-600">
                      {restaurant.deliveryTime}
                    </Text>
                    <View className="mx-3 h-1 w-1 rounded-full bg-slate-300" />
                    <Feather name="truck" size={15} color="#64748b" />
                    <Text className="ml-2 text-sm font-medium text-slate-600">
                      {restaurant.fee}
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))
          ) : (
            <View className="rounded-2xl bg-white p-5">
              <Text className="text-base font-bold text-slate-950">
                Nenhum restaurante encontrado
              </Text>
              <Text className="mt-1 text-sm text-slate-500">
                Tente outra categoria ou busca.
              </Text>
            </View>
          )}
        </View>

        <View className="mt-3 px-5">
          <Text className="mb-4 text-xl font-extrabold text-slate-950">Mais pedidos</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {filteredDishes.map((dish) => (
              <View key={dish.id} className="mr-4 w-52 overflow-hidden rounded-2xl bg-white">
                <Image source={{ uri: dish.image }} className="h-32 w-full" />
                <View className="p-4">
                  <Text className="text-base font-extrabold text-slate-950" numberOfLines={2}>
                    {dish.name}
                  </Text>
                  <Text className="mt-1 text-xs font-medium text-slate-500" numberOfLines={1}>
                    {dish.restaurant}
                  </Text>
                  <View className="mt-4 flex-row items-center justify-between">
                    <Text className="text-base font-extrabold text-teal-700">
                      {formatPrice(dish.price)}
                    </Text>
                    <Pressable
                      className="h-9 w-9 items-center justify-center rounded-full bg-slate-950"
                      onPress={() => setCartItems((items) => [...items, dish.id])}
                      accessibilityLabel={`Adicionar ${dish.name}`}
                    >
                      <Feather name="plus" size={18} color="#ffffff" />
                    </Pressable>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 border-t border-slate-200 bg-white px-5 py-4">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-xs font-semibold uppercase text-slate-500">
              {cartItems.length} {cartItems.length === 1 ? "item" : "itens"}
            </Text>
            <Text className="text-xl font-extrabold text-slate-950">
              {formatPrice(cartTotal)}
            </Text>
          </View>
          <Pressable
            className={`flex-row items-center rounded-full px-5 py-3 ${
              cartItems.length > 0 ? "bg-teal-700" : "bg-slate-300"
            }`}
            disabled={cartItems.length === 0}
          >
            <Text className="mr-2 font-extrabold text-white">Ver carrinho</Text>
            <Feather name="arrow-right" size={18} color="#ffffff" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
