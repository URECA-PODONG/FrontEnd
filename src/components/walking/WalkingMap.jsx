import React, { useEffect, useState, useCallback } from "react";
import styled from "styled-components";

const { kakao } = window;

const WalkingMap = () => {
  const [latitude, setLatitude] = useState(33.450701);
  const [longitude, setLongitude] = useState(126.570667);
  const [map, setMap] = useState(null);
  const [originMarker, setOriginMarker] = useState(null);
  const [destinationMarker, setDestinationMarker] = useState(null);
  const [originCoords, setOriginCoords] = useState(null);
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [polyline, setPolyline] = useState(null); // 경로선을 상태로 관리

  const handleMapClick = useCallback(
    (mouseEvent) => {
      const coords = mouseEvent.latLng;

      if (!originCoords) {
        if (originMarker) {
          originMarker.setMap(null);
        }
        const newOriginMarker = new kakao.maps.Marker({
          position: coords,
        });
        newOriginMarker.setMap(map);
        setOriginMarker(newOriginMarker);
        setOriginCoords(coords);
      } else if (!destinationCoords) {
        if (destinationMarker) {
          destinationMarker.setMap(null);
        }
        const newDestinationMarker = new kakao.maps.Marker({
          position: coords,
        });
        newDestinationMarker.setMap(map);
        setDestinationMarker(newDestinationMarker);
        setDestinationCoords(coords);
      }
    },
    [map, originCoords, destinationCoords, originMarker, destinationMarker]
  );

  useEffect(() => {
    const mapContainer = document.getElementById("map");
    const mapOptions = {
      center: new kakao.maps.LatLng(latitude, longitude),
      level: 3,
    };

    const kakaoMap = new kakao.maps.Map(mapContainer, mapOptions);
    setMap(kakaoMap);
  }, [latitude, longitude]);

  useEffect(() => {
    if (!map) return;

    if (!destinationCoords) {
      kakao.maps.event.addListener(map, "click", handleMapClick);
    } else {
      kakao.maps.event.removeListener(map, "click", handleMapClick);
    }

    return () => {
      kakao.maps.event.removeListener(map, "click", handleMapClick);
    };
  }, [map, handleMapClick, destinationCoords]);

  const getCarDirection = async () => {
    if (!originCoords || !destinationCoords) {
      alert("출발지와 목적지를 선택하세요.");
      return;
    }

    // 기존 경로선이 있다면 제거
    if (polyline) {
      polyline.setMap(null);
    }

    const REST_API_KEY = "da0dd0fc23a035bb681daba549304728";
    const url = "https://apis-navi.kakaomobility.com/v1/directions";
    const origin = `${originCoords.getLng()},${originCoords.getLat()}`;
    const destination = `${destinationCoords.getLng()},${destinationCoords.getLat()}`;

    const headers = {
      Authorization: `KakaoAK ${REST_API_KEY}`,
      "Content-Type": "application/json",
    };

    const queryParams = new URLSearchParams({
      origin,
      destination,
    });

    try {
      const response = await fetch(`${url}?${queryParams}`, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      const linePath = [];
      data.routes[0].sections[0].roads.forEach((road) => {
        road.vertexes.forEach((vertex, index) => {
          if (index % 2 === 0) {
            linePath.push(
              new kakao.maps.LatLng(
                road.vertexes[index + 1],
                road.vertexes[index]
              )
            );
          }
        });
      });

      const newPolyline = new kakao.maps.Polyline({
        path: linePath,
        strokeWeight: 5,
        strokeColor: "#000000",
        strokeOpacity: 0.7,
        strokeStyle: "solid",
      });

      newPolyline.setMap(map);
      setPolyline(newPolyline); // 새로운 경로선을 상태로 저장
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const resetMarkers = useCallback(() => {
    // 마커 초기화
    if (originMarker) {
      originMarker.setMap(null);
      setOriginMarker(null);
    }
    if (destinationMarker) {
      destinationMarker.setMap(null);
      setDestinationMarker(null);
    }

    // 경로선 초기화
    if (polyline) {
      polyline.setMap(null);
      setPolyline(null);
    }

    setOriginCoords(null);
    setDestinationCoords(null);
  }, [originMarker, destinationMarker, polyline]);

  return (
    <Container>
      <MapContainer id="map" />
      <InputContainer>
        <StatusButton selected={!!originCoords}>
          {originCoords ? "출발지 설정됨" : "출발지 미설정"}
        </StatusButton>
        <StatusButton selected={!!destinationCoords}>
          {destinationCoords ? "목적지 설정됨" : "목적지 미설정"}
        </StatusButton>
        <button onClick={getCarDirection}>경로 구하기</button>
        <button onClick={resetMarkers}>마커 초기화</button>
        <br />
        <br />
        <br />
        <br />
      </InputContainer>
    </Container>
  );
};

export default WalkingMap;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const InputContainer = styled.div`
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
`;

const MapContainer = styled.div`
  width: 100%;
  height: 300px;
`;

const StatusButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: ${(props) => (props.selected ? "#4CAF50" : "#f0f0f0")};
  color: ${(props) => (props.selected ? "#fff" : "#000")};
  border: none;
  border-radius: 4px;
  cursor: ${(props) => (props.selected ? "default" : "pointer")};
`;
