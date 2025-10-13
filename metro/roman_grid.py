"""
Roman Grid System for Metro City Generation

This module implements the Roman city planning system with cardo (north-south)
and decumanus (east-west) roads intersecting at 90 degrees, forming the
foundation for all future city development.
"""

import math
from typing import List, Tuple, Dict, Any
from dataclasses import dataclass
from .seed_system import CitySeedManager


@dataclass
class GridPoint:
    """Represents a point in the Roman grid system."""
    x: float
    y: float
    type: str  # 'cardo', 'decumanus', 'intersection', 'block'
    importance: int  # 1-5, where 5 is most important


@dataclass
class CityBlock:
    """Represents a city block in the Roman grid."""
    id: str
    x: float
    y: float
    width: float
    height: float
    zone_type: str
    development_stage: str  # 'founding', 'growth', 'expansion', 'modern'
    population: int
    density: float


class RomanGridSystem:
    """
    Implements the Roman city planning system.
    
    The Roman grid system consists of:
    - Cardo: Main north-south road
    - Decumanus: Main east-west road
    - Intersection: Central point where they meet
    - Blocks: Rectangular areas defined by the grid
    """
    
    def __init__(self, city_size: float, seed_manager: CitySeedManager):
        self.city_size = city_size
        self.seed_manager = seed_manager
        self.grid_points: List[GridPoint] = []
        self.blocks: List[CityBlock] = []
        self.cardos: List[Tuple[float, float, float, float]] = []  # x1, y1, x2, y2
        self.decumani: List[Tuple[float, float, float, float]] = []  # x1, y1, x2, y2
        
    def create_founding_grid(self) -> None:
        """Create the initial Roman grid system for city founding."""
        rng = self.seed_manager.generator.get_rng("roman_grid.founding")
        
        # Calculate grid dimensions
        # Roman cities were typically square or rectangular
        grid_size = min(self.city_size * 0.8, 10.0)  # Max 10km grid
        center_x = self.city_size / 2
        center_y = self.city_size / 2
        
        # Main cardo (north-south road)
        cardo_width = rng.uniform(15, 25)  # 15-25m wide
        cardo_x = center_x
        self.cardos.append((
            cardo_x - cardo_width/2, 0,  # Start at south edge
            cardo_x + cardo_width/2, self.city_size  # End at north edge
        ))
        
        # Main decumanus (east-west road)
        decumanus_width = rng.uniform(15, 25)  # 15-25m wide
        decumanus_y = center_y
        self.decumani.append((
            0, decumanus_y - decumanus_width/2,  # Start at west edge
            self.city_size, decumanus_y + decumanus_width/2  # End at east edge
        ))
        
        # Create intersection point
        self.grid_points.append(GridPoint(
            x=cardo_x, y=decumanus_y, 
            type='intersection', importance=5
        ))
        
        # Create initial city blocks
        self._create_initial_blocks(center_x, center_y, grid_size, rng)
        
    def _create_initial_blocks(self, center_x: float, center_y: float, 
                              grid_size: float, rng) -> None:
        """Create the initial city blocks around the intersection."""
        block_size = rng.uniform(80, 120)  # 80-120m blocks
        
        # Create blocks in each quadrant
        quadrants = [
            (center_x, center_y, 1, 1),      # NE
            (center_x, center_y, -1, 1),     # NW  
            (center_x, center_y, -1, -1),    # SW
            (center_x, center_y, 1, -1)      # SE
        ]
        
        block_id = 0
        for qx, qy, dir_x, dir_y in quadrants:
            # Create 2x2 grid of blocks in each quadrant
            for i in range(2):
                for j in range(2):
                    block_x = qx + (i + 0.5) * dir_x * block_size
                    block_y = qy + (j + 0.5) * dir_y * block_size
                    
                    # Ensure block is within city bounds
                    if (0 < block_x < self.city_size and 
                        0 < block_y < self.city_size):
                        
                        block = CityBlock(
                            id=f"founding_block_{block_id}",
                            x=block_x - block_size/2,
                            y=block_y - block_size/2,
                            width=block_size,
                            height=block_size,
                            zone_type="mixed_use",
                            development_stage="founding",
                            population=rng.randint(50, 150),
                            density=rng.uniform(0.5, 1.0)
                        )
                        self.blocks.append(block)
                        block_id += 1
                        
    def expand_grid(self, stage: str, population: int) -> None:
        """Expand the grid system as the city grows."""
        rng = self.seed_manager.generator.get_rng(f"roman_grid.{stage}")
        
        if stage == "growth":
            self._add_secondary_roads(rng)
        elif stage == "expansion":
            self._add_diagonal_roads(rng)
        elif stage == "modern":
            self._add_modern_road_network(rng)
            
        # Create new blocks for expanded areas
        self._create_new_blocks(stage, population, rng)
        
    def _add_secondary_roads(self, rng) -> None:
        """Add secondary cardos and decumani."""
        # Add 2-3 secondary cardos
        num_cardos = rng.randint(2, 3)
        for i in range(num_cardos):
            x = rng.uniform(self.city_size * 0.2, self.city_size * 0.8)
            width = rng.uniform(8, 15)
            self.cardos.append((
                x - width/2, 0,
                x + width/2, self.city_size
            ))
            
        # Add 2-3 secondary decumani
        num_decumani = rng.randint(2, 3)
        for i in range(num_decumani):
            y = rng.uniform(self.city_size * 0.2, self.city_size * 0.8)
            width = rng.uniform(8, 15)
            self.decumani.append((
                0, y - width/2,
                self.city_size, y + width/2
            ))
            
    def _add_diagonal_roads(self, rng) -> None:
        """Add diagonal roads connecting key points."""
        # Add 1-2 diagonal roads for fast travel
        num_diagonals = rng.randint(1, 2)
        for i in range(num_diagonals):
            # Diagonal from corner to corner or key points
            if rng.random() < 0.5:
                # NE to SW diagonal
                self.cardos.append((
                    self.city_size * 0.1, self.city_size * 0.9,
                    self.city_size * 0.9, self.city_size * 0.1
                ))
            else:
                # NW to SE diagonal
                self.cardos.append((
                    self.city_size * 0.1, self.city_size * 0.1,
                    self.city_size * 0.9, self.city_size * 0.9
                ))
                
    def _add_modern_road_network(self, rng) -> None:
        """Add modern road network with complex patterns."""
        # Add ring roads
        ring_radius = self.city_size * 0.3
        center_x = self.city_size / 2
        center_y = self.city_size / 2
        
        # Inner ring road
        self._add_ring_road(center_x, center_y, ring_radius, rng)
        
        # Outer ring road
        outer_radius = self.city_size * 0.7
        self._add_ring_road(center_x, center_y, outer_radius, rng)
        
    def _add_ring_road(self, center_x: float, center_y: float, 
                      radius: float, rng) -> None:
        """Add a ring road around the city center."""
        # Create circular road segments
        num_segments = rng.randint(8, 12)
        for i in range(num_segments):
            angle1 = (i * 2 * math.pi) / num_segments
            angle2 = ((i + 1) * 2 * math.pi) / num_segments
            
            x1 = center_x + radius * math.cos(angle1)
            y1 = center_y + radius * math.sin(angle1)
            x2 = center_x + radius * math.cos(angle2)
            y2 = center_y + radius * math.sin(angle2)
            
            width = rng.uniform(10, 20)
            self.cardos.append((x1, y1, x2, y2))
            
    def _create_new_blocks(self, stage: str, population: int, rng) -> None:
        """Create new city blocks for the current development stage."""
        # Calculate how many new blocks needed
        blocks_per_stage = {
            "growth": 8,
            "expansion": 16,
            "modern": 32
        }
        
        num_blocks = blocks_per_stage.get(stage, 8)
        block_size = rng.uniform(60, 100)
        
        for i in range(num_blocks):
            # Find empty space for new block
            attempts = 0
            while attempts < 50:
                x = rng.uniform(0, self.city_size - block_size)
                y = rng.uniform(0, self.city_size - block_size)
                
                # Check if space is available
                if self._is_space_available(x, y, block_size, block_size):
                    # Determine zone type based on stage and location
                    zone_type = self._determine_zone_type(x, y, stage, rng)
                    
                    block = CityBlock(
                        id=f"{stage}_block_{len(self.blocks)}",
                        x=x, y=y,
                        width=block_size, height=block_size,
                        zone_type=zone_type,
                        development_stage=stage,
                        population=rng.randint(20, 200),
                        density=rng.uniform(0.3, 1.5)
                    )
                    self.blocks.append(block)
                    break
                attempts += 1
                
    def _is_space_available(self, x: float, y: float, 
                          width: float, height: float) -> bool:
        """Check if space is available for a new block."""
        for block in self.blocks:
            if (x < block.x + block.width and x + width > block.x and
                y < block.y + block.height and y + height > block.y):
                return False
        return True
        
    def _determine_zone_type(self, x: float, y: float, 
                            stage: str, rng) -> str:
        """Determine zone type based on location and development stage."""
        center_x = self.city_size / 2
        center_y = self.city_size / 2
        
        # Distance from center
        distance = math.sqrt((x - center_x)**2 + (y - center_y)**2)
        max_distance = self.city_size / 2
        
        # Zone probabilities based on distance and stage
        if distance < max_distance * 0.3:  # Inner city
            if stage == "founding":
                return "mixed_use"
            else:
                return rng.choices(
                    ["commercial", "residential", "mixed_use"],
                    weights=[0.4, 0.3, 0.3]
                )[0]
        elif distance < max_distance * 0.6:  # Mid city
            return rng.choices(
                ["residential", "commercial", "mixed_use"],
                weights=[0.5, 0.3, 0.2]
            )[0]
        else:  # Outer city
            return rng.choices(
                ["residential", "industrial", "park"],
                weights=[0.6, 0.3, 0.1]
            )[0]
            
    def get_roads(self) -> Dict[str, List]:
        """Get all roads organized by type."""
        return {
            "cardos": self.cardos,
            "decumani": self.decumani,
            "diagonals": [road for road in self.cardos if len(road) == 4],
            "rings": []  # TODO: Implement ring roads
        }
        
    def get_blocks(self) -> List[CityBlock]:
        """Get all city blocks."""
        return self.blocks
        
    def get_intersection_points(self) -> List[GridPoint]:
        """Get all intersection points."""
        return [p for p in self.grid_points if p.type == "intersection"]
