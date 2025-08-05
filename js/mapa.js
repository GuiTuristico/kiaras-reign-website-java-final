
        // Variables globales para el mapa
        let map;
        let directionsService;
        let directionsRenderer;
        let businessLocation = { lat: 40.4697006, lng: -3.4480143 }; // Torrejón de Ardoz
        let userLocation = null;
        let businessMarker;
        let userMarker;

        // Inicializar el mapa
        function initMap() {
            console.log('Inicializando mapa...');
            
            // mapa centrado en la ubicación del negocio
            map = new google.maps.Map(document.getElementById('google-map'), {
                zoom: 13,
                center: businessLocation,
                mapTypeId: 'roadmap'
            });

            // Inicializar servicios de direcciones
            directionsService = new google.maps.DirectionsService();
            directionsRenderer = new google.maps.DirectionsRenderer({
                draggable: true,
                panel: null
            });
            directionsRenderer.setMap(map);

            // Marcador del negocio
            businessMarker = new google.maps.Marker({
                position: businessLocation,
                map: map,
                title: 'Kiaras Reign - El Reino de la Pequeña Kiara',
                icon: {
                    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                        <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="20" cy="20" r="18" fill="#D4A574" stroke="#8B4513" stroke-width="2"/>
                            <text x="20" y="26" text-anchor="middle" font-size="16" fill="white">👑</text>
                        </svg>
                    `),
                    scaledSize: new google.maps.Size(40, 40)
                }
            });

            // Info window para el negocio
            const businessInfoWindow = new google.maps.InfoWindow({
                content: `
                    <div style="padding: 10px; max-width: 250px;">
                        <h3 style="margin: 0 0 10px 0; color: #8B4513;">👑 Kiaras Reign</h3>
                        <p style="margin: 5px 0;"><strong>El Reino de la Pequeña Kiara</strong></p>
                        <p style="margin: 5px 0;">📍 Av. Premios Nobel, 5<br>28850 Torrejón de Ardoz, Madrid</p>
                        <p style="margin: 5px 0;">📞 +34 (91) 123-4567</p>
                        <p style="margin: 5px 0;">⏰ Lun-Vie: 9:00-18:00</p>
                    </div>
                `
            });

            businessMarker.addListener('click', () => {
                businessInfoWindow.open(map, businessMarker);
            });

            // Event listeners para los botones
            setupEventListeners();
        }

        function setupEventListeners() {
            const getLocationBtn = document.getElementById('get-location-btn');
            const calculateRouteBtn = document.getElementById('calculate-route-btn');
            const clearRouteBtn = document.getElementById('clear-route-btn');
            const destinationInput = document.getElementById('destination-input');

            if (getLocationBtn) {
                getLocationBtn.addEventListener('click', getUserLocation);
            }

            if (calculateRouteBtn) {
                calculateRouteBtn.addEventListener('click', calculateRoute);
            }

            if (clearRouteBtn) {
                clearRouteBtn.addEventListener('click', clearRoute);
            }

            if (destinationInput) {
                destinationInput.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') {
                        calculateRoute();
                    }
                });
            }
        }

        function getUserLocation() {
            const getLocationBtn = document.getElementById('get-location-btn');
            
            if (!navigator.geolocation) {
                alert('La geolocalización no es compatible con este navegador.');
                return;
            }

            getLocationBtn.textContent = '📍 Obteniendo ubicación...';
            getLocationBtn.disabled = true;

            navigator.geolocation.getCurrentPosition(
                function(position) {
                    userLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };

                    // Crear marcador del usuario
                    if (userMarker) {
                        userMarker.setMap(null);
                    }

                    userMarker = new google.maps.Marker({
                        position: userLocation,
                        map: map,
                        title: 'Tu ubicación',
                        icon: {
                            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                                <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="15" cy="15" r="13" fill="#4285F4" stroke="white" stroke-width="2"/>
                                    <circle cx="15" cy="15" r="5" fill="white"/>
                                </svg>
                            `),
                            scaledSize: new google.maps.Size(30, 30)
                        }
                    });

                    // Info window para el usuario
                    const userInfoWindow = new google.maps.InfoWindow({
                        content: `
                            <div style="padding: 10px;">
                                <h4 style="margin: 0 0 5px 0;">📍 Tu ubicación</h4>
                                <p style="margin: 0;">Lat: ${userLocation.lat.toFixed(6)}</p>
                                <p style="margin: 0;">Lng: ${userLocation.lng.toFixed(6)}</p>
                            </div>
                        `
                    });

                    userMarker.addListener('click', () => {
                        userInfoWindow.open(map, userMarker);
                    });

                    // Ajustar vista para mostrar ambos marcadores
                    const bounds = new google.maps.LatLngBounds();
                    bounds.extend(businessLocation);
                    bounds.extend(userLocation);
                    map.fitBounds(bounds);

                    getLocationBtn.textContent = '✅ Ubicación obtenida';
                    getLocationBtn.disabled = false;

                    // Calcular ruta automáticamente
                    calculateRouteFromCoordinates(userLocation, businessLocation);
                },
                function(error) {
                    console.error('Error obteniendo ubicación:', error);
                    let errorMessage = 'No se pudo obtener tu ubicación. ';
                    
                    switch(error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage += 'Permiso denegado. Por favor, permite el acceso a tu ubicación.';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage += 'Ubicación no disponible.';
                            break;
                        case error.TIMEOUT:
                            errorMessage += 'Tiempo de espera agotado.';
                            break;
                        default:
                            errorMessage += 'Error desconocido.';
                            break;
                    }
                    
                    alert(errorMessage);
                    getLocationBtn.textContent = '📍 Obtener mi ubicación';
                    getLocationBtn.disabled = false;
                }
            );
        }

        function calculateRoute() {
            const destinationInput = document.getElementById('destination-input');
            const address = destinationInput.value.trim();

            if (!address && !userLocation) {
                alert('Por favor, introduce una dirección o obtén tu ubicación primero.');
                return;
            }

            if (address) {
                // Geocodificar la dirección introducida
                const geocoder = new google.maps.Geocoder();
                geocoder.geocode({ address: address }, function(results, status) {
                    if (status === 'OK') {
                        const location = results[0].geometry.location;
                        calculateRouteFromCoordinates(location, businessLocation);
                    } else {
                        alert('No se pudo encontrar la dirección introducida. Por favor, verifica la dirección.');
                    }
                });
            } else if (userLocation) {
                calculateRouteFromCoordinates(userLocation, businessLocation);
            }
        }

        function calculateRouteFromCoordinates(origin, destination) {
            const request = {
                origin: origin,
                destination: destination,
                travelMode: google.maps.TravelMode.DRIVING
            };

            directionsService.route(request, function(result, status) {
                if (status === 'OK') {
                    directionsRenderer.setDirections(result);
                    
                    // Mostrar información de la ruta
                    const route = result.routes[0];
                    const leg = route.legs[0];
                    
                    document.getElementById('route-distance').textContent = `Distancia: ${leg.distance.text}`;
                    document.getElementById('route-duration').textContent = `Tiempo estimado: ${leg.duration.text}`;
                    document.getElementById('route-info').style.display = 'block';
                    document.getElementById('clear-route-btn').style.display = 'inline-block';
                } else {
                    console.error('Error calculando ruta:', status);
                    alert('No se pudo calcular la ruta. Por favor, inténtalo de nuevo.');
                }
            });
        }

        function clearRoute() {
            directionsRenderer.setDirections({ routes: [] });
            document.getElementById('route-info').style.display = 'none';
            document.getElementById('clear-route-btn').style.display = 'none';
            document.getElementById('destination-input').value = '';
            
            if (userMarker) {
                userMarker.setMap(null);
                userMarker = null;
            }
            
            userLocation = null;
            document.getElementById('get-location-btn').textContent = '📍 Obtener mi ubicación';
            
            // Volver a centrar en el negocio
            map.setCenter(businessLocation);
            map.setZoom(13);
        }

        
        window.initMap = initMap;
    