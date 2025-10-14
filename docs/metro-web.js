// Metro City Generator - Web Interface
// This file provides the web interface for the Metro city generation system

class HierarchicalSeedGenerator {
    constructor() {
        this.masterSeed = 0;
        this.rngs = new Map();
    }

    setMasterSeed(seed) {
        this.masterSeed = seed;
        this.rngs.clear();
    }

    getRNG(key) {
        if (!this.rngs.has(key)) {
            // Create a new RNG for this key
            const seed = this.generateSeed(key);
            this.rngs.set(key, new SeededRandom(seed));
        }
        return this.rngs.get(key);
    }

    generateSeed(key) {
        // Simple hash function to generate seed from key
        let hash = this.masterSeed;
        for (let i = 0; i < key.length; i++) {
            hash = ((hash << 5) - hash + key.charCodeAt(i)) & 0xffffffff;
        }
        return Math.abs(hash);
    }

    uniform(min = 0, max = 1) {
        return this.getRNG('default').uniform(min, max);
    }

    choice(array) {
        return this.getRNG('default').choice(array);
    }

    randint(min, max) {
        return this.getRNG('default').randint(min, max);
    }
}

class SeededRandom {
    constructor(seed) {
        this.seed = seed;
        this.current = seed;
    }

    next() {
        // Linear congruential generator
        this.current = (this.current * 1664525 + 1013904223) % 4294967296;
        return this.current / 4294967296;
    }

    uniform(min = 0, max = 1) {
        return min + this.next() * (max - min);
    }

    choice(array) {
        const index = Math.floor(this.next() * array.length);
        return array[index];
    }

    randint(min, max) {
        return Math.floor(this.uniform(min, max + 1));
    }
}

