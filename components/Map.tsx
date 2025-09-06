import React from 'react'
import MapView, { PROVIDER_DEFAULT } from 'react-native-maps'
export default function Map() {
  return (
    <MapView provider={PROVIDER_DEFAULT} className='h-full w-full rounded-full'>
    </MapView>
  )
}