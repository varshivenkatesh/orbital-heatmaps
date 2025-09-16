        // Global application state
        let currentPage = 'conjunctions';
        let currentView = 'map';
        let sidebarOpen = false;

        // Data storage for each page type
        const dataStore = {};
        const filteredDataStore = {};
        const markersStore = {};
        const mapsStore = {};
        const globesStore = {};
        const currentViews = {};

        // Data configurations for different page types
        const dataConfigs = {
            conjunctions: {
                title: '🔗 Conjunctions',
                searchFields: ['name', 'satellite1_id', 'satellite2_id'],
                filters: [
                    { key: 'all', label: 'All', active: true },
                    { key: 'high', label: 'High Risk' },
                    { key: 'medium', label: 'Medium Risk' },
                    { key: 'low', label: 'Low Risk' }
                ],
                getMarkerStyle: (item) => {
                    const prob = item.properties.collision_probability || 0;
                    if (prob > 0.001) return { color: '#ff4757', radius: 8, class: 'high-risk' };
                    if (prob > 0.0001) return { color: '#ffa726', radius: 6, class: 'medium-risk' };
                    return { color: '#66bb6a', radius: 4, class: 'low-risk' };
                },
                getStats: (data) => {
                    let high = 0, medium = 0, low = 0;
                    data.forEach(item => {
                        const prob = item.properties.collision_probability || 0;
                        if (prob > 0.001) high++;
                        else if (prob > 0.0001) medium++;
                        else low++;
                    });
                    return [
                        { label: 'High Risk (>0.001)', value: high },
                        { label: 'Medium Risk (>0.0001)', value: medium },
                        { label: 'Low Risk', value: low }
                    ];
                },
                filterFunction: (item, filterKey, searchTerm) => {
                    const props = item.properties;
                    const prob = props.collision_probability || 0;
                    
                    // Text search
                    const searchMatch = !searchTerm || 
                        props.name?.toLowerCase().includes(searchTerm) ||
                        props.satellite1_id?.toLowerCase().includes(searchTerm) ||
                        props.satellite2_id?.toLowerCase().includes(searchTerm);
                    
                    // Risk filter
                    let filterMatch = true;
                    if (filterKey === 'high') filterMatch = prob > 0.001;
                    else if (filterKey === 'medium') filterMatch = prob > 0.0001 && prob <= 0.001;
                    else if (filterKey === 'low') filterMatch = prob <= 0.0001;
                    
                    return searchMatch && filterMatch;
                },
                renderListItem: (item) => {
                    const prob = item.properties.collision_probability || 0;
                    const style = dataConfigs.conjunctions.getMarkerStyle(item);
                    return `
                        <div class="data-header">
                            ${item.properties.satellite1_id} ↔ ${item.properties.satellite2_id}
                        </div>
                        <div class="data-details">
                            Risk: ${(prob * 1000000).toFixed(1)}/million<br>
                            Alt: ${item.properties.altitude_km || 'N/A'}km<br>
                            TCA: ${item.properties.tca ? new Date(item.properties.tca).toLocaleDateString() : 'N/A'}
                        </div>
                    `;
                },
                getPopupContent: (item) => {
                    const prob = item.properties.collision_probability || 0;
                    return `
                        <div class="tooltip">
                            <strong>${item.properties.name || 'Conjunction'}</strong><br>
                            <strong>Risk:</strong> ${(prob * 1000000).toFixed(3)}/million<br>
                            <strong>Altitude:</strong> ${item.properties.altitude_km || 'N/A'}km<br>
                            <strong>TCA:</strong> ${item.properties.tca ? new Date(item.properties.tca).toLocaleString() : 'N/A'}<br>
                            <strong>Satellites:</strong> ${item.properties.satellite1_id} & ${item.properties.satellite2_id}
                        </div>
                    `;
                }
            },
            elset: {
                title: '📡 ELSET Data',
                searchFields: ['name', 'satellite_id', 'object_name'],
                filters: [
                    { key: 'all', label: 'All', active: true },
                    { key: 'active', label: 'Active' },
                    { key: 'inactive', label: 'Inactive' }
                ],
                getMarkerStyle: (item) => {
                    const status = item.properties.status || 'unknown';
                    if (status.toLowerCase() === 'active') return { color: '#2196f3', radius: 8, class: 'active-satellite' };
                    return { color: '#757575', radius: 6, class: 'inactive-satellite' };
                },
                getStats: (data) => {
                    let active = 0, inactive = 0;
                    data.forEach(item => {
                        const status = item.properties.status?.toLowerCase() || 'unknown';
                        if (status === 'active') active++;
                        else inactive++;
                    });
                    return [
                        { label: 'Active Satellites', value: active },
                        { label: 'Inactive Satellites', value: inactive }
                    ];
                },
                filterFunction: (item, filterKey, searchTerm) => {
                    const props = item.properties;
                    const status = props.status?.toLowerCase() || 'unknown';
                    
                    const searchMatch = !searchTerm || 
                        props.name?.toLowerCase().includes(searchTerm) ||
                        props.satellite_id?.toLowerCase().includes(searchTerm) ||
                        props.object_name?.toLowerCase().includes(searchTerm);
                    
                    let filterMatch = true;
                    if (filterKey === 'active') filterMatch = status === 'active';
                    else if (filterKey === 'inactive') filterMatch = status !== 'active';
                    
                    return searchMatch && filterMatch;
                },
                renderListItem: (item) => {
                    const style = dataConfigs.elset.getMarkerStyle(item);
                    return `
                        <div class="data-header">
                            ${item.properties.object_name || item.properties.name || 'Satellite'}
                        </div>
                        <div class="data-details">
                            ID: ${item.properties.satellite_id || 'N/A'}<br>
                            Status: ${item.properties.status || 'Unknown'}<br>
                            Epoch: ${item.properties.epoch ? new Date(item.properties.epoch).toLocaleDateString() : 'N/A'}
                        </div>
                    `;
                },
                getPopupContent: (item) => {
                    return `
                        <div class="tooltip">
                            <strong>${item.properties.object_name || item.properties.name || 'Satellite'}</strong><br>
                            <strong>ID:</strong> ${item.properties.satellite_id || 'N/A'}<br>
                            <strong>Status:</strong> ${item.properties.status || 'Unknown'}<br>
                            <strong>Epoch:</strong> ${item.properties.epoch ? new Date(item.properties.epoch).toLocaleString() : 'N/A'}<br>
                            <strong>Mean Motion:</strong> ${item.properties.mean_motion || 'N/A'}/day
                        </div>
                    `;
                }
            },
            sgi: {
                searchFields: ['id', 'object_name', 'satellite_name', 'name', 'source', 'state', 'classification'],
                filters: [
                    { key: 'all', label: 'All', active: true },
                    { key: 'active', label: 'Active' },
                    { key: 'predicted', label: 'Predicted' },
                    { key: 'agi', label: 'AGI Source' },
                    { key: 'high-solar', label: 'High Solar Activity' }
                ],
                getMarkerStyle: (item) => {
                    const state = item.properties.state;
                    const f10 = item.properties.f10 || 0;
                    if (state === 'A') return { color: '#4caf50', radius: 8, class: 'active-sgi' };
                    if (state === 'P') return { color: '#ff9800', radius: 6, class: 'predicted-sgi' };
                    if (f10 > 200) return { color: '#f44336', radius: 10, class: 'high-solar' };
                    return { color: '#9e9e9e', radius: 5, class: 'default-sgi' };
                },
                getStats: (data) => {
                    let active = 0, predicted = 0, highSolar = 0;
                    data.forEach(item => {
                        const state = item.properties.state;
                        const f10 = item.properties.f10 || 0;
                        if (state === 'A') active++;
                        if (state === 'P') predicted++;
                        if (f10 > 200) highSolar++;
                    });
                    return [
                        { label: 'Active', value: active },
                        { label: 'Predicted', value: predicted },
                        { label: 'High Solar Activity', value: highSolar }
                    ];
                },
                filterFunction: (item, filterKey, searchTerm) => {
                    const props = item.properties;
                    
                    const searchMatch = !searchTerm || 
                        props.id?.toLowerCase().includes(searchTerm) ||
                        props.object_name?.toLowerCase().includes(searchTerm) ||
                        props.satellite_name?.toLowerCase().includes(searchTerm) ||
                        props.name?.toLowerCase().includes(searchTerm) ||
                        props.source?.toLowerCase().includes(searchTerm) ||
                        props.state?.toLowerCase().includes(searchTerm) ||
                        props.classification?.toLowerCase().includes(searchTerm);
                    
                    let filterMatch = true;
                    if (filterKey === 'active') filterMatch = props.state === 'A';
                    else if (filterKey === 'predicted') filterMatch = props.state === 'P';
                    else if (filterKey === 'agi') filterMatch = props.source === 'AGI';
                    else if (filterKey === 'high-solar') filterMatch = (props.f10 || 0) > 200;
                    
                    return searchMatch && filterMatch;
                },
                renderListItem: (item) => {
                    const style = dataConfigs.sgi.getMarkerStyle(item);
                    const displayName = item.properties.object_name || 
                                      item.properties.satellite_name || 
                                      item.properties.name || 
                                      `SGI-${(item.properties.id || '').substring(0, 8)}` ||
                                      'SGI Object';
                    return `
                        <div class="data-header">
                            ${displayName}
                        </div>
                        <div class="data-details">
                            Source: ${item.properties.source || 'N/A'}<br>
                            State: ${item.properties.state || 'N/A'}<br>
                            F10.7: ${item.properties.f10 || 'N/A'}
                        </div>
                    `;
                },
                getPopupContent: (item) => {
                    const displayName = item.properties.object_name || 
                                      item.properties.satellite_name || 
                                      item.properties.name || 
                                      `SGI-${(item.properties.id || '').substring(0, 8)}` ||
                                      'SGI Object';
                    return `
                        <div class="tooltip">
                            <strong>${displayName}</strong><br>
                            <strong>ID:</strong> ${(item.properties.id || '').substring(0, 8)}...<br>
                            <strong>Source:</strong> ${item.properties.source || 'N/A'}<br>
                            <strong>State:</strong> ${item.properties.state || 'N/A'}<br>
                            <strong>Classification:</strong> ${item.properties.classification || 'N/A'}<br>
                            <strong>F10.7:</strong> ${item.properties.f10 || 'N/A'}<br>
                            <strong>Epoch:</strong> ${item.properties.epoch ? new Date(item.properties.epoch).toLocaleString() : 'N/A'}
                        </div>
                    `;
                }
            },
            statevector: {
                title: '📊 StateVector Data',
                searchFields: ['name', 'satellite_id', 'epoch'],
                filters: [
                    { key: 'all', label: 'All', active: true },
                    { key: 'recent', label: 'Recent (24h)' },
                    { key: 'leo', label: 'LEO' },
                    { key: 'geo', label: 'GEO' }
                ],
                getMarkerStyle: (item) => {
                    const altitude = item.properties.altitude_km || item.geometry.coordinates[2] / 1000 || 0;
                    if (altitude > 35000) return { color: '#9c27b0', radius: 8, class: 'geo-satellite' };
                    if (altitude < 2000) return { color: '#00bcd4', radius: 6, class: 'leo-satellite' };
                    return { color: '#ff5722', radius: 7, class: 'meo-satellite' };
                },
                getStats: (data) => {
                    let leo = 0, meo = 0, geo = 0;
                    data.forEach(item => {
                        const altitude = item.properties.altitude_km || item.geometry.coordinates[2] / 1000 || 0;
                        if (altitude > 35000) geo++;
                        else if (altitude < 2000) leo++;
                        else meo++;
                    });
                    return [
                        { label: 'LEO (<2000km)', value: leo },
                        { label: 'MEO (2000-35000km)', value: meo },
                        { label: 'GEO (>35000km)', value: geo }
                    ];
                },
                filterFunction: (item, filterKey, searchTerm) => {
                    const props = item.properties;
                    const altitude = props.altitude_km || item.geometry.coordinates[2] / 1000 || 0;
                    
                    const searchMatch = !searchTerm || 
                        props.name?.toLowerCase().includes(searchTerm) ||
                        props.satellite_id?.toLowerCase().includes(searchTerm) ||
                        props.epoch?.toLowerCase().includes(searchTerm);
                    
                    let filterMatch = true;
                    if (filterKey === 'recent') {
                        const epochDate = new Date(props.epoch);
                        const now = new Date();
                        const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                        filterMatch = epochDate > dayAgo;
                    } else if (filterKey === 'leo') filterMatch = altitude < 2000;
                    else if (filterKey === 'geo') filterMatch = altitude > 35000;
                    
                    return searchMatch && filterMatch;
                },
                renderListItem: (item) => {
                    const altitude = item.properties.altitude_km || item.geometry.coordinates[2] / 1000 || 0;
                    return `
                        <div class="data-header">
                            ${item.properties.name || item.properties.satellite_id || 'Satellite'}
                        </div>
                        <div class="data-details">
                            ID: ${item.properties.satellite_id || 'N/A'}<br>
                            Alt: ${altitude.toFixed(1)}km<br>
                            Epoch: ${item.properties.epoch ? new Date(item.properties.epoch).toLocaleDateString() : 'N/A'}
                        </div>
                    `;
                },
                getPopupContent: (item) => {
                    const altitude = item.properties.altitude_km || item.geometry.coordinates[2] / 1000 || 0;
                    return `
                        <div class="tooltip">
                            <strong>${item.properties.name || item.properties.satellite_id || 'Satellite'}</strong><br>
                            <strong>ID:</strong> ${item.properties.satellite_id || 'N/A'}<br>
                            <strong>Altitude:</strong> ${altitude.toFixed(1)}km<br>
                            <strong>Epoch:</strong> ${item.properties.epoch ? new Date(item.properties.epoch).toLocaleString() : 'N/A'}<br>
                            <strong>Velocity:</strong> ${item.properties.velocity_kms || 'N/A'} km/s
                        </div>
                    `;
                }
            }
        };

        // Initialize application
        function initApp() {
            // Initialize maps for all page types
            Object.keys(dataConfigs).forEach(pageType => {
                currentViews[pageType] = 'map';
                dataStore[pageType] = [];
                filteredDataStore[pageType] = [];
                markersStore[pageType] = [];
                initMap(pageType);
                loadData(pageType);
            });

            setupEventListeners();
        }

        // Initialize map for a specific page type
        function initMap(pageType) {
            const mapContainer = document.getElementById(`${pageType}-mapView`);
            if (!mapContainer) {
                console.error(`Map container not found: ${pageType}-mapView`);
                return;
            }

            // Ensure container has dimensions
            mapContainer.style.width = '100%';
            mapContainer.style.height = '100%';

            const map = L.map(mapContainer, {
                center: [0, 0],
                zoom: 2,
                preferCanvas: true
            });

            // Add different base layers
            const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                attribution: 'Tiles &copy; Esri'
            });

            const dark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
            });

            satellite.addTo(map);

            // Add layer control
            L.control.layers({
                'Satellite': satellite,
                'Dark': dark
            }).addTo(map);

            mapsStore[pageType] = map;
            
            // Force map to recognize its container size
            setTimeout(() => {
                map.invalidateSize();
            }, 100);
        }

        // Initialize 3D globe for a specific page type
        function initGlobe(pageType) {
            const container = document.getElementById(`${pageType}-globeView`);
            if (!container || globesStore[pageType]) return;

            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
            const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            
            renderer.setSize(container.clientWidth, container.clientHeight);
            renderer.setClearColor(0x000011);
            container.appendChild(renderer.domElement);

            // Create Earth sphere
            const earthGeometry = new THREE.SphereGeometry(5, 64, 64);
            
            // Create a basic blue material as fallback
            const earthMaterial = new THREE.MeshPhongMaterial({ 
                color: 0x6B93D6,
                shininess: 0.5
            });
            
            // Try to load Earth texture
            const textureLoader = new THREE.TextureLoader();
            textureLoader.load(
                'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
                (texture) => {
                    earthMaterial.map = texture;
                    earthMaterial.needsUpdate = true;
                },
                undefined,
                (error) => {
                    console.log('Failed to load Earth texture, using solid color');
                }
            );
            
            const earth = new THREE.Mesh(earthGeometry, earthMaterial);
            scene.add(earth);

            // Add atmosphere effect
            const atmosphereGeometry = new THREE.SphereGeometry(5.1, 64, 64);
            const atmosphereMaterial = new THREE.MeshPhongMaterial({
                color: 0x87CEEB,
                transparent: true,
                opacity: 0.15
            });
            const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
            scene.add(atmosphere);

            // Add lighting
            const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
            scene.add(ambientLight);
            
            const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
            directionalLight.position.set(10, 5, 5);
            scene.add(directionalLight);

            // Position camera
            camera.position.z = 15;

            // Mouse interaction variables
            let isMouseDown = false;
            let mouseX = 0, mouseY = 0;
            let previousMousePosition = { x: 0, y: 0 };

            // Mouse event listeners
            container.addEventListener('mousedown', (event) => {
                isMouseDown = true;
                previousMousePosition.x = event.clientX;
                previousMousePosition.y = event.clientY;
            });

            container.addEventListener('mouseup', () => {
                isMouseDown = false;
            });

            container.addEventListener('mousemove', (event) => {
                if (isMouseDown) {
                    const deltaMove = {
                        x: event.clientX - previousMousePosition.x,
                        y: event.clientY - previousMousePosition.y
                    };

                    const deltaRotationQuaternion = new THREE.Quaternion()
                        .setFromEuler(new THREE.Euler(
                            deltaMove.y * 0.01,
                            deltaMove.x * 0.01,
                            0,
                            'XYZ'
                        ));

                    earth.quaternion.multiplyQuaternions(deltaRotationQuaternion, earth.quaternion);
                    atmosphere.quaternion.copy(earth.quaternion);

                    previousMousePosition.x = event.clientX;
                    previousMousePosition.y = event.clientY;
                }
            });

            // Zoom with mouse wheel
            container.addEventListener('wheel', (event) => {
                event.preventDefault();
                camera.position.z += event.deltaY * 0.01;
                camera.position.z = Math.max(8, Math.min(50, camera.position.z));
            });

            // Animation loop
            function animate() {
                requestAnimationFrame(animate);
                
                // Gentle auto-rotation
                if (!isMouseDown) {
                    earth.rotation.y += 0.002;
                    atmosphere.rotation.y += 0.002;
                }
                
                renderer.render(scene, camera);
            }
            animate();

            // Store globe references
            globesStore[pageType] = { 
                scene, 
                camera, 
                renderer, 
                earth, 
                atmosphere,
                container,
                markers: [] // Store markers for this globe
            };
        }

        // Load data for a specific page type
        function loadData(pageType) {
            showLoading(`Loading ${dataConfigs[pageType].title}...`);
            
            // Try to fetch real data first
            const fileName = `${pageType}.geojson`;
            
            fetch(fileName)
                .then(response => {
                    if (!response.ok) throw new Error('File not found');
                    return response.json();
                })
                .then(data => {
                    if (data.features && Array.isArray(data.features)) {
                        dataStore[pageType] = data.features;
                    } else {
                        throw new Error('Invalid GeoJSON format');
                    }
                })
                .catch(() => {
                    // Use sample data if file doesn't exist or is invalid
                    console.log(`Using sample data for ${pageType}`);
                    // dataStore[pageType] = generateSampleData(pageType);
                })
                .finally(() => {
                    hideLoading();
                    processData(pageType);
                });
        }

        // Process and display data for a specific page type
        function processData(pageType) {
            const data = dataStore[pageType];
            const config = dataConfigs[pageType];
            
            // Update statistics
            updateStats(pageType, data);
            
            // Setup filters
            setupFilters(pageType);
            
            // Apply initial filters
            applyFilters(pageType);
        }

        // Update statistics display
        function updateStats(pageType, data) {
            document.getElementById('totalCount').textContent = data.length;
            
            const config = dataConfigs[pageType];
            const stats = config.getStats(data);
            
            const statsContent = document.getElementById('statsContent');
            statsContent.innerHTML = stats.map(stat => `
                <div class="stat-item">
                    <span>${stat.label}:</span>
                    <span>${stat.value}</span>
                </div>
            `).join('');
        }

        // Setup filter buttons for a page type
        function setupFilters(pageType) {
            const config = dataConfigs[pageType];
            const filterButtons = document.getElementById('filterButtons');
            
            filterButtons.innerHTML = config.filters.map(filter => `
                <button class="filter-button ${filter.active ? 'active' : ''}" 
                        data-filter="${filter.key}" 
                        onclick="setFilter('${pageType}', '${filter.key}')">
                    ${filter.label}
                </button>
            `).join('');
        }

        // Set active filter
        function setFilter(pageType, filterKey) {
            document.querySelectorAll('.filter-button').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.filter === filterKey);
            });
            applyFilters(pageType);
        }

        // Apply filters to data
        function applyFilters(pageType) {
            const data = dataStore[pageType];
            const config = dataConfigs[pageType];
            const searchTerm = document.getElementById('searchInput').value.toLowerCase();
            const activeFilter = document.querySelector('.filter-button.active').dataset.filter;

            filteredDataStore[pageType] = data.filter(item => 
                config.filterFunction(item, activeFilter, searchTerm)
            );

            updateDataList(pageType);
            updateMapMarkers(pageType);
            
            if (currentViews[pageType] === 'globe') {
                updateGlobeMarkers(pageType);
            }
        }

        // Update data list in sidebar
        function updateDataList(pageType) {
            const data = filteredDataStore[pageType];
            const config = dataConfigs[pageType];
            const list = document.getElementById('dataList');
            
            list.innerHTML = data.map((item, index) => {
                const style = config.getMarkerStyle(item);
                return `
                    <div class="data-item ${style.class}" 
                         onclick="selectDataItem('${pageType}', ${index})">
                        ${config.renderListItem(item)}
                    </div>
                `;
            }).join('');
        }

        // Select a specific data item
        function selectDataItem(pageType, index) {
            const item = filteredDataStore[pageType][index];
            
            // Highlight in list
            document.querySelectorAll('.data-item').forEach((elem, i) => {
                elem.classList.toggle('selected', i === index);
            });

            // Center map/globe on item
            const coords = item.geometry.coordinates;
            
            if (currentViews[pageType] === 'map' && mapsStore[pageType]) {
                mapsStore[pageType].setView([coords[1], coords[0]], 6);
            } else if (currentViews[pageType] === 'globe' && globesStore[pageType]) {
                // For globe, we could implement smooth camera movement here
                focusGlobeOnPoint(pageType, coords[1], coords[0]);
            }
        }

        // Focus globe camera on a specific point
        function focusGlobeOnPoint(pageType, lat, lng) {
            const globe = globesStore[pageType];
            if (!globe) return;

            // Convert lat/lng to 3D position
            const phi = (90 - lat) * Math.PI / 180;
            const theta = (lng + 180) * Math.PI / 180;

            const targetPosition = new THREE.Vector3();
            targetPosition.x = 15 * Math.sin(phi) * Math.cos(theta);
            targetPosition.y = 15 * Math.cos(phi);
            targetPosition.z = 15 * Math.sin(phi) * Math.sin(theta);

            // Smooth camera movement (basic implementation)
            const startPosition = globe.camera.position.clone();
            const steps = 60;
            let step = 0;

            function animate() {
                if (step < steps) {
                    const progress = step / steps;
                    const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic
                    
                    globe.camera.position.lerpVectors(startPosition, targetPosition, easeProgress);
                    globe.camera.lookAt(0, 0, 0);
                    
                    step++;
                    requestAnimationFrame(animate);
                }
            }
            animate();
        }

        // Update map markers for a specific page type
        function updateMapMarkers(pageType) {
            const map = mapsStore[pageType];
            const data = filteredDataStore[pageType];
            const config = dataConfigs[pageType];
            
            if (!map) return;

            // Clear existing markers
            if (markersStore[pageType]) {
                markersStore[pageType].forEach(marker => map.removeLayer(marker));
            }
            markersStore[pageType] = [];

            // Add new markers
            data.forEach(item => {
                const coords = item.geometry.coordinates;
                const lat = coords[1];
                const lng = coords[0];
                const style = config.getMarkerStyle(item);

                const marker = L.circleMarker([lat, lng], {
                    radius: style.radius,
                    fillColor: style.color,
                    color: 'white',
                    weight: 2,
                    opacity: 0.8,
                    fillOpacity: 0.6
                });

                marker.bindPopup(config.getPopupContent(item));
                marker.addTo(map);
                markersStore[pageType].push(marker);
            });
        }

        // Update globe markers for a specific page type
        function updateGlobeMarkers(pageType) {
            const globe = globesStore[pageType];
            const data = filteredDataStore[pageType];
            const config = dataConfigs[pageType];
            
            if (!globe) return;

            // Clear existing markers
            globe.markers.forEach(marker => globe.earth.remove(marker)); // remove from earth
            globe.markers = [];

            // Add new markers
            data.forEach(item => {
                const coords = item.geometry.coordinates;
                const lat = coords[1]; // latitude in degrees
                const lng = coords[0]; // longitude in degrees
                const style = config.getMarkerStyle(item);

                // Convert lat/lng to 3D coordinates on sphere surface
                const phi = (90 - lat) * Math.PI / 180; // polar angle
                const theta = (lng + 180) * Math.PI / 180; // azimuthal angle
                
                const radius = 5.1; // slightly above Earth surface
                const x = radius * Math.sin(phi) * Math.cos(theta);
                const y = radius * Math.cos(phi);
                const z = radius * Math.sin(phi) * Math.sin(theta);

                // Create marker
                const markerSize = 0.05 + (style.radius * 0.005);
                const markerGeometry = new THREE.SphereGeometry(markerSize, 16, 16);
                const markerMaterial = new THREE.MeshPhongMaterial({ 
                    color: new THREE.Color(style.color),
                    emissive: new THREE.Color(style.color).multiplyScalar(0.2)
                });
                const marker = new THREE.Mesh(markerGeometry, markerMaterial);
                marker.position.set(x, y, z);

                // Attach marker to the earth mesh so it rotates with it
                globe.earth.add(marker);

                // Store reference
                marker.userData = item;
                globe.markers.push(marker);
            });

            console.log(`Added ${globe.markers.length} markers to ${pageType} globe`);
        }

        // Page switching functionality
        function switchPage(pageType) {
            // Update nav buttons
            document.querySelectorAll('.nav-button').forEach(btn => {
                btn.classList.remove('active');
            });
            event.target.classList.add('active');

            // Hide all pages
            document.querySelectorAll('.page').forEach(page => {
                page.classList.remove('active');
            });

            // Show selected page
            document.getElementById(`${pageType}-page`).classList.add('active');

            // Update sidebar title
            document.getElementById('sidebarTitle').textContent = dataConfigs[pageType].title;

            // Update search placeholder
            const searchFields = dataConfigs[pageType].searchFields.join(', ');
            document.getElementById('searchInput').placeholder = `Search ${searchFields}...`;

            // Update current page
            currentPage = pageType;
            currentView = currentViews[pageType];

            // Update view toggle text
            const viewToggleText = document.getElementById('viewToggleText');
            viewToggleText.textContent = currentView === 'map' ? 'Switch to 3D Globe' : 'Switch to 2D Map';

            // Refresh map size
            setTimeout(() => {
                if (mapsStore[pageType]) {
                    mapsStore[pageType].invalidateSize();
                }
            }, 100);

            // Update sidebar with current page data
            processData(pageType);
        }

        // Toggle between map and globe views
        function toggleView() {
            const currentPageType = currentPage;
            const mapView = document.getElementById(`${currentPageType}-mapView`);
            const globeView = document.getElementById(`${currentPageType}-globeView`);
            const toggleText = document.getElementById('viewToggleText');

            if (currentViews[currentPageType] === 'map') {
                mapView.classList.add('hidden');
                globeView.classList.remove('hidden');
                toggleText.textContent = 'Switch to 2D Map';
                currentViews[currentPageType] = 'globe';
                currentView = 'globe';
                
                if (!globesStore[currentPageType]) {
                    initGlobe(currentPageType);
                }
                updateGlobeMarkers(currentPageType);
            } else {
                globeView.classList.add('hidden');
                mapView.classList.remove('hidden');
                toggleText.textContent = 'Switch to 3D Globe';
                currentViews[currentPageType] = 'map';
                currentView = 'map';
                
                updateMapMarkers(currentPageType);
            }
        }

        // Sidebar toggle functionality
        function toggleSidebar() {
            const sidebar = document.getElementById('sidebar');
            const mainContent = document.getElementById('mainContent');
            const toggleBtn = document.querySelector('.sidebar-toggle');
            const toggleIcon = document.getElementById('sidebarToggleIcon');

            sidebarOpen = !sidebarOpen;

            if (sidebarOpen) {
                sidebar.classList.add('open');
                mainContent.classList.add('sidebar-open');
                toggleBtn.classList.add('open');
                toggleIcon.textContent = '✕';
            } else {
                sidebar.classList.remove('open');
                mainContent.classList.remove('sidebar-open');
                toggleBtn.classList.remove('open');
                toggleIcon.textContent = '☰';
            }

            // Invalidate map size after sidebar animation
            setTimeout(() => {
                if (mapsStore[currentPage]) {
                    mapsStore[currentPage].invalidateSize();
                }
            }, 300);
        }

        // Refresh data for current page
        function refreshData() {
            loadData(currentPage);
        }

        // Open external dashboard
        function openDashboard() {
            window.open('https://lookerstudio.google.com/reporting/6b4f4559-7c93-4148-bd42-b14867e0c273', '_blank');
        }

        // Show loading indicator
        function showLoading(message = 'Loading...') {
            const loading = document.getElementById('loading');
            const loadingText = document.getElementById('loadingText');
            loadingText.textContent = message;
            loading.classList.remove('hidden');
        }

        // Hide loading indicator
        function hideLoading() {
            document.getElementById('loading').classList.add('hidden');
        }

        // Setup event listeners
        function setupEventListeners() {
            // Search input
            document.getElementById('searchInput').addEventListener('input', () => {
                applyFilters(currentPage);
            });

            // Handle window resize
            window.addEventListener('resize', () => {
                // Resize maps
                Object.values(mapsStore).forEach(map => {
                    if (map) map.invalidateSize();
                });

                // Resize globes
                Object.entries(globesStore).forEach(([pageType, globe]) => {
                    if (globe && currentViews[pageType] === 'globe') {
                        const container = globe.container;
                        globe.camera.aspect = container.clientWidth / container.clientHeight;
                        globe.camera.updateProjectionMatrix();
                        globe.renderer.setSize(container.clientWidth, container.clientHeight);
                    }
                });
            });
        }

        // Initialize the application when DOM is ready
        document.addEventListener('DOMContentLoaded', () => {
            initApp();

        });
