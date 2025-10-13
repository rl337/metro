// Metro City Generator - Web Interface
// This file provides the web interface for the Metro city generation system

class MetroCityGenerator {
    constructor() {
        this.canvas = document.getElementById('cityCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.currentCity = null;
        this.seedGenerator = new HierarchicalSeedGenerator();
        
        // Set up canvas
        this.setupCanvas();
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
            { color: '#ff6b6b', label: 'Commercial' },
            { color: '#4ecdc4', label: 'Residential' },
            { color: '#45b7d1', label: 'Industrial' },
            { color: '#96ceb4', label: 'Mixed' }
        ];
        
        const legendX = canvas.width - 120;
        const legendY = 20;
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(legendX - 10, legendY - 10, 110, legendItems.length * 20 + 10);
        
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.strokeRect(legendX - 10, legendY - 10, 110, legendItems.length * 20 + 10);
        
        legendItems.forEach((item, index) => {
            ctx.fillStyle = item.color;
            ctx.fillRect(legendX, legendY + index * 20, 15, 15);
            
            ctx.fillStyle = '#333';
            ctx.font = '12px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(item.label, legendX + 20, legendY + index * 20 + 12);
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

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    cityGenerator = new MetroCityGenerator();
});
