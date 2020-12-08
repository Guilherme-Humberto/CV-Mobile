import React, { useState, useEffect } from "react";
import * as Permissions from "expo-permissions";
import { usePermissions } from "@use-expo/permissions";
import MapView, { Marker } from "react-native-maps";
import {
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Text,
  View,
  Alert,
  Button,
} from "react-native";
import { Container } from "./styles";
import Fetcher from "../../../hooks/Fetcher";
import Modal from "../../../components/Modals/ModalMap/index";
import LoadMessage from "../../../components/LoadMessage";

// Posição inicial do usuário
// latitudeDelta e longitudeDelta: referentes ao zoom
const initialPosition = {
  latitude: null,
  longitude: null,
  latitudeDelta: 0.5105,
  longitudeDelta: 0.5091,
};

const Locals = () => {
  const [permission, askForPermission] = usePermissions(Permissions.LOCATION, {
    ask: true,
  });

  const { data } = Fetcher("institutions");
  // Pegando a largura e a altura da tela
  const { width, height } = Dimensions.get("window");

  // Estado que armazena a posição atual do usuario
  const [currentPosition, setCurrentPosition] = useState(initialPosition);
  const [openModal, setModalOpen] = useState(false);
  const [infos, setInfos] = useState("");

  // Pegando a localização do usuário
  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      setCurrentPosition({
        ...currentPosition,
        latitude,
        longitude,
      });
    });
  }, [permission]);

  function schedule(id) {
    setInfos(id);
    setModalOpen(true);
  }

  // Funcão para gerar os marcadores no mapa
  const renderMarker = () => {
    return data.map((item) => (
      <Marker
        style={{ ...StyleSheet.absoluteFillObject }}
        key={item._id}
        coordinate={{
          latitude: item.lat,
          longitude: item.long,
        }}
        title={item.name}
        onPress={() => {
          Alert.alert(
            `${item.name}`,
            `${item.desc}`,
            [
              { text: "Saber Mais", onPress: () => schedule(item._id) },
              { text: "Fechar", style: "cancel" },
            ],
            {
              cancelable: true,
            }
          );
        }}
      />
    ));
  };

  if (!permission || permission.status !== "granted") {
    Alert.alert(
      `Aviso`,
      `Para visualizar os hemocentros mais próximos de você, precisamos que você permita o acesso aos de dados de localização`,
      [
        { text: "Permitir", onPress: () => askForPermission() },
        { text: "Fechar", style: "cancel" },
      ],
      {
        cancelable: true,
      }
    );
  } 
  if (!data) {
    return null
  }
    return (
      <>
        <Container>
          {currentPosition.latitude ? (
            <MapView
              style={{ width, height }}
              initialRegion={currentPosition}
              showsPointsOfInterest={false}
              showsBuildings={false}
              showsUserLocation
            >
              {renderMarker()}
            </MapView>
          ) : (
            <ActivityIndicator style={{ flex: 1 }} animating size="large" />
          )}
        </Container>

        {openModal && (
          <Modal closeModal={() => setModalOpen(false)} infos={infos} />
        )}
      </>
    );
  
};

export default Locals;
