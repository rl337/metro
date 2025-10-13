"""
Temporal City Simulator for Metro

This module implements time-based city evolution, starting from the founding
and progressing through different development stages with realistic urban
growth patterns.
"""

import math
import random
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta

from .roman_grid import RomanGridSystem, CityBlock
from .seed_system import CitySeedManager
from .city_simulator import CitySimulator


@dataclass
class CityEra:
    """Represents a specific era in city development."""
    name: str
    start_year: int
    end_year: int
    population_range: tuple
    development_stage: str
    key_features: List[str]


@dataclass
class KeyPoint:
    """Represents a key point in the city (monument, landmark, etc.)."""
    id: str
    name: str
    x: float
    y: float
    type: str  # 'monument', 'government', 'market', 'religious', 'transport'
    importance: int  # 1-5
    built_year: int
    description: str


@dataclass
class TemporalCityState:
    """Represents the city at a specific point in time."""
    year: int
    population: int
    area: float
    blocks: List[CityBlock]
    key_points: List[KeyPoint]
    roads: Dict[str, List]
    zones: Dict[str, Any]
    development_stage: str


class TemporalCitySimulator:
    """
    Simulates city evolution over time with realistic development patterns.
    
    The simulation progresses through distinct eras:
    1. Founding (0-50 years): Roman grid, mixed-use core
    2. Growth (50-200 years): First zone differentiation
    3. Expansion (200-500 years): Diagonal roads, key monuments
    4. Modernization (500+ years): Specialized zones, complex infrastructure
    """
    
    def __init__(self, city_config: Dict[str, Any]):
        self.config = city_config
        self.seed_manager = CitySeedManager(city_config.get('seed', 0))
        self.city_size = city_config.get('city_size', 10.0)
        
        # Define city development eras
        self.eras = [
            CityEra("Founding", 0, 50, (100, 1000), "founding", 
                   ["Roman grid", "Mixed-use core", "Basic infrastructure"]),
            CityEra("Growth", 50, 200, (1000, 10000), "growth",
                   ["Zone differentiation", "Secondary roads", "First monuments"]),
            CityEra("Expansion", 200, 500, (10000, 50000), "expansion",
                   ["Diagonal roads", "Key monuments", "Specialized zones"]),
            CityEra("Modernization", 500, 2000, (50000, 1000000), "modern",
                   ["Complex infrastructure", "Modern zones", "Transportation hubs"])
        ]
        
        self.roman_grid = RomanGridSystem(self.city_size, self.seed_manager)
        self.key_points: List[KeyPoint] = []
        self.temporal_states: List[TemporalCityState] = []
        
    def simulate_city_evolution(self, target_population: int = None, 
                              end_year: int = None) -> List[TemporalCityState]:
        """
        Simulate the complete evolution of the city over time.
        
        Args:
            target_population: Target final population
            end_year: Year to end simulation (defaults to reaching target population)
            
        Returns:
            List of city states at different time points
        """
        if target_population is None:
            target_population = self.config.get('population', 100000)
            
        if end_year is None:
            end_year = self._calculate_end_year(target_population)
            
        # Start with founding
        self._simulate_founding()
        
        # Progress through each era
        current_year = 0
        current_population = 100  # Starting population
        
        for era in self.eras:
            if current_year >= end_year:
                break
                
            era_end_year = min(era.end_year, end_year)
            self._simulate_era(era, current_year, era_end_year, 
                             current_population, target_population)
            
            current_year = era_end_year
            current_population = self._calculate_era_population(
                era, current_year, target_population
            )
            
        return self.temporal_states
        
    def _calculate_end_year(self, target_population: int) -> int:
        """Calculate the year when target population will be reached."""
        # Simple exponential growth model
        if target_population <= 1000:
            return 100
        elif target_population <= 10000:
            return 300
        elif target_population <= 100000:
            return 800
        else:
            return 1500
            
    def _simulate_founding(self) -> None:
        """Simulate the founding of the city."""
        rng = self.seed_manager.generator.get_rng("temporal.founding")
        
        # Create Roman grid system
        self.roman_grid.create_founding_grid()
        
        # Create founding key points
        center_x = self.city_size / 2
        center_y = self.city_size / 2
        
        # Central forum/market
        self.key_points.append(KeyPoint(
            id="central_forum",
            name="Central Forum",
            x=center_x, y=center_y,
            type="market",
            importance=5,
            built_year=0,
            description="The heart of the city, where all major roads meet"
        ))
        
        # First temple/government building
        temple_x = center_x + rng.uniform(-200, 200)
        temple_y = center_y + rng.uniform(-200, 200)
        self.key_points.append(KeyPoint(
            id="first_temple",
            name="Temple of the City Gods",
            x=temple_x, y=temple_y,
            type="religious",
            importance=4,
            built_year=5,
            description="The first major religious structure"
        ))
        
        # Create initial city state
        state = TemporalCityState(
            year=0,
            population=100,
            area=self.city_size * self.city_size * 0.1,  # 10% of city area
            blocks=self.roman_grid.get_blocks(),
            key_points=self.key_points.copy(),
            roads=self.roman_grid.get_roads(),
            zones=self._calculate_zones(self.roman_grid.get_blocks()),
            development_stage="founding"
        )
        self.temporal_states.append(state)
        
    def _simulate_era(self, era: CityEra, start_year: int, end_year: int,
                     start_population: int, target_population: int) -> None:
        """Simulate a specific era of city development."""
        rng = self.seed_manager.generator.get_rng(f"temporal.{era.development_stage}")
        
        # Calculate population growth over era
        era_population_growth = self._calculate_era_population(
            era, end_year, target_population
        ) - start_population
        
        # Create timeline points within era
        timeline_points = self._create_timeline_points(start_year, end_year, 5)
        
        for i, year in enumerate(timeline_points):
            # Calculate population at this year
            progress = i / (len(timeline_points) - 1) if len(timeline_points) > 1 else 0
            population = int(start_population + era_population_growth * progress)
            
            # Expand city based on population
            self._expand_city_for_population(population, era.development_stage, rng)
            
            # Add key points for this era
            self._add_era_key_points(era, year, rng)
            
            # Create city state
            state = TemporalCityState(
                year=year,
                population=population,
                area=self._calculate_city_area(population),
                blocks=self.roman_grid.get_blocks(),
                key_points=self.key_points.copy(),
                roads=self.roman_grid.get_roads(),
                zones=self._calculate_zones(self.roman_grid.get_blocks()),
                development_stage=era.development_stage
            )
            self.temporal_states.append(state)
            
    def _create_timeline_points(self, start_year: int, end_year: int, 
                               num_points: int) -> List[int]:
        """Create timeline points within an era."""
        if num_points <= 1:
            return [start_year]
            
        points = []
        for i in range(num_points):
            year = start_year + int((end_year - start_year) * i / (num_points - 1))
            points.append(year)
        return points
        
    def _calculate_era_population(self, era: CityEra, year: int, 
                                 target_population: int) -> int:
        """Calculate population for a specific year within an era."""
        era_progress = (year - era.start_year) / (era.end_year - era.start_year)
        era_progress = max(0, min(1, era_progress))
        
        # Exponential growth within era
        min_pop, max_pop = era.population_range
        era_population = min_pop + (max_pop - min_pop) * (era_progress ** 2)
        
        # Cap at target population
        return min(int(era_population), target_population)
        
    def _expand_city_for_population(self, population: int, stage: str, rng) -> None:
        """Expand city infrastructure based on population needs."""
        # Expand Roman grid
        self.roman_grid.expand_grid(stage, population)
        
        # Add new blocks if needed
        current_blocks = len(self.roman_grid.get_blocks())
        target_blocks = max(4, population // 1000)  # ~1000 people per block
        
        if current_blocks < target_blocks:
            # Add more blocks
            for _ in range(target_blocks - current_blocks):
                self._add_new_block(stage, rng)
                
    def _add_new_block(self, stage: str, rng) -> None:
        """Add a new city block."""
        # Find suitable location
        attempts = 0
        while attempts < 100:
            x = rng.uniform(0, self.city_size - 100)
            y = rng.uniform(0, self.city_size - 100)
            width = rng.uniform(60, 120)
            height = rng.uniform(60, 120)
            
            if self.roman_grid._is_space_available(x, y, width, height):
                zone_type = self.roman_grid._determine_zone_type(x, y, stage, rng)
                
                block = CityBlock(
                    id=f"{stage}_block_{len(self.roman_grid.blocks)}",
                    x=x, y=y, width=width, height=height,
                    zone_type=zone_type,
                    development_stage=stage,
                    population=rng.randint(20, 300),
                    density=rng.uniform(0.2, 2.0)
                )
                self.roman_grid.blocks.append(block)
                break
            attempts += 1
            
    def _add_era_key_points(self, era: CityEra, year: int, rng) -> None:
        """Add key points specific to this era."""
        if era.development_stage == "growth":
            self._add_growth_key_points(year, rng)
        elif era.development_stage == "expansion":
            self._add_expansion_key_points(year, rng)
        elif era.development_stage == "modern":
            self._add_modern_key_points(year, rng)
            
    def _add_growth_key_points(self, year: int, rng) -> None:
        """Add key points for the growth era."""
        if rng.random() < 0.3:  # 30% chance per year
            # Add a monument
            x = rng.uniform(self.city_size * 0.2, self.city_size * 0.8)
            y = rng.uniform(self.city_size * 0.2, self.city_size * 0.8)
            
            monuments = [
                ("Victory Column", "monument", "A column celebrating military victories"),
                ("Market Square", "market", "A bustling marketplace for goods"),
                ("City Hall", "government", "The seat of local government")
            ]
            
            name, point_type, description = rng.choice(monuments)
            
            self.key_points.append(KeyPoint(
                id=f"growth_{len(self.key_points)}",
                name=name,
                x=x, y=y,
                type=point_type,
                importance=rng.randint(2, 4),
                built_year=year,
                description=description
            ))
            
    def _add_expansion_key_points(self, year: int, rng) -> None:
        """Add key points for the expansion era."""
        if rng.random() < 0.4:  # 40% chance per year
            x = rng.uniform(self.city_size * 0.1, self.city_size * 0.9)
            y = rng.uniform(self.city_size * 0.1, self.city_size * 0.9)
            
            landmarks = [
                ("Grand Cathedral", "religious", "A magnificent religious structure"),
                ("Royal Palace", "government", "The residence of the ruling family"),
                ("Great Library", "government", "A center of learning and knowledge"),
                ("Central Station", "transport", "The main transportation hub"),
                ("Victory Arch", "monument", "A triumphal arch celebrating achievements")
            ]
            
            name, point_type, description = rng.choice(landmarks)
            
            self.key_points.append(KeyPoint(
                id=f"expansion_{len(self.key_points)}",
                name=name,
                x=x, y=y,
                type=point_type,
                importance=rng.randint(3, 5),
                built_year=year,
                description=description
            ))
            
    def _add_modern_key_points(self, year: int, rng) -> None:
        """Add key points for the modern era."""
        if rng.random() < 0.5:  # 50% chance per year
            x = rng.uniform(0, self.city_size)
            y = rng.uniform(0, self.city_size)
            
            modern_landmarks = [
                ("Skyscraper District", "commercial", "Modern high-rise buildings"),
                ("University Campus", "government", "A major educational institution"),
                ("Sports Stadium", "monument", "A large sports and entertainment venue"),
                ("Airport", "transport", "The main airport for the city"),
                ("Shopping Mall", "market", "A modern shopping complex"),
                ("Tech Hub", "commercial", "A center for technology companies")
            ]
            
            name, point_type, description = rng.choice(modern_landmarks)
            
            self.key_points.append(KeyPoint(
                id=f"modern_{len(self.key_points)}",
                name=name,
                x=x, y=y,
                type=point_type,
                importance=rng.randint(2, 4),
                built_year=year,
                description=description
            ))
            
    def _calculate_city_area(self, population: int) -> float:
        """Calculate the area of the city based on population."""
        # Base density of 5000 people per km²
        base_density = 5000
        area = population / base_density
        
        # Add some variation
        variation = random.uniform(0.8, 1.2)
        return area * variation
        
    def _calculate_zones(self, blocks: List[CityBlock]) -> Dict[str, Any]:
        """Calculate zone statistics from blocks."""
        zones = {
            "residential": {"count": 0, "area": 0, "population": 0},
            "commercial": {"count": 0, "area": 0, "population": 0},
            "industrial": {"count": 0, "area": 0, "population": 0},
            "mixed_use": {"count": 0, "area": 0, "population": 0},
            "park": {"count": 0, "area": 0, "population": 0}
        }
        
        for block in blocks:
            zone_type = block.zone_type
            if zone_type in zones:
                zones[zone_type]["count"] += 1
                zones[zone_type]["area"] += block.width * block.height
                zones[zone_type]["population"] += block.population
                
        return zones
        
    def get_city_at_year(self, year: int) -> Optional[TemporalCityState]:
        """Get the city state at a specific year."""
        for state in self.temporal_states:
            if state.year == year:
                return state
                
        # If exact year not found, find closest
        if not self.temporal_states:
            return None
            
        closest_state = min(self.temporal_states, 
                          key=lambda s: abs(s.year - year))
        return closest_state
        
    def export_temporal_data(self) -> Dict[str, Any]:
        """Export complete temporal city data for web interface."""
        return {
            "eras": [asdict(era) for era in self.eras],
            "timeline": [asdict(state) for state in self.temporal_states],
            "key_points": [asdict(point) for point in self.key_points],
            "roman_grid": {
                "cardos": self.roman_grid.cardos,
                "decumani": self.roman_grid.decumani,
                "blocks": [asdict(block) for block in self.roman_grid.blocks]
            },
            "metadata": {
                "city_size": self.city_size,
                "master_seed": self.seed_manager.generator.master_seed,
                "total_years": max(state.year for state in self.temporal_states) if self.temporal_states else 0
            }
        }