class MetroCityGenerator {
    constructor() {
        this.canvas = document.getElementById('cityCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.currentCity = null;
        this.temporalData = null;
        this.seedGenerator = new HierarchicalSeedGenerator();
        this.currentYear = 0;
        this.isPlaying = false;
        this.playInterval = null;
        
        // Set up canvas
        this.setupCanvas();
        this.setupTemporalControls();
    }

    setupCanvas() {
        // Make canvas responsive
        const resizeCanvas = () => {
            const container = this.canvas.parentElement;
            const containerWidth = container.clientWidth - 40; // Account for padding
            const aspectRatio = 4/3;
            
            this.canvas.width = Math.min(containerWidth, 1200);
            this.canvas.height = this.canvas.width / aspectRatio;
            
            if (this.currentCity) {
                this.renderCity();
            }
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
    }

    async generateCity() {
        const population = parseInt(document.getElementById('population').value);
        const masterSeed = parseInt(document.getElementById('seed').value);
        const citySize = parseFloat(document.getElementById('citySize').value);

        this.showStatus('Generating city...', 'loading');

        try {
            // Create hierarchical seed system
            this.seedGenerator.setMasterSeed(masterSeed);
            
            // Generate city data
            this.currentCity = await this.simulateCity(population, citySize);
            
            // Render the city
            this.renderCity();
            this.updateCityInfo();
            this.showCityInfo();
            
            this.showStatus('City generated successfully!', 'success');
            
        } catch (error) {
            console.error('Error generating city:', error);
            this.showStatus('Error generating city: ' + error.message, 'error');
        }
    }

    async simulateCity(population, citySize) {
        // Create city data structure
        const city = {
            population: population,
            area: citySize * citySize,
            districts: [],
            zones: {},
            infrastructure: [],
            services: []
        };

        // Generate districts
        const numDistricts = Math.max(1, Math.floor(population / 5000));
        for (let i = 0; i < numDistricts; i++) {
            const x = this.seedGenerator.uniform(0, citySize);
            const y = this.seedGenerator.uniform(0, citySize);
            const size = this.seedGenerator.uniform(0.5, 2.0);
            
            const districtTypes = ['residential', 'commercial', 'industrial', 'mixed'];
            const type = this.seedGenerator.choice(districtTypes);
            
            city.districts.push({
                id: `district_${i}`,
                name: `${type.charAt(0).toUpperCase() + type.slice(1)} District ${i + 1}`,
                x: x, y: y, size: size,
                type: type,
                population: Math.floor(population / numDistricts)
            });
        }

        // Generate zones
        city.zones = this.calculateZones(city.districts);

        // Generate infrastructure
        city.infrastructure = this.generateInfrastructure(citySize);

        // Generate services
        city.services = this.generateServices(population, citySize);

        return city;
    }

    calculateZones(districts) {
        const zones = {
            residential: { count: 0, area: 0, population: 0 },
            commercial: { count: 0, area: 0, population: 0 },
            industrial: { count: 0, area: 0, population: 0 },
            mixed: { count: 0, area: 0, population: 0 }
        };

        districts.forEach(district => {
            const zoneType = district.type;
            if (zones[zoneType]) {
                zones[zoneType].count++;
                zones[zoneType].area += district.size;
                zones[zoneType].population += district.population;
            }
        });

        return zones;
    }

    generateInfrastructure(citySize) {
        const infrastructure = [];
        
        // Add some basic roads
        for (let i = 0; i < 5; i++) {
            const x1 = this.seedGenerator.uniform(0, citySize);
            const y1 = this.seedGenerator.uniform(0, citySize);
            const x2 = this.seedGenerator.uniform(0, citySize);
            const y2 = this.seedGenerator.uniform(0, citySize);
            
            infrastructure.push({
                type: 'road',
                x1: x1, y1: y1, x2: x2, y2: y2,
                width: this.seedGenerator.uniform(5, 15),
                importance: this.seedGenerator.randint(1, 5)
            });
        }

        return infrastructure;
    }

    generateServices(population, citySize) {
        const services = [];
        const numServices = Math.max(1, Math.floor(population / 10000));
        
        for (let i = 0; i < numServices; i++) {
            const x = this.seedGenerator.uniform(0, citySize);
            const y = this.seedGenerator.uniform(0, citySize);
            
            const serviceTypes = ['hospital', 'school', 'police', 'fire', 'market'];
            const type = this.seedGenerator.choice(serviceTypes);
            
            services.push({
                id: `service_${i}`,
                type: type,
                x: x, y: y,
                importance: this.seedGenerator.randint(1, 5)
            });
        }

        return services;
    }

    renderCity() {
        if (!this.currentCity) return;

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw background
        this.ctx.fillStyle = '#f0f0f0';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw districts
        this.drawDistricts(this.currentCity.districts);

        // Draw infrastructure
        this.drawInfrastructure(this.currentCity.infrastructure);

        // Draw services
        this.drawServices(this.currentCity.services);

        // Draw legend
        this.drawLegend();
    }

    drawDistricts(districts) {
        const ctx = this.ctx;
        const canvas = this.canvas;

        districts.forEach(district => {
            const x = (district.x / 10) * canvas.width;
            const y = (district.y / 10) * canvas.height;
            const size = (district.size / 10) * Math.min(canvas.width, canvas.height);

            // District color based on type
            const colors = {
                residential: '#4ecdc4',
                commercial: '#ff6b6b',
                industrial: '#45b7d1',
                mixed: '#96ceb4'
            };

            ctx.fillStyle = colors[district.type] || '#96ceb4';
            ctx.fillRect(x - size/2, y - size/2, size, size);

            // District border
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 2;
            ctx.strokeRect(x - size/2, y - size/2, size, size);

            // District label
            ctx.fillStyle = '#333';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(district.name, x, y + 3);
        });
    }

    drawInfrastructure(infrastructure) {
        const ctx = this.ctx;
        const canvas = this.canvas;

        infrastructure.forEach(road => {
            const x1 = (road.x1 / 10) * canvas.width;
            const y1 = (road.y1 / 10) * canvas.height;
            const x2 = (road.x2 / 10) * canvas.width;
            const y2 = (road.y2 / 10) * canvas.height;
            const width = Math.max(2, (road.width / 10) * Math.min(canvas.width, canvas.height));

            ctx.strokeStyle = '#666';
            ctx.lineWidth = width;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        });
    }

    drawServices(services) {
        const ctx = this.ctx;
        const canvas = this.canvas;

        services.forEach(service => {
            const x = (service.x / 10) * canvas.width;
            const y = (service.y / 10) * canvas.height;
            const size = 8;

            // Service color and symbol
            const serviceStyles = {
                hospital: { color: '#ff0000', symbol: '✚' },
                school: { color: '#0000ff', symbol: '■' },
                police: { color: '#000080', symbol: '●' },
                fire: { color: '#ffa500', symbol: '●' },
                market: { color: '#FFD700', symbol: '●' }
            };

            const style = serviceStyles[service.type] || { color: '#666', symbol: '●' };

            ctx.fillStyle = style.color;
            ctx.font = `${size * 2}px Arial`;
            ctx.textAlign = 'center';
            ctx.fillText(style.symbol, x, y + size/2);
        });
    }

    drawLegend() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        
        const legendItems = [
            // Zone types
            { color: '#ff6b6b', symbol: '■', label: 'Commercial Zone' },
            { color: '#4ecdc4', symbol: '■', label: 'Residential Zone' },
            { color: '#45b7d1', symbol: '■', label: 'Industrial Zone' },
            { color: '#96ceb4', symbol: '■', label: 'Mixed Use Zone' },
            { color: '#90EE90', symbol: '■', label: 'Park/Green Space' },
            
            // Infrastructure
            { color: '#666', symbol: '—', label: 'Roads & Streets' },
            { color: '#ffd700', symbol: '■', label: 'Power Station' },
            { color: '#00bfff', symbol: '●', label: 'Water Treatment' },
            
            // Services
            { color: '#ff0000', symbol: '✚', label: 'Hospital' },
            { color: '#0000ff', symbol: '■', label: 'School' },
            { color: '#000080', symbol: '●', label: 'Police Station' },
            { color: '#ffa500', symbol: '●', label: 'Fire Station' },
            
            // Key points
            { color: '#8B4513', symbol: '★', label: 'Monument/Landmark' },
            { color: '#800080', symbol: '◆', label: 'Government Building' },
            { color: '#FFD700', symbol: '●', label: 'Market/Commerce' }
        ];
        
        const legendX = canvas.width - 200;
        const legendY = 20;
        const itemHeight = 18;
        const legendWidth = 180;
        const legendHeight = legendItems.length * itemHeight + 20;
        
        // Background
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.fillRect(legendX - 10, legendY - 10, legendWidth, legendHeight);
        
        // Border
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.strokeRect(legendX - 10, legendY - 10, legendWidth, legendHeight);
        
        // Title
        ctx.fillStyle = '#333';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('City Legend', legendX + legendWidth/2 - 10, legendY + 5);
        
        // Legend items
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        
        legendItems.forEach((item, index) => {
            const y = legendY + 20 + index * itemHeight;
            
            // Draw symbol
            ctx.fillStyle = item.color;
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(item.symbol, legendX + 15, y + 5);
            
            // Draw label
            ctx.fillStyle = '#333';
            ctx.font = '11px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(item.label, legendX + 30, y + 5);
        });
    }

    updateCityInfo() {
        if (!this.currentCity) return;

        // Safely update city info elements
        this.updateElement('cityPopulation', this.currentCity.population.toLocaleString());
        this.updateElement('cityArea', this.currentCity.area.toFixed(1));
        this.updateElement('cityDensity', Math.round(this.currentCity.population / this.currentCity.area).toLocaleString());
        this.updateElement('cityDistricts', this.currentCity.districts.length);
        this.updateElement('cityZones', Object.keys(this.currentCity.zones).length);
        this.updateElement('cityMasterSeed', this.seedGenerator.masterSeed);
        this.updateElement('cityGeneratedAt', new Date().toLocaleString());
    }

    updateElement(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
        } else {
            console.warn(`Element with id '${elementId}' not found`);
        }
    }

    showCityInfo() {
        const cityInfo = document.getElementById('cityInfo');
        if (cityInfo) {
            cityInfo.classList.remove('hidden');
        }
    }

    hideCityInfo() {
        const cityInfo = document.getElementById('cityInfo');
        if (cityInfo) {
            cityInfo.classList.add('hidden');
        }
    }

    showStatus(message, type) {
        const status = document.getElementById('status');
        const statusText = document.getElementById('statusText');
        
        statusText.textContent = message;
        status.className = `status ${type}`;
        status.classList.remove('hidden');
        
        // Hide after 3 seconds for success messages
        if (type === 'success') {
            setTimeout(() => {
                status.classList.add('hidden');
            }, 3000);
        }
    }

    loadDefaultCity() {
        // Load the default city from city.json
        fetch('city.json')
            .then(response => response.json())
            .then(data => {
                document.getElementById('population').value = data.population || 100000;
                document.getElementById('seed').value = data.seed || 2944957927;
                document.getElementById('citySize').value = data.city_size || 10;
                this.generateCity();
            })
            .catch(error => {
                console.error('Error loading default city:', error);
                this.showStatus('Error loading default city', 'error');
            });
    }

    exportCity() {
        if (!this.currentCity) {
            this.showStatus('No city to export', 'error');
            return;
        }

        const dataStr = JSON.stringify(this.currentCity, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'city.json';
        link.click();
        URL.revokeObjectURL(url);
    }

    setupTemporalControls() {
        const simulationMode = document.getElementById('simulationMode');
        const temporalControls = document.getElementById('temporalControls');
        const timelineSlider = document.getElementById('timelineSlider');
        const currentYearSpan = document.getElementById('currentYear');
        
        if (!simulationMode || !temporalControls || !timelineSlider || !currentYearSpan) {
            console.warn('Temporal controls not found, skipping setup');
            return;
        }
        
        // Show/hide temporal controls based on mode
        simulationMode.addEventListener('change', (e) => {
            if (e.target.value === 'temporal') {
                temporalControls.style.display = 'block';
                this.generateTemporalCity();
            } else {
                temporalControls.style.display = 'none';
                this.isPlaying = false;
                if (this.playInterval) {
                    clearInterval(this.playInterval);
                    this.playInterval = null;
                }
            }
        });
        
        // Timeline slider
        timelineSlider.addEventListener('input', (e) => {
            this.currentYear = parseInt(e.target.value);
            currentYearSpan.textContent = this.currentYear;
            this.renderTemporalCity();
        });
    }
    
    async generateTemporalCity() {
        const population = parseInt(document.getElementById('population').value);
        const masterSeed = parseInt(document.getElementById('seed').value);
        const citySize = parseFloat(document.getElementById('citySize').value);

        this.showStatus('Generating temporal city evolution...', 'loading');

        try {
            // Create hierarchical seed system
            this.seedGenerator.setMasterSeed(masterSeed);
            
            // Generate temporal city data
            this.temporalData = await this.simulateTemporalCity(population, citySize);
            
            // Set up timeline slider
            const timelineSlider = document.getElementById('timelineSlider');
            const maxYear = Math.max(...this.temporalData.timeline.map(state => state.year));
            timelineSlider.max = maxYear;
            timelineSlider.value = 0;
            
            // Render initial state
            this.renderTemporalCity();
            this.updateTemporalCityInfo();
            this.showCityInfo();
            
            this.showStatus(`Temporal city generated! Evolution from 0 to ${maxYear} AD`, 'success');
            
        } catch (error) {
            console.error('Error generating temporal city:', error);
            this.showStatus('Error generating temporal city: ' + error.message, 'error');
        }
    }
    
    async simulateTemporalCity(population, citySize) {
        // Simulate temporal city evolution
        const temporalData = {
            timeline: [],
            key_points: [],
            roman_grid: {
                cardos: [],
                decumani: [],
                blocks: []
            },
            metadata: {
                city_size: citySize,
                master_seed: this.seedGenerator.masterSeed,
                total_years: 1500
            }
        };
        
        // Create timeline with different eras
        const eras = [
            { name: "Founding", start: 0, end: 50, population: [100, 1000] },
            { name: "Growth", start: 50, end: 200, population: [1000, 10000] },
            { name: "Expansion", start: 200, end: 500, population: [10000, 50000] },
            { name: "Modernization", start: 500, end: 1500, population: [50000, population] }
        ];
        
        // Generate timeline points
        for (let year = 0; year <= 1500; year += 50) {
            const era = eras.find(e => year >= e.start && year < e.end) || eras[eras.length - 1];
            const progress = (year - era.start) / (era.end - era.start);
            const eraPopulation = Math.floor(era.population[0] + (era.population[1] - era.population[0]) * progress);
            const actualPopulation = Math.min(eraPopulation, population);
            
            // Generate city state for this year
            const cityState = await this.generateCityStateForYear(year, actualPopulation, citySize, era.name);
            temporalData.timeline.push(cityState);
        }
        
        // Generate key points
        temporalData.key_points = this.generateKeyPoints(temporalData.timeline);
        
        // Generate Roman grid
        temporalData.roman_grid = this.generateRomanGrid(citySize);
        
        return temporalData;
    }
    
    async generateCityStateForYear(year, population, citySize, era) {
        const rng = this.seedGenerator.getRNG(`temporal.${year}`);
        
        // Calculate city area based on population
        const area = Math.max(1, population / 5000); // 5000 people per km²
        
        // Generate districts based on era
        const districts = this.generateDistrictsForEra(era, population, citySize, rng);
        
        // Generate zones
        const zones = this.generateZonesForEra(era, districts, rng);
        
        // Generate infrastructure
        const infrastructure = this.generateInfrastructureForEra(era, citySize, rng);
        
        // Generate services
        const services = this.generateServicesForEra(era, population, citySize, rng);
        
        return {
            year: year,
            population: population,
            area: area,
            districts: districts,
            zones: zones,
            infrastructure: infrastructure,
            services: services,
            era: era
        };
    }
    
    generateDistrictsForEra(era, population, citySize, rng) {
        const districts = [];
        const numDistricts = Math.max(1, Math.floor(population / 5000));
        
        for (let i = 0; i < numDistricts; i++) {
            const x = rng.uniform(0, citySize);
            const y = rng.uniform(0, citySize);
            const size = rng.uniform(0.5, 2.0);
            
            let districtType = 'mixed';
            if (era === 'Growth' || era === 'Expansion') {
                districtType = rng.choice(['residential', 'commercial', 'mixed']);
            } else if (era === 'Modernization') {
                districtType = rng.choice(['residential', 'commercial', 'industrial', 'mixed', 'park']);
            }
            
            // Generate shape based on era and type
            const shape = this.generateDistrictShape(era, districtType, size, rng);
            
            districts.push({
                id: `district_${i}`,
                name: `${districtType.charAt(0).toUpperCase() + districtType.slice(1)} District ${i + 1}`,
                x: x, y: y, size: size,
                type: districtType,
                shape: shape,
                population: Math.floor(population / numDistricts)
            });
        }
        
        return districts;
    }

    generateDistrictShape(era, districtType, size, rng) {
        // Shape evolution based on era and district type
        const shapeTypes = ['rectangle', 'circle', 'polygon'];
        let shapeType = 'rectangle';
        
        if (era === 'Founding') {
            // Early cities use simple rectangular blocks
            shapeType = 'rectangle';
        } else if (era === 'Growth') {
            // Some circular districts for important areas
            if (districtType === 'commercial' && rng.uniform() < 0.3) {
                shapeType = 'circle';
            } else {
                shapeType = 'rectangle';
            }
        } else if (era === 'Expansion') {
            // More complex shapes emerge
            if (districtType === 'commercial' && rng.uniform() < 0.4) {
                shapeType = 'circle';
            } else if (districtType === 'industrial' && rng.uniform() < 0.2) {
                shapeType = 'polygon';
            } else {
                shapeType = rng.choice(['rectangle', 'circle']);
            }
        } else if (era === 'Modernization') {
            // Full range of shapes, including complex polygons
            if (districtType === 'park') {
                shapeType = rng.choice(['circle', 'polygon']);
            } else if (districtType === 'commercial') {
                shapeType = rng.choice(['rectangle', 'circle', 'polygon']);
            } else {
                shapeType = rng.choice(shapeTypes);
            }
        }
        
        // Generate shape-specific parameters
        switch (shapeType) {
            case 'circle':
                return {
                    type: 'circle',
                    radius: size / 2,
                    centerX: 0, // Relative to district center
                    centerY: 0
                };
            case 'polygon':
                return {
                    type: 'polygon',
                    sides: rng.randint(4, 8),
                    radius: size / 2,
                    rotation: rng.uniform(0, 2 * Math.PI),
                    centerX: 0,
                    centerY: 0
                };
            case 'rectangle':
            default:
                return {
                    type: 'rectangle',
                    width: size,
                    height: size,
                    centerX: 0,
                    centerY: 0
                };
        }
    }
    
    generateZonesForEra(era, districts, rng) {
        const zones = {
            residential: { count: 0, area: 0, population: 0 },
            commercial: { count: 0, area: 0, population: 0 },
            industrial: { count: 0, area: 0, population: 0 },
            mixed: { count: 0, area: 0, population: 0 },
            park: { count: 0, area: 0, population: 0 }
        };
        
        districts.forEach(district => {
            const zoneType = district.type;
            if (zones[zoneType]) {
                zones[zoneType].count++;
                zones[zoneType].area += district.size;
                zones[zoneType].population += district.population;
            }
        });
        
        return zones;
    }
    
    generateInfrastructureForEra(era, citySize, rng) {
        const infrastructure = [];
        
        if (era === 'Founding') {
            // Roman grid roads
            infrastructure.push({
                type: 'road',
                x1: citySize * 0.1, y1: citySize * 0.5,
                x2: citySize * 0.9, y2: citySize * 0.5,
                width: 20, importance: 5
            });
            infrastructure.push({
                type: 'road',
                x1: citySize * 0.5, y1: citySize * 0.1,
                x2: citySize * 0.5, y2: citySize * 0.9,
                width: 20, importance: 5
            });
        } else if (era === 'Growth') {
            // Add secondary roads
            for (let i = 0; i < 3; i++) {
                const x = rng.uniform(citySize * 0.2, citySize * 0.8);
                infrastructure.push({
                    type: 'road',
                    x1: x, y1: citySize * 0.1,
                    x2: x, y2: citySize * 0.9,
                    width: 15, importance: 3
                });
            }
        } else if (era === 'Expansion') {
            // Add diagonal roads
            infrastructure.push({
                type: 'road',
                x1: citySize * 0.1, y1: citySize * 0.1,
                x2: citySize * 0.9, y2: citySize * 0.9,
                width: 18, importance: 4
            });
        } else if (era === 'Modernization') {
            // Add ring roads and complex network
            const centerX = citySize / 2;
            const centerY = citySize / 2;
            const radius = citySize * 0.3;
            
            // Inner ring
            for (let i = 0; i < 8; i++) {
                const angle1 = (i * 2 * Math.PI) / 8;
                const angle2 = ((i + 1) * 2 * Math.PI) / 8;
                const x1 = centerX + radius * Math.cos(angle1);
                const y1 = centerY + radius * Math.sin(angle1);
                const x2 = centerX + radius * Math.cos(angle2);
                const y2 = centerY + radius * Math.sin(angle2);
                
                infrastructure.push({
                    type: 'road',
                    x1: x1, y1: y1, x2: x2, y2: y2,
                    width: 16, importance: 3
                });
            }
        }
        
        return infrastructure;
    }
    
    generateServicesForEra(era, population, citySize, rng) {
        const services = [];
        const numServices = Math.max(1, Math.floor(population / 10000));
        
        for (let i = 0; i < numServices; i++) {
            const x = rng.uniform(0, citySize);
            const y = rng.uniform(0, citySize);
            
            let serviceType = 'hospital';
            if (era === 'Founding') {
                serviceType = rng.choice(['market', 'temple']);
            } else if (era === 'Growth') {
                serviceType = rng.choice(['hospital', 'school', 'market']);
            } else if (era === 'Expansion') {
                serviceType = rng.choice(['hospital', 'school', 'police', 'fire', 'monument']);
            } else {
                serviceType = rng.choice(['hospital', 'school', 'police', 'fire', 'monument', 'airport', 'stadium']);
            }
            
            services.push({
                id: `service_${i}`,
                type: serviceType,
                x: x, y: y,
                importance: rng.randint(1, 5)
            });
        }
        
        return services;
    }
    
    generateKeyPoints(timeline) {
        const keyPoints = [];
        
        // Add key points that appear at different times
        const keyPointData = [
            { name: "Central Forum", type: "market", year: 0, importance: 5 },
            { name: "Temple of the City Gods", type: "religious", year: 10, importance: 4 },
            { name: "City Hall", type: "government", year: 50, importance: 4 },
            { name: "Grand Cathedral", type: "religious", year: 200, importance: 5 },
            { name: "Royal Palace", type: "government", year: 300, importance: 5 },
            { name: "Central Station", type: "transport", year: 800, importance: 4 },
            { name: "University Campus", type: "government", year: 1000, importance: 4 },
            { name: "Airport", type: "transport", year: 1200, importance: 3 }
        ];
        
        keyPointData.forEach(point => {
            keyPoints.push({
                id: `keypoint_${point.name.toLowerCase().replace(/\s+/g, '_')}`,
                name: point.name,
                type: point.type,
                year: point.year,
                importance: point.importance,
                x: Math.random() * 10,
                y: Math.random() * 10
            });
        });
        
        return keyPoints;
    }
    
    generateRomanGrid(citySize) {
        const centerX = citySize / 2;
        const centerY = citySize / 2;
        
        return {
            cardos: [
                [centerX - 10, 0, centerX + 10, citySize] // Main cardo
            ],
            decumani: [
                [0, centerY - 10, citySize, centerY + 10] // Main decumanus
            ],
            blocks: []
        };
    }
    
    renderTemporalCity() {
        if (!this.temporalData) return;
        
        // Find city state for current year
        const cityState = this.temporalData.timeline.find(state => state.year === this.currentYear);
        if (!cityState) return;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background
        this.ctx.fillStyle = '#f0f0f0';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw districts
        this.drawTemporalDistricts(cityState.districts);
        
        // Draw infrastructure
        this.drawTemporalInfrastructure(cityState.infrastructure);
        
        // Draw services
        this.drawTemporalServices(cityState.services);
        
        // Draw key points that exist at this time
        const currentKeyPoints = this.temporalData.key_points.filter(point => point.year <= this.currentYear);
        this.drawTemporalKeyPoints(currentKeyPoints);
        
        // Draw legend
        this.drawLegend();
        
        // Draw timeline info
        this.drawTimelineInfo(cityState);
    }
    
    drawTemporalDistricts(districts) {
        const ctx = this.ctx;
        const canvas = this.canvas;
        
        districts.forEach(district => {
            const x = (district.x / 10) * canvas.width;
            const y = (district.y / 10) * canvas.height;
            const size = (district.size / 10) * Math.min(canvas.width, canvas.height);
            
            // District color based on type
            const colors = {
                residential: '#4ecdc4',
                commercial: '#ff6b6b',
                industrial: '#45b7d1',
                mixed: '#96ceb4',
                park: '#90EE90'
            };
            
            ctx.fillStyle = colors[district.type] || '#96ceb4';
            
            // Draw based on shape type
            if (district.shape) {
                this.drawDistrictShape(ctx, district.shape, x, y, size);
            } else {
                // Fallback to rectangle for backward compatibility
                ctx.fillRect(x - size/2, y - size/2, size, size);
            }
            
            // District border
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 2;
            this.strokeDistrictShape(ctx, district.shape, x, y, size);
            
            // District label
            ctx.fillStyle = '#333';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(district.name, x, y + 3);
        });
    }

    drawDistrictShape(ctx, shape, x, y, size) {
        if (!shape) {
            // Fallback to rectangle
            ctx.fillRect(x - size/2, y - size/2, size, size);
            return;
        }

        ctx.save();
        ctx.translate(x, y);

        switch (shape.type) {
            case 'circle':
                const radius = (shape.radius / 10) * Math.min(ctx.canvas.width, ctx.canvas.height);
                ctx.beginPath();
                ctx.arc(shape.centerX, shape.centerY, radius, 0, 2 * Math.PI);
                ctx.fill();
                break;

            case 'polygon':
                const polyRadius = (shape.radius / 10) * Math.min(ctx.canvas.width, ctx.canvas.height);
                const sides = shape.sides || 6;
                const rotation = shape.rotation || 0;
                
                ctx.rotate(rotation);
                ctx.beginPath();
                for (let i = 0; i < sides; i++) {
                    const angle = (i * 2 * Math.PI) / sides;
                    const px = shape.centerX + polyRadius * Math.cos(angle);
                    const py = shape.centerY + polyRadius * Math.sin(angle);
                    
                    if (i === 0) {
                        ctx.moveTo(px, py);
                    } else {
                        ctx.lineTo(px, py);
                    }
                }
                ctx.closePath();
                ctx.fill();
                break;

            case 'rectangle':
            default:
                const width = (shape.width / 10) * Math.min(ctx.canvas.width, ctx.canvas.height);
                const height = (shape.height / 10) * Math.min(ctx.canvas.width, ctx.canvas.height);
                ctx.fillRect(shape.centerX - width/2, shape.centerY - height/2, width, height);
                break;
        }

        ctx.restore();
    }

    strokeDistrictShape(ctx, shape, x, y, size) {
        if (!shape) {
            // Fallback to rectangle
            ctx.strokeRect(x - size/2, y - size/2, size, size);
            return;
        }

        ctx.save();
        ctx.translate(x, y);

        switch (shape.type) {
            case 'circle':
                const radius = (shape.radius / 10) * Math.min(ctx.canvas.width, ctx.canvas.height);
                ctx.beginPath();
                ctx.arc(shape.centerX, shape.centerY, radius, 0, 2 * Math.PI);
                ctx.stroke();
                break;

            case 'polygon':
                const polyRadius = (shape.radius / 10) * Math.min(ctx.canvas.width, ctx.canvas.height);
                const sides = shape.sides || 6;
                const rotation = shape.rotation || 0;
                
                ctx.rotate(rotation);
                ctx.beginPath();
                for (let i = 0; i < sides; i++) {
                    const angle = (i * 2 * Math.PI) / sides;
                    const px = shape.centerX + polyRadius * Math.cos(angle);
                    const py = shape.centerY + polyRadius * Math.sin(angle);
                    
                    if (i === 0) {
                        ctx.moveTo(px, py);
                    } else {
                        ctx.lineTo(px, py);
                    }
                }
                ctx.closePath();
                ctx.stroke();
                break;

            case 'rectangle':
            default:
                const width = (shape.width / 10) * Math.min(ctx.canvas.width, ctx.canvas.height);
                const height = (shape.height / 10) * Math.min(ctx.canvas.width, ctx.canvas.height);
                ctx.strokeRect(shape.centerX - width/2, shape.centerY - height/2, width, height);
                break;
        }

        ctx.restore();
    }
    
    drawTemporalInfrastructure(infrastructure) {
        const ctx = this.ctx;
        const canvas = this.canvas;
        
        infrastructure.forEach(road => {
            const x1 = (road.x1 / 10) * canvas.width;
            const y1 = (road.y1 / 10) * canvas.height;
            const x2 = (road.x2 / 10) * canvas.width;
            const y2 = (road.y2 / 10) * canvas.height;
            const width = Math.max(2, (road.width / 10) * Math.min(canvas.width, canvas.height));
            
            ctx.strokeStyle = '#666';
            ctx.lineWidth = width;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        });
    }
    
    drawTemporalServices(services) {
        const ctx = this.ctx;
        const canvas = this.canvas;
        
        services.forEach(service => {
            const x = (service.x / 10) * canvas.width;
            const y = (service.y / 10) * canvas.height;
            const size = 8;
            
            // Service color and symbol
            const serviceStyles = {
                hospital: { color: '#ff0000', symbol: '✚' },
                school: { color: '#0000ff', symbol: '■' },
                police: { color: '#000080', symbol: '●' },
                fire: { color: '#ffa500', symbol: '●' },
                market: { color: '#FFD700', symbol: '●' },
                temple: { color: '#8B4513', symbol: '★' },
                monument: { color: '#8B4513', symbol: '★' },
                government: { color: '#800080', symbol: '◆' },
                transport: { color: '#00bfff', symbol: '●' }
            };
            
            const style = serviceStyles[service.type] || { color: '#666', symbol: '●' };
            
            ctx.fillStyle = style.color;
            ctx.font = `${size * 2}px Arial`;
            ctx.textAlign = 'center';
            ctx.fillText(style.symbol, x, y + size/2);
        });
    }
    
    drawTemporalKeyPoints(keyPoints) {
        const ctx = this.ctx;
        const canvas = this.canvas;
        
        keyPoints.forEach(point => {
            const x = (point.x / 10) * canvas.width;
            const y = (point.y / 10) * canvas.height;
            const size = 12;
            
            // Key point color and symbol
            const pointStyles = {
                market: { color: '#FFD700', symbol: '●' },
                religious: { color: '#8B4513', symbol: '★' },
                government: { color: '#800080', symbol: '◆' },
                transport: { color: '#00bfff', symbol: '●' }
            };
            
            const style = pointStyles[point.type] || { color: '#666', symbol: '★' };
            
            ctx.fillStyle = style.color;
            ctx.font = `${size * 2}px Arial`;
            ctx.textAlign = 'center';
            ctx.fillText(style.symbol, x, y + size/2);
            
            // Importance indicator
            if (point.importance >= 4) {
                ctx.strokeStyle = '#ff0000';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(x, y, size + 3, 0, 2 * Math.PI);
                ctx.stroke();
            }
        });
    }
    
    drawTimelineInfo(cityState) {
        const ctx = this.ctx;
        const canvas = this.canvas;
        
        // Timeline info box
        const infoX = 20;
        const infoY = 20;
        const infoWidth = 300;
        const infoHeight = 120;
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(infoX, infoY, infoWidth, infoHeight);
        
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.strokeRect(infoX, infoY, infoWidth, infoHeight);
        
        // Timeline text
        ctx.fillStyle = '#333';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`Year: ${cityState.year} AD`, infoX + 10, infoY + 25);
        
        ctx.font = '14px Arial';
        ctx.fillText(`Era: ${cityState.era}`, infoX + 10, infoY + 45);
        ctx.fillText(`Population: ${cityState.population.toLocaleString()}`, infoX + 10, infoY + 65);
        ctx.fillText(`Area: ${cityState.area.toFixed(1)} km²`, infoX + 10, infoY + 85);
        ctx.fillText(`Districts: ${cityState.districts.length}`, infoX + 10, infoY + 105);
    }
    
    updateTemporalCityInfo() {
        if (!this.temporalData) return;
        
        const cityState = this.temporalData.timeline.find(state => state.year === this.currentYear);
        if (!cityState) return;
        
        // Update city info display safely
        this.updateElement('cityPopulation', cityState.population.toLocaleString());
        this.updateElement('cityArea', cityState.area.toFixed(1));
        this.updateElement('cityDensity', Math.round(cityState.population / cityState.area).toLocaleString());
        this.updateElement('cityDistricts', cityState.districts.length);
        this.updateElement('cityZones', Object.keys(cityState.zones).length);
        this.updateElement('cityMasterSeed', this.temporalData.metadata.master_seed);
        this.updateElement('cityGeneratedAt', new Date().toLocaleString());
    }
    
    togglePlayPause() {
        const playPauseBtn = document.getElementById('playPauseBtn');
        const timelineSlider = document.getElementById('timelineSlider');
        
        if (this.isPlaying) {
            // Stop playing
            this.isPlaying = false;
            playPauseBtn.textContent = 'Play';
            if (this.playInterval) {
                clearInterval(this.playInterval);
                this.playInterval = null;
            }
        } else {
            // Start playing
            this.isPlaying = true;
            playPauseBtn.textContent = 'Pause';
            
            this.playInterval = setInterval(() => {
                const currentValue = parseInt(timelineSlider.value);
                const maxValue = parseInt(timelineSlider.max);
                
                if (currentValue >= maxValue) {
                    // Reached end, stop playing
                    this.togglePlayPause();
                } else {
                    // Move to next year
                    timelineSlider.value = currentValue + 10;
                    this.currentYear = parseInt(timelineSlider.value);
                    this.updateElement('currentYear', this.currentYear);
                    this.renderTemporalCity();
                    this.updateTemporalCityInfo();
                }
            }, 200); // 200ms per step
        }
    }

    resetTimeline() {
        const timelineSlider = document.getElementById('timelineSlider');
        if (timelineSlider) {
            timelineSlider.value = 0;
            this.currentYear = 0;
            this.updateElement('currentYear', this.currentYear);
            this.renderTemporalCity();
            this.updateTemporalCityInfo();
        }
    }

    stepBackward() {
        const timelineSlider = document.getElementById('timelineSlider');
        if (timelineSlider) {
            const currentValue = parseInt(timelineSlider.value);
            const step = parseInt(timelineSlider.step) || 10;
            const newValue = Math.max(0, currentValue - step);
            timelineSlider.value = newValue;
            this.currentYear = newValue;
            this.updateElement('currentYear', this.currentYear);
            this.renderTemporalCity();
            this.updateTemporalCityInfo();
        }
    }

    stepForward() {
        const timelineSlider = document.getElementById('timelineSlider');
        if (timelineSlider) {
            const currentValue = parseInt(timelineSlider.value);
            const step = parseInt(timelineSlider.step) || 10;
            const maxValue = parseInt(timelineSlider.max);
            const newValue = Math.min(maxValue, currentValue + step);
            timelineSlider.value = newValue;
            this.currentYear = newValue;
            this.updateElement('currentYear', this.currentYear);
            this.renderTemporalCity();
            this.updateTemporalCityInfo();
        }
    }
}

// Global functions for HTML buttons
let cityGenerator;

function generateCity() {
    if (!cityGenerator) {
        cityGenerator = new MetroCityGenerator();
    }
    cityGenerator.generateCity();
}

function loadDefaultCity() {
    if (!cityGenerator) {
        cityGenerator = new MetroCityGenerator();
    }
    cityGenerator.loadDefaultCity();
}

function exportCity() {
    if (!cityGenerator) {
        cityGenerator = new MetroCityGenerator();
    }
    cityGenerator.exportCity();
}

function togglePlayPause() {
    if (!cityGenerator) {
        cityGenerator = new MetroCityGenerator();
    }
    cityGenerator.togglePlayPause();
}

function resetTimeline() {
    if (!cityGenerator) {
        cityGenerator = new MetroCityGenerator();
    }
    cityGenerator.resetTimeline();
}

function stepBackward() {
    if (!cityGenerator) {
        cityGenerator = new MetroCityGenerator();
    }
    cityGenerator.stepBackward();
}

function stepForward() {
    if (!cityGenerator) {
        cityGenerator = new MetroCityGenerator();
    }
    cityGenerator.stepForward();
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    cityGenerator = new MetroCityGenerator();
});