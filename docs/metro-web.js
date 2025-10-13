// Metro City Generator - Web Interface
// This file provides the web interface for the Metro city generation system

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
            
            this.showStatus(`City generated successfully! Population: ${this.currentCity.population.toLocaleString()}`, 'success');
        } catch (error) {
            console.error('Error generating city:', error);
            this.showStatus(`Error generating city: ${error.message}`, 'error');
        }
    }

    async simulateCity(targetPopulation, citySize) {
        // Use the enhanced city simulation
        try {
            // Call the Python backend to generate the city
            const response = await fetch('/api/simulate-city', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    population: targetPopulation,
                    citySize: citySize,
                    masterSeed: this.seedGenerator.getMasterSeed()
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const cityData = await response.json();
            return cityData;
        } catch (error) {
            console.warn('Backend simulation failed, using fallback:', error);
            // Fallback to client-side simulation
            return this.generateFallbackCity(targetPopulation, citySize);
        }
    }

    generateFallbackCity(targetPopulation, citySize) {
        // Enhanced fallback simulation with better structure
        const city = {
            population: targetPopulation,
            area: citySize * citySize,
            density: targetPopulation / (citySize * citySize),
            zones: this.generateZones(targetPopulation, citySize),
            districts: this.generateDistricts(targetPopulation, citySize),
            infrastructure: this.generateInfrastructure(targetPopulation, citySize),
            demographics: this.generateDemographics(targetPopulation),
            seed: this.seedGenerator.getMasterSeed(),
            generatedAt: new Date().toISOString()
        };

        return city;
    }

    generateZones(population, citySize) {
        const zones = {
            'Commercial': { count: 0, area: 0, population: 0 },
            'Residential': { count: 0, area: 0, population: 0 },
            'Industrial': { count: 0, area: 0, population: 0 },
            'Mixed': { count: 0, area: 0, population: 0 }
        };

        // Use hierarchical seeds for reproducible zone generation
        const zoneSeed = this.seedGenerator.getSeed('zones');
        const rng = new SeededRandom(zoneSeed);

        const totalZones = Math.floor(population / 5000) + rng.nextInt(5, 15);
        
        for (let i = 0; i < totalZones; i++) {
            const zoneType = this.selectZoneType(rng);
            const zoneSize = rng.nextFloat(0.5, 3.0);
            const zonePopulation = Math.floor(zoneSize * rng.nextFloat(2000, 8000));
            
            zones[zoneType].count++;
            zones[zoneType].area += zoneSize;
            zones[zoneType].population += zonePopulation;
        }

        return zones;
    }

    selectZoneType(rng) {
        const weights = {
            'Residential': 0.4,
            'Commercial': 0.25,
            'Industrial': 0.2,
            'Mixed': 0.15
        };

        const random = rng.nextFloat();
        let cumulative = 0;
        
        for (const [zoneType, weight] of Object.entries(weights)) {
            cumulative += weight;
            if (random <= cumulative) {
                return zoneType;
            }
        }
        
        return 'Residential';
    }

    generateDistricts(population, citySize) {
        const districts = [];
        const districtCount = Math.floor(Math.sqrt(population / 10000)) + 3;
        
        const districtSeed = this.seedGenerator.getSeed('districts');
        const rng = new SeededRandom(districtSeed);

        for (let i = 0; i < districtCount; i++) {
            const district = {
                id: i,
                name: this.generateDistrictName(rng),
                x: rng.nextFloat(0, citySize),
                y: rng.nextFloat(0, citySize),
                size: rng.nextFloat(1, 3),
                population: Math.floor(population / districtCount * rng.nextFloat(0.5, 1.5)),
                type: this.selectZoneType(rng)
            };
            districts.push(district);
        }

        return districts;
    }

    generateDistrictName(rng) {
        const prefixes = ['North', 'South', 'East', 'West', 'Central', 'Old', 'New', 'Upper', 'Lower'];
        const suffixes = ['Heights', 'Hills', 'Valley', 'Park', 'Square', 'Plaza', 'Center', 'District', 'Quarter'];
        
        const prefix = prefixes[rng.nextInt(0, prefixes.length)];
        const suffix = suffixes[rng.nextInt(0, suffixes.length)];
        
        return `${prefix} ${suffix}`;
    }

    generateInfrastructure(population, citySize) {
        const infraRng = new SeededRandom(this.seedGenerator.getSeed('infrastructure'));
        
        return {
            roads: this.generateRoads(citySize, infraRng),
            utilities: this.generateUtilities(citySize, infraRng),
            services: this.generateServices(citySize, infraRng)
        };
    }

    generateRoads(citySize, rng) {
        const roads = [];
        const roadCount = Math.floor(citySize / 2) + rng.nextInt(2, 8);
        
        for (let i = 0; i < roadCount; i++) {
            if (rng.nextFloat() < 0.5) {
                // Horizontal road
                roads.push({
                    x1: 0, y1: rng.nextFloat(0, citySize),
                    x2: citySize, y2: rng.nextFloat(0, citySize),
                    width: rng.nextFloat(8, 24),
                    type: 'arterial'
                });
            } else {
                // Vertical road
                roads.push({
                    x1: rng.nextFloat(0, citySize), y1: 0,
                    x2: rng.nextFloat(0, citySize), y2: citySize,
                    width: rng.nextFloat(8, 24),
                    type: 'arterial'
                });
            }
        }
        
        return roads;
    }

    generateUtilities(citySize, rng) {
        return {
            powerStations: Array.from({length: rng.nextInt(1, 4)}, () => ({
                x: rng.nextFloat(0, citySize),
                y: rng.nextFloat(0, citySize),
                capacity: rng.nextInt(100, 500)
            })),
            waterTreatment: Array.from({length: rng.nextInt(1, 3)}, () => ({
                x: rng.nextFloat(0, citySize),
                y: rng.nextFloat(0, citySize),
                capacity: rng.nextInt(50, 200)
            }))
        };
    }

    generateServices(citySize, rng) {
        return {
            hospitals: Array.from({length: rng.nextInt(1, 3)}, () => ({
                x: rng.nextFloat(0, citySize),
                y: rng.nextFloat(0, citySize),
                beds: rng.nextInt(50, 300)
            })),
            schools: Array.from({length: rng.nextInt(2, 6)}, () => ({
                x: rng.nextFloat(0, citySize),
                y: rng.nextFloat(0, citySize),
                capacity: rng.nextInt(200, 1000)
            })),
            policeStations: Array.from({length: rng.nextInt(1, 4)}, () => ({
                x: rng.nextFloat(0, citySize),
                y: rng.nextFloat(0, citySize)
            }))
        };
    }

    generateDemographics(population) {
        const demoRng = new SeededRandom(this.seedGenerator.getSeed('demographics'));
        
        return {
            ageDistribution: {
                '0-17': Math.floor(population * 0.22),
                '18-34': Math.floor(population * 0.25),
                '35-54': Math.floor(population * 0.28),
                '55-64': Math.floor(population * 0.15),
                '65+': Math.floor(population * 0.10)
            },
            incomeDistribution: {
                'low': Math.floor(population * 0.3),
                'medium': Math.floor(population * 0.5),
                'high': Math.floor(population * 0.2)
            }
        };
    }

    renderCity() {
        if (!this.currentCity) return;

        const ctx = this.ctx;
        const canvas = this.canvas;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Set background
        ctx.fillStyle = '#f0f8ff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw city boundaries
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 3;
        ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
        
        // Draw infrastructure first (roads, utilities)
        if (this.currentCity.infrastructure) {
            this.drawInfrastructure(this.currentCity.infrastructure);
        }
        
        // Draw districts
        this.currentCity.districts.forEach(district => {
            this.drawDistrict(district);
        });
        
        // Draw services on top
        if (this.currentCity.infrastructure && this.currentCity.infrastructure.services) {
            this.drawServices(this.currentCity.infrastructure.services);
        }
        
        // Draw legend
        this.drawLegend();
    }

    drawDistrict(district) {
        const ctx = this.ctx;
        const canvas = this.canvas;
        
        // Scale district coordinates to canvas
        const scaleX = (canvas.width - 40) / 10; // Assuming 10km city size
        const scaleY = (canvas.height - 40) / 10;
        
        const x = 20 + district.x * scaleX;
        const y = 20 + district.y * scaleY;
        const size = district.size * Math.min(scaleX, scaleY);
        
        // Set color based on district type
        const colors = {
            'Commercial': '#ff6b6b',
            'Residential': '#4ecdc4',
            'Industrial': '#45b7d1',
            'Mixed': '#96ceb4'
        };
        
        ctx.fillStyle = colors[district.type] || '#cccccc';
        ctx.fillRect(x - size/2, y - size/2, size, size);
        
        // Draw district border
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.strokeRect(x - size/2, y - size/2, size, size);
        
        // Draw district name
        ctx.fillStyle = '#333';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(district.name, x, y + 3);
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

    drawInfrastructure(infrastructure) {
        const ctx = this.ctx;
        const canvas = this.canvas;
        
        // Draw roads
        if (infrastructure.roads) {
            ctx.strokeStyle = '#666';
            ctx.lineWidth = 2;
            
            infrastructure.roads.forEach(road => {
                const scaleX = (canvas.width - 40) / 10;
                const scaleY = (canvas.height - 40) / 10;
                
                const x1 = 20 + road.x1 * scaleX;
                const y1 = 20 + road.y1 * scaleY;
                const x2 = 20 + road.x2 * scaleX;
                const y2 = 20 + road.y2 * scaleY;
                
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
            });
        }
        
        // Draw utilities
        if (infrastructure.utilities) {
            // Power stations
            if (infrastructure.utilities.powerStations) {
                ctx.fillStyle = '#ffd700';
                infrastructure.utilities.powerStations.forEach(util => {
                    const x = 20 + util.x * (canvas.width - 40) / 10;
                    const y = 20 + util.y * (canvas.height - 40) / 10;
                    ctx.fillRect(x - 3, y - 3, 6, 6);
                });
            }
            
            // Water treatment
            if (infrastructure.utilities.waterTreatment) {
                ctx.fillStyle = '#00bfff';
                infrastructure.utilities.waterTreatment.forEach(util => {
                    const x = 20 + util.x * (canvas.width - 40) / 10;
                    const y = 20 + util.y * (canvas.height - 40) / 10;
                    ctx.beginPath();
                    ctx.arc(x, y, 4, 0, 2 * Math.PI);
                    ctx.fill();
                });
            }
        }
    }

    drawServices(services) {
        const ctx = this.ctx;
        const canvas = this.canvas;
        
        // Draw hospitals
        if (services.hospitals) {
            ctx.fillStyle = '#ff0000';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            
            services.hospitals.forEach(hospital => {
                const x = 20 + hospital.x * (canvas.width - 40) / 10;
                const y = 20 + hospital.y * (canvas.height - 40) / 10;
                
                // Draw cross symbol
                ctx.strokeStyle = '#ff0000';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(x - 5, y - 5);
                ctx.lineTo(x + 5, y + 5);
                ctx.moveTo(x + 5, y - 5);
                ctx.lineTo(x - 5, y + 5);
                ctx.stroke();
            });
        }
        
        // Draw schools
        if (services.schools) {
            ctx.fillStyle = '#0000ff';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            
            services.schools.forEach(school => {
                const x = 20 + school.x * (canvas.width - 40) / 10;
                const y = 20 + school.y * (canvas.height - 40) / 10;
                
                // Draw school symbol (building)
                ctx.fillRect(x - 4, y - 4, 8, 8);
            });
        }
        
        // Draw police stations
        if (services.policeStations) {
            ctx.fillStyle = '#000080';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            
            services.policeStations.forEach(station => {
                const x = 20 + station.x * (canvas.width - 40) / 10;
                const y = 20 + station.y * (canvas.height - 40) / 10;
                
                // Draw police badge symbol
                ctx.beginPath();
                ctx.arc(x, y, 3, 0, 2 * Math.PI);
                ctx.fill();
            });
        }
    }

    updateCityInfo() {
        if (!this.currentCity) return;

        document.getElementById('cityPopulation').textContent = this.currentCity.population.toLocaleString();
        document.getElementById('cityArea').textContent = `${this.currentCity.area.toFixed(1)} km²`;
        document.getElementById('cityDensity').textContent = `${Math.round(this.currentCity.density).toLocaleString()} people/km²`;
        
        const zoneCount = Object.values(this.currentCity.zones).reduce((sum, zone) => sum + zone.count, 0);
        document.getElementById('cityZones').textContent = zoneCount;
        
        document.getElementById('cityInfo').classList.remove('hidden');
    }

    showStatus(message, type = 'info') {
        const status = document.getElementById('status');
        const statusText = document.getElementById('statusText');
        
        statusText.textContent = message;
        status.className = `status ${type}`;
        status.classList.remove('hidden');
        
        if (type === 'success' || type === 'error') {
            setTimeout(() => {
                status.classList.add('hidden');
            }, 5000);
        }
    }

    async loadDefaultCity() {
        try {
            const response = await fetch('city.json');
            const cityData = await response.json();
            
            document.getElementById('population').value = cityData.population;
            document.getElementById('seed').value = cityData.seed;
            
            await this.generateCity();
        } catch (error) {
            console.error('Error loading default city:', error);
            this.showStatus('Error loading default city data', 'error');
        }
    }

    exportCity() {
        if (!this.currentCity) {
            this.showStatus('No city to export', 'error');
            return;
        }

        const dataStr = JSON.stringify(this.currentCity, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `metro-city-${this.currentCity.population}-${Date.now()}.json`;
        link.click();
        
        this.showStatus('City exported successfully!', 'success');
    }
}

// Hierarchical Seed Generator for reproducible random generation
class HierarchicalSeedGenerator {
    constructor() {
        this.masterSeed = 0;
        this.seedCache = new Map();
    }

    setMasterSeed(seed) {
        this.masterSeed = seed;
        this.seedCache.clear();
    }

    getMasterSeed() {
        return this.masterSeed;
    }

    getSeed(category) {
        if (this.seedCache.has(category)) {
            return this.seedCache.get(category);
        }

        // Generate a deterministic seed based on master seed and category
        const hash = this.simpleHash(this.masterSeed.toString() + category);
        const seed = Math.abs(hash) % 2147483647; // Max 32-bit integer
        
        this.seedCache.set(category, seed);
        return seed;
    }

    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash;
    }
}

// Seeded Random Number Generator
class SeededRandom {
    constructor(seed) {
        this.seed = seed;
    }

    next() {
        this.seed = (this.seed * 1664525 + 1013904223) % 2147483647;
        return this.seed / 2147483647;
    }

    nextFloat(min = 0, max = 1) {
        return min + this.next() * (max - min);
    }

    nextInt(min, max) {
        return Math.floor(this.nextFloat(min, max + 1));
    }
    setupTemporalControls() {
        const simulationMode = document.getElementById('simulationMode');
        const temporalControls = document.getElementById('temporalControls');
        const timelineSlider = document.getElementById('timelineSlider');
        const currentYearSpan = document.getElementById('currentYear');
        
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
            
            districts.push({
                id: `district_${i}`,
                name: `${districtType.charAt(0).toUpperCase() + districtType.slice(1)} District ${i + 1}`,
                x: x, y: y, size: size,
                type: districtType,
                population: Math.floor(population / numDistricts)
            });
        }
        
        return districts;
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
        
        // Update city info display
        document.getElementById('cityPopulation').textContent = cityState.population.toLocaleString();
        document.getElementById('cityArea').textContent = cityState.area.toFixed(1);
        document.getElementById('cityDensity').textContent = Math.round(cityState.population / cityState.area).toLocaleString();
        document.getElementById('cityDistricts').textContent = cityState.districts.length;
        document.getElementById('cityZones').textContent = Object.keys(cityState.zones).length;
        document.getElementById('cityMasterSeed').textContent = this.temporalData.metadata.master_seed;
        document.getElementById('cityGeneratedAt').textContent = new Date().toLocaleString();
    }
    
    playEvolution() {
        const playBtn = document.getElementById('playBtn');
        const timelineSlider = document.getElementById('timelineSlider');
        
        if (this.isPlaying) {
            // Stop playing
            this.isPlaying = false;
            playBtn.textContent = 'Play Evolution';
            if (this.playInterval) {
                clearInterval(this.playInterval);
                this.playInterval = null;
            }
        } else {
            // Start playing
            this.isPlaying = true;
            playBtn.textContent = 'Stop Evolution';
            
            this.playInterval = setInterval(() => {
                const currentValue = parseInt(timelineSlider.value);
                const maxValue = parseInt(timelineSlider.max);
                
                if (currentValue >= maxValue) {
                    // Reached end, stop playing
                    this.playEvolution();
                } else {
                    // Move to next year
                    timelineSlider.value = currentValue + 10;
                    this.currentYear = parseInt(timelineSlider.value);
                    document.getElementById('currentYear').textContent = this.currentYear;
                    this.renderTemporalCity();
                    this.updateTemporalCityInfo();
                }
            }, 200); // 200ms per step
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

function playEvolution() {
    if (!cityGenerator) {
        cityGenerator = new MetroCityGenerator();
    }
    cityGenerator.playEvolution();
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    cityGenerator = new MetroCityGenerator();
});
