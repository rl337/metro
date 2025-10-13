"""
Enhanced City Simulation Engine for Metro

This module provides a scalable city simulation engine that can generate
cities with populations up to 1 million while maintaining performance
and reproducibility through the hierarchical seed system.
"""

import json
import random
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass, asdict
from pathlib import Path

from .seed_system import CitySeedManager, create_city_seed_manager
from .population import PopulationModel


@dataclass
class District:
    """Represents a city district."""
    id: str
    name: str
    x: float
    y: float
    width: float
    height: float
    population: int
    zone_type: str
    density: float
    seed: int


@dataclass
class Zone:
    """Represents a city zone within a district."""
    id: str
    district_id: str
    zone_type: str
    area: float
    population: int
    density: float
    x: float
    y: float
    width: float
    height: float
    seed: int


@dataclass
class CityLayout:
    """Represents the complete city layout."""
    width: float
    height: float
    total_area: float
    districts: List[District]
    zones: List[Zone]
    infrastructure: Dict[str, Any]
    demographics: Dict[str, Any]


class CitySimulator:
    """
    Main city simulation engine.
    
    This class orchestrates the generation of cities with populations
    up to 1 million, using hierarchical seeds for reproducibility.
    """
    
    def __init__(self, city_config: Dict[str, Any]):
        self.config = city_config
        self.seed_manager = create_city_seed_manager(city_config)
        self.population_model = None
        self.city_layout = None
        
    def simulate_city(self, target_population: int = None, city_size: float = None) -> CityLayout:
        """
        Simulate a complete city with the given parameters.
        
        Args:
            target_population: Target population (defaults to config value)
            city_size: City size in km (defaults to calculated value)
            
        Returns:
            Complete city layout
        """
        if target_population is None:
            target_population = self.config.get('population', 100000)
        
        if city_size is None:
            city_size = self._calculate_city_size(target_population)
        
        # Generate population model
        self.population_model = self._generate_population_model(target_population)
        
        # Generate city layout
        self.city_layout = self._generate_city_layout(target_population, city_size)
        
        return self.city_layout
    
    def _calculate_city_size(self, population: int) -> float:
        """Calculate appropriate city size based on population."""
        # Base size calculation with some variation
        base_density = 5000  # people per km²
        base_area = population / base_density
        
        # Add some variation based on city type
        rng = self.seed_manager.generator.get_rng("city.size")
        variation = rng.uniform(0.8, 1.2)
        
        area = base_area * variation
        # Convert to square km and take square root for side length
        side_length = (area ** 0.5)
        
        return max(5.0, min(50.0, side_length))  # Clamp between 5-50 km
    
    def _generate_population_model(self, population: int) -> PopulationModel:
        """Generate population model with hierarchical seeding."""
        pop_seed = self.seed_manager.get_population_seed(population)
        rng = random.Random(pop_seed)
        
        # Use the existing PopulationModel but with our seeded RNG
        return PopulationModel(rng, population)
    
    def _generate_city_layout(self, population: int, city_size: float) -> CityLayout:
        """Generate the complete city layout."""
        # Calculate number of districts based on population
        district_count = self._calculate_district_count(population)
        
        # Generate districts
        districts = self._generate_districts(district_count, city_size, population)
        
        # Generate zones within districts
        zones = self._generate_zones(districts, population)
        
        # Generate infrastructure
        infrastructure = self._generate_infrastructure(districts, city_size)
        
        # Generate demographics
        demographics = self._generate_demographics(districts, population)
        
        return CityLayout(
            width=city_size,
            height=city_size,
            total_area=city_size * city_size,
            districts=districts,
            zones=zones,
            infrastructure=infrastructure,
            demographics=demographics
        )
    
    def _calculate_district_count(self, population: int) -> int:
        """Calculate appropriate number of districts based on population."""
        # Base calculation: roughly 1 district per 50k people
        base_districts = max(3, population // 50000)
        
        # Add some variation
        rng = self.seed_manager.generator.get_rng("city.districts")
        variation = rng.randint(-2, 3)
        
        return max(3, min(20, base_districts + variation))
    
    def _generate_districts(self, district_count: int, city_size: float, population: int) -> List[District]:
        """Generate city districts."""
        districts = []
        rng = self.seed_manager.generator.get_rng("districts")
        
        # District types with weights
        district_types = {
            'residential': 0.4,
            'commercial': 0.25,
            'industrial': 0.2,
            'mixed': 0.15
        }
        
        for i in range(district_count):
            # Generate district properties
            name = self._generate_district_name(i, rng)
            x = rng.uniform(0, city_size * 0.8)  # Leave some margin
            y = rng.uniform(0, city_size * 0.8)
            width = rng.uniform(1, city_size * 0.3)
            height = rng.uniform(1, city_size * 0.3)
            
            # Ensure district fits within city bounds
            x = min(x, city_size - width)
            y = min(y, city_size - height)
            
            # Select district type
            zone_type = self._select_weighted_choice(district_types, rng)
            
            # Calculate population for this district
            district_population = self._calculate_district_population(
                i, district_count, population, zone_type, rng
            )
            
            # Calculate density
            area = width * height
            density = district_population / area if area > 0 else 0
            
            # Get district-specific seed
            district_seed = self.seed_manager.get_district_seed(name.lower().replace(' ', '_'))
            
            district = District(
                id=f"district_{i}",
                name=name,
                x=x,
                y=y,
                width=width,
                height=height,
                population=district_population,
                zone_type=zone_type,
                density=density,
                seed=district_seed
            )
            districts.append(district)
        
        return districts
    
    def _generate_district_name(self, index: int, rng: random.Random) -> str:
        """Generate a district name."""
        prefixes = ['North', 'South', 'East', 'West', 'Central', 'Old', 'New', 'Upper', 'Lower', 'Grand']
        suffixes = ['Heights', 'Hills', 'Valley', 'Park', 'Square', 'Plaza', 'Center', 'District', 'Quarter', 'Gardens']
        
        # Use index to ensure some consistency
        prefix_idx = index % len(prefixes)
        suffix_idx = (index * 3) % len(suffixes)
        
        return f"{prefixes[prefix_idx]} {suffixes[suffix_idx]}"
    
    def _select_weighted_choice(self, choices: Dict[str, float], rng: random.Random) -> str:
        """Select a choice based on weights."""
        total = sum(choices.values())
        rand = rng.uniform(0, total)
        
        cumulative = 0
        for choice, weight in choices.items():
            cumulative += weight
            if rand <= cumulative:
                return choice
        
        return list(choices.keys())[-1]  # Fallback
    
    def _calculate_district_population(self, district_index: int, total_districts: int, 
                                     total_population: int, zone_type: str, rng: random.Random) -> int:
        """Calculate population for a district."""
        # Base population distribution
        base_population = total_population // total_districts
        
        # Add variation based on district type
        type_multipliers = {
            'residential': 1.2,
            'commercial': 0.8,
            'industrial': 0.6,
            'mixed': 1.0
        }
        
        multiplier = type_multipliers.get(zone_type, 1.0)
        variation = rng.uniform(0.7, 1.3)
        
        population = int(base_population * multiplier * variation)
        
        # Ensure minimum population
        return max(1000, population)
    
    def _generate_zones(self, districts: List[District], total_population: int) -> List[Zone]:
        """Generate zones within districts."""
        zones = []
        
        for district in districts:
            # Calculate number of zones for this district
            zone_count = max(1, district.population // 10000)
            
            # Get district-specific RNG
            district_rng = self.seed_manager.generator.get_rng(f"districts.{district.name.lower().replace(' ', '_')}")
            
            for i in range(zone_count):
                # Generate zone within district bounds
                zone_x = district_rng.uniform(district.x, district.x + district.width)
                zone_y = district_rng.uniform(district.y, district.y + district.height)
                zone_width = district_rng.uniform(0.2, district.width * 0.8)
                zone_height = district_rng.uniform(0.2, district.height * 0.8)
                
                # Ensure zone fits within district
                zone_x = min(zone_x, district.x + district.width - zone_width)
                zone_y = min(zone_y, district.y + district.height - zone_height)
                
                # Zone type (can be different from district type)
                zone_types = ['residential', 'commercial', 'industrial', 'mixed', 'park', 'service']
                zone_type = district_rng.choice(zone_types)
                
                # Calculate zone population
                zone_area = zone_width * zone_height
                zone_density = district.density * district_rng.uniform(0.5, 1.5)
                zone_population = int(zone_area * zone_density)
                
                # Get zone-specific seed
                zone_seed = self.seed_manager.get_zone_seed(zone_type, district.name.lower().replace(' ', '_'))
                
                zone = Zone(
                    id=f"zone_{district.id}_{i}",
                    district_id=district.id,
                    zone_type=zone_type,
                    area=zone_area,
                    population=zone_population,
                    density=zone_density,
                    x=zone_x,
                    y=zone_y,
                    width=zone_width,
                    height=zone_height,
                    seed=zone_seed
                )
                zones.append(zone)
        
        return zones
    
    def _generate_infrastructure(self, districts: List[District], city_size: float) -> Dict[str, Any]:
        """Generate city infrastructure."""
        infra_rng = self.seed_manager.generator.get_rng("infrastructure")
        
        # Generate road network
        roads = self._generate_road_network(districts, city_size, infra_rng)
        
        # Generate utilities
        utilities = self._generate_utilities(districts, infra_rng)
        
        # Generate public services
        services = self._generate_public_services(districts, infra_rng)
        
        return {
            'roads': roads,
            'utilities': utilities,
            'services': services
        }
    
    def _generate_road_network(self, districts: List[District], city_size: float, rng: random.Random) -> List[Dict]:
        """Generate road network."""
        roads = []
        
        # Main arterial roads
        arterial_count = max(2, len(districts) // 3)
        for i in range(arterial_count):
            if rng.random() < 0.5:  # Horizontal road
                y = rng.uniform(0, city_size)
                roads.append({
                    'type': 'arterial',
                    'x1': 0, 'y1': y,
                    'x2': city_size, 'y2': y,
                    'width': rng.uniform(20, 40)
                })
            else:  # Vertical road
                x = rng.uniform(0, city_size)
                roads.append({
                    'type': 'arterial',
                    'x1': x, 'y1': 0,
                    'x2': x, 'y2': city_size,
                    'width': rng.uniform(20, 40)
                })
        
        # Local roads connecting districts
        for district in districts:
            local_roads = rng.randint(2, 5)
            for _ in range(local_roads):
                roads.append({
                    'type': 'local',
                    'x1': district.x + rng.uniform(0, district.width),
                    'y1': district.y + rng.uniform(0, district.height),
                    'x2': district.x + rng.uniform(0, district.width),
                    'y2': district.y + rng.uniform(0, district.height),
                    'width': rng.uniform(8, 16)
                })
        
        return roads
    
    def _generate_utilities(self, districts: List[District], rng: random.Random) -> Dict[str, List]:
        """Generate utility infrastructure."""
        utilities = {
            'power_stations': [],
            'water_treatment': [],
            'waste_management': []
        }
        
        # Generate power stations
        power_count = max(1, len(districts) // 4)
        for _ in range(power_count):
            district = rng.choice(districts)
            utilities['power_stations'].append({
                'x': district.x + rng.uniform(0, district.width),
                'y': district.y + rng.uniform(0, district.height),
                'capacity': rng.randint(100, 500)
            })
        
        # Generate water treatment plants
        water_count = max(1, len(districts) // 6)
        for _ in range(water_count):
            district = rng.choice(districts)
            utilities['water_treatment'].append({
                'x': district.x + rng.uniform(0, district.width),
                'y': district.y + rng.uniform(0, district.height),
                'capacity': rng.randint(50, 200)
            })
        
        return utilities
    
    def _generate_public_services(self, districts: List[District], rng: random.Random) -> Dict[str, List]:
        """Generate public services."""
        services = {
            'hospitals': [],
            'schools': [],
            'police_stations': [],
            'fire_stations': []
        }
        
        # Generate hospitals
        hospital_count = max(1, len(districts) // 8)
        for _ in range(hospital_count):
            district = rng.choice(districts)
            services['hospitals'].append({
                'x': district.x + rng.uniform(0, district.width),
                'y': district.y + rng.uniform(0, district.height),
                'beds': rng.randint(50, 300)
            })
        
        # Generate schools
        school_count = max(2, len(districts) // 2)
        for _ in range(school_count):
            district = rng.choice(districts)
            services['schools'].append({
                'x': district.x + rng.uniform(0, district.width),
                'y': district.y + rng.uniform(0, district.height),
                'capacity': rng.randint(200, 1000)
            })
        
        return services
    
    def _generate_demographics(self, districts: List[District], population: int) -> Dict[str, Any]:
        """Generate demographic data."""
        demo_rng = self.seed_manager.generator.get_rng("demographics")
        
        # Age distribution
        age_groups = {
            '0-17': 0.22,
            '18-34': 0.25,
            '35-54': 0.28,
            '55-64': 0.15,
            '65+': 0.10
        }
        
        demographics = {
            'age_distribution': {},
            'income_distribution': {},
            'education_levels': {}
        }
        
        for age_group, proportion in age_groups.items():
            demographics['age_distribution'][age_group] = int(population * proportion)
        
        # Income distribution
        income_levels = {
            'low': 0.3,
            'medium': 0.5,
            'high': 0.2
        }
        
        for level, proportion in income_levels.items():
            demographics['income_distribution'][level] = int(population * proportion)
        
        return demographics
    
    def export_city_data(self) -> Dict[str, Any]:
        """Export complete city data for web interface."""
        if not self.city_layout:
            raise ValueError("City must be simulated before exporting")
        
        return {
            'metadata': {
                'generated_at': self.population_model.__dict__.get('generated_at', 'unknown'),
                'master_seed': self.seed_manager.generator.master_seed,
                'population': sum(d.population for d in self.city_layout.districts),
                'area': self.city_layout.total_area,
                'districts': len(self.city_layout.districts),
                'zones': len(self.city_layout.zones)
            },
            'layout': asdict(self.city_layout),
            'population_model': {
                'workforce': self.population_model.workforce(),
                'zones': self.population_model.zones,
                'occupations': self.population_model.occupations,
                'histogram': self.population_model.histogram
            },
            'seed_tree': self.seed_manager.export_seed_tree()
        }


def simulate_city_from_config(config_path: str, target_population: int = None) -> Dict[str, Any]:
    """
    Convenience function to simulate a city from a configuration file.
    
    Args:
        config_path: Path to city configuration JSON file
        target_population: Override population from config
        
    Returns:
        Complete city data dictionary
    """
    with open(config_path, 'r') as f:
        config = json.load(f)
    
    simulator = CitySimulator(config)
    simulator.simulate_city(target_population)
    return simulator.export_city_data()
