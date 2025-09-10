import { router } from "expo-router";
import { FlatList, View } from "react-native";

import CustomButton from "@/components/CustomButton";
import DriverCard from "@/components/DriverCard";
import { drivers } from "@/components/Map";
import RideLayout from "@/components/RideLayout";
import { useAppDispatch, useAppSelector } from "@/libs/redux/hooks";
import { setSelectedDriver } from "@/libs/redux/state/driverSlice";

const ConfirmRide = () => {
  const dispatch = useAppDispatch()
  const { selectedDriver } = useAppSelector((state) => state.driver)

  return (
    <RideLayout title={"Choose a Driver"} snapPoints={["65%", "85%"]}>
      <FlatList
        data={drivers}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <DriverCard
            item={{ ...item, title: `${item.first_name} ${item.last_name}`, latitude: 0, longitude: 0, rating: parseFloat(item.rating), price: item.rating, time: item.car_seats }}
            selected={selectedDriver!}
            setSelected={() => dispatch(setSelectedDriver({ driverId: item.id! as number }))}
          />
        )}
        ListFooterComponent={() => (
          <View className="mx-5 mt-10">
            <CustomButton
              title="Select Ride"
              onPress={() => router.push("/(root)/book-ride")}
            />
          </View>
        )}
      />
    </RideLayout>
  );
};

export default ConfirmRide;