import { router } from "expo-router";
import { FlatList, View } from "react-native";

import CustomButton from "@/components/CustomButton";
import DriverCard from "@/components/DriverCard";
import RideLayout from "@/components/RideLayout";
import { useGetAvailableDriversQuery } from "@/feature/user/api/userApi";
import { useAppDispatch, useAppSelector } from "@/libs/redux/hooks";
import { setSelectedDriver } from "@/libs/redux/state/driverSlice";

const ConfirmRide = () => {
  const dispatch = useAppDispatch()
  const { selectedDriver } = useAppSelector((state) => state.driver)
  const { data } = useGetAvailableDriversQuery()
  return (
    <RideLayout title={"Choose a Rider"} snapPoints={["80%"]}>
      <FlatList
        data={data}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <DriverCard
            item={item}
            selected={selectedDriver!}
            setSelected={() => dispatch(setSelectedDriver({ driverId: item.id! as string }))}
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