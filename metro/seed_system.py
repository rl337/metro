"""
Hierarchical Seed System for Metro City Generation

This module provides a deterministic random seed system that allows for
reproducible city generation while maintaining the ability to vary specific
aspects of the city by changing only the relevant seed branches.

The system works like a tree:
- Master seed (root) determines overall city characteristics
- Branch seeds determine major city sections (districts, zones, etc.)
- Leaf seeds determine specific features within those sections

This allows for:
- Complete reproducibility when using the same master seed
- Selective variation by changing only specific branch seeds
- Efficient caching of generated content
"""

import hashlib
import random
from typing import Dict, Any, Optional, List
from dataclasses import dataclass


@dataclass
class SeedNode:
    """Represents a node in the hierarchical seed tree."""

    name: str
    seed: int
    parent: Optional["SeedNode"] = None
    children: Dict[str, "SeedNode"] = None

    def __post_init__(self):
        if self.children is None:
            self.children = {}


class HierarchicalSeedGenerator:
    """
    A hierarchical seed generator that creates deterministic random seeds
    for reproducible city generation.

    The system creates a tree of seeds where:
    - The master seed determines the overall city
    - Branch seeds determine major sections (districts, zones, etc.)
    - Leaf seeds determine specific features within sections
    """

    def __init__(self, master_seed: int = 0):
        self.master_seed = master_seed
        self.root = SeedNode("master", master_seed)
        self._seed_cache: Dict[str, int] = {}
        self._rng_cache: Dict[str, random.Random] = {}

    def set_master_seed(self, seed: int) -> None:
        """Set the master seed and clear all caches."""
        self.master_seed = seed
        self.root = SeedNode("master", seed)
        self._seed_cache.clear()
        self._rng_cache.clear()

    def get_seed(self, path: str) -> int:
        """
        Get a deterministic seed for the given path.

        Args:
            path: Dot-separated path (e.g., "districts.north.residential")

        Returns:
            Deterministic seed for the given path
        """
        if path in self._seed_cache:
            return self._seed_cache[path]

        # Generate seed by hashing the master seed with the path
        seed = self._generate_seed_for_path(path)
        self._seed_cache[path] = seed
        return seed

    def get_rng(self, path: str) -> random.Random:
        """
        Get a random number generator for the given path.

        Args:
            path: Dot-separated path (e.g., "districts.north.residential")

        Returns:
            Seeded random number generator
        """
        if path in self._rng_cache:
            return self._rng_cache[path]

        seed = self.get_seed(path)
        rng = random.Random(seed)
        self._rng_cache[path] = rng
        return rng

    def _generate_seed_for_path(self, path: str) -> int:
        """Generate a deterministic seed for the given path."""
        # Create a hash of the master seed and path
        combined = f"{self.master_seed}:{path}"
        hash_obj = hashlib.md5(combined.encode())
        # Convert first 8 bytes to integer
        return int.from_bytes(hash_obj.digest()[:8], byteorder="big") % (2**32)

    def get_branch_seeds(self, parent_path: str) -> Dict[str, int]:
        """
        Get all direct child seeds for a given parent path.

        Args:
            parent_path: Parent path (e.g., "districts")

        Returns:
            Dictionary mapping child names to their seeds
        """
        # For now, we'll generate a fixed set of common branches
        # In a more sophisticated implementation, this could be dynamic
        common_branches = {
            "districts": ["north", "south", "east", "west", "central"],
            "zones": ["commercial", "residential", "industrial", "mixed"],
            "infrastructure": ["roads", "utilities", "parks", "services"],
            "demographics": ["age_groups", "occupations", "income_levels"],
        }

        if parent_path in common_branches:
            return {
                branch: self.get_seed(f"{parent_path}.{branch}")
                for branch in common_branches[parent_path]
            }

        # For unknown parent paths, generate a few default branches
        return {
            "primary": self.get_seed(f"{parent_path}.primary"),
            "secondary": self.get_seed(f"{parent_path}.secondary"),
            "tertiary": self.get_seed(f"{parent_path}.tertiary"),
        }

    def create_variation(self, base_path: str, variation_name: str) -> int:
        """
        Create a variation of a base seed by adding a variation modifier.

        Args:
            base_path: Base path to vary
            variation_name: Name of the variation

        Returns:
            New seed for the variation
        """
        base_seed = self.get_seed(base_path)
        variation_seed = self.get_seed(f"{base_path}.variations.{variation_name}")
        # Combine base and variation seeds
        return (base_seed + variation_seed) % (2**32)

    def get_city_metadata(self) -> Dict[str, Any]:
        """Get metadata about the seed system for debugging/display."""
        return {
            "master_seed": self.master_seed,
            "cached_seeds": len(self._seed_cache),
            "cached_rngs": len(self._rng_cache),
            "available_branches": list(self._seed_cache.keys()),
        }


class CitySeedManager:
    """
    High-level manager for city generation seeds.

    This class provides convenient methods for getting seeds for
    different aspects of city generation.
    """

    def __init__(self, master_seed: int = 0):
        self.generator = HierarchicalSeedGenerator(master_seed)

    def get_district_seed(self, district_name: str) -> int:
        """Get seed for a specific district."""
        return self.generator.get_seed(f"districts.{district_name}")

    def get_zone_seed(self, zone_type: str, district: str = None) -> int:
        """Get seed for a specific zone type, optionally within a district."""
        if district:
            return self.generator.get_seed(f"districts.{district}.zones.{zone_type}")
        return self.generator.get_seed(f"zones.{zone_type}")

    def get_infrastructure_seed(self, infra_type: str, location: str = None) -> int:
        """Get seed for infrastructure generation."""
        if location:
            return self.generator.get_seed(f"infrastructure.{infra_type}.{location}")
        return self.generator.get_seed(f"infrastructure.{infra_type}")

    def get_demographic_seed(self, demo_type: str, area: str = None) -> int:
        """Get seed for demographic generation."""
        if area:
            return self.generator.get_seed(f"demographics.{demo_type}.{area}")
        return self.generator.get_seed(f"demographics.{demo_type}")

    def get_population_seed(self, target_population: int) -> int:
        """Get seed for population generation based on target size."""
        # Use population size to create different seeds for different scales
        pop_tier = self._get_population_tier(target_population)
        return self.generator.get_seed(f"population.tier_{pop_tier}")

    def _get_population_tier(self, population: int) -> str:
        """Determine population tier for seed generation."""
        if population < 10000:
            return "small"
        elif population < 100000:
            return "medium"
        elif population < 500000:
            return "large"
        elif population < 1000000:
            return "metropolitan"
        else:
            return "megalopolis"

    def create_city_variation(
        self, variation_type: str, variation_value: str
    ) -> "CitySeedManager":
        """
        Create a new CitySeedManager with a variation of the current seed.

        Args:
            variation_type: Type of variation (e.g., "density", "layout")
            variation_value: Specific variation value (e.g., "high", "grid")

        Returns:
            New CitySeedManager with modified master seed
        """
        variation_seed = self.generator.create_variation(
            "master", f"{variation_type}.{variation_value}"
        )
        return CitySeedManager(variation_seed)

    def export_seed_tree(self) -> Dict[str, Any]:
        """Export the current seed tree for debugging or persistence."""
        return {
            "master_seed": self.generator.master_seed,
            "seed_cache": self.generator._seed_cache,
            "metadata": self.generator.get_city_metadata(),
        }


# Utility functions for common seed operations
def create_city_seed_manager(city_config: Dict[str, Any]) -> CitySeedManager:
    """
    Create a CitySeedManager from a city configuration.

    Args:
        city_config: City configuration dictionary (e.g., from city.json)

    Returns:
        CitySeedManager configured for the city
    """
    master_seed = city_config.get("seed", 0)
    return CitySeedManager(master_seed)


def generate_reproducible_city_id(city_config: Dict[str, Any]) -> str:
    """
    Generate a reproducible city ID based on the configuration.

    Args:
        city_config: City configuration dictionary

    Returns:
        Unique city identifier
    """
    # Create a hash of key city parameters
    key_params = {
        "seed": city_config.get("seed", 0),
        "population": city_config.get("population", 0),
        "zones": city_config.get("zones", {}),
        "workforce": city_config.get("workforce", {}),
    }

    # Convert to string and hash
    params_str = str(sorted(key_params.items()))
    city_id = hashlib.md5(params_str.encode()).hexdigest()[:12]

    return f"metro_{city_id}"
