from pydantic import BaseModel, Field
from typing import List
from metro.model import HistogramEntry

class PopulationState(BaseModel):
    """
    Represents the demographic state of a city's population at a moment in time.
    """
    population: int = Field(..., description="The total population of the city.")
    histogram: List[HistogramEntry] = Field(..., description="The age and gender distribution of the population.")
