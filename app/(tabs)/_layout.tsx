import { icons } from "@/constant/image";
import { Tabs } from "expo-router";
import { Image, ImageSourcePropType, Platform, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TabIcon = ({
  source,
  focused,
}: {
  source: ImageSourcePropType;
  focused: boolean;
}) => (
  <View
    className={`w-14 h-14 rounded-full items-center my-auto justify-center ${focused ? "bg-general-400" : "bg-transparent"
      }`}
  >
    <Image
      source={source}
      tintColor="white"
      resizeMode="contain"
      className="w-7 h-7"
    />
  </View>
);

const CustomTabButton = (props: any) => (
  <TouchableOpacity
    {...props}
    activeOpacity={1}
    style={props.style}
  />
);

export default function Layout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        tabBarActiveTintColor: "white",
        tabBarInactiveTintColor: "white",
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "#333333",
          borderRadius: 50,
          paddingBottom: Platform.OS === 'ios' ? 0 : insets.bottom,
          overflow: "hidden",
          marginHorizontal: 20,
          marginBottom: Platform.OS === 'android' ? insets.bottom : 0,
          height: 78,
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          flexDirection: "row",
          position: "absolute",
          paddingHorizontal: 10,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon source={icons.home} focused={focused} />
          ),
          tabBarButton: (props) => <CustomTabButton {...props} />,
        }}
      />
      <Tabs.Screen
        name="recent"
        options={{
          title: "Rides",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon source={icons.ride} focused={focused} />
          ),
          tabBarButton: (props) => <CustomTabButton {...props} />,
        }}
      />
      <Tabs.Screen
        name="Chat"
        options={{
          title: "Chat",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon source={icons.chat} focused={focused} />
          ),
          tabBarButton: (props) => <CustomTabButton {...props} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon source={icons.profile} focused={focused} />
          ),
          tabBarButton: (props) => <CustomTabButton {...props} />,
        }}
      />
    </Tabs>
  );
}