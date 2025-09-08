import { GoogleInputProps } from "@/types/type";
import GooglePlacesTextInput from 'react-native-google-places-textinput';

const googlePlacesKey = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;

const GoogleTextInput = ({
  icon,
  initialLocation,
  containerStyle,
  textInputBackgroundColor,
  handlePress,
}: GoogleInputProps) => {

  return (
    <GooglePlacesTextInput
      apiKey={googlePlacesKey || ''}
      fetchDetails={true}
      placeHolderText="Where do you want to go?"
      onPlaceSelect={(place: any) => {
        const latitude = place?.details?.location?.latitude;
        const longitude = place?.details?.location?.longitude;
        const address = place?.details?.formattedAddress;

        handlePress({
          latitude,
          longitude,
          address,
        });
      }}
    />

  );
};

export default GoogleTextInput; 