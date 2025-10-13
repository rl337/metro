from pydantic import BaseModel, Field
from typing import List, Dict


class Workforce(BaseModel):
    m: int = Field(..., description="The number of male workers.")
    f: int = Field(..., description="The number of female workers.")
    t: int = Field(..., description="The total number of workers.")


class Zone(BaseModel):
    L: float = Field(..., description="Low density population.")
    M: float = Field(..., description="Medium density population.")
    H: float = Field(..., description="High density population.")


class Occupation(BaseModel):
    m: float = Field(..., description="The number of male workers in this occupation.")
    f: float = Field(
        ..., description="The number of female workers in this occupation."
    )


class HistogramEntry(BaseModel):
    m: int = Field(..., description="The number of males in this age group.")
    f: int = Field(..., description="The number of females in this age group.")


class CityModel(BaseModel):
    """
    Represents the data model for a city.
    """

    population: int = Field(..., description="The total population of the city.")
    seed: int = Field(..., description="The random seed used to generate the city.")
    workforce: Workforce = Field(..., description="The workforce distribution.")
    zones: Dict[str, Zone] = Field(
        ..., description="The population distribution across different zones."
    )
    occupations: Dict[str, Occupation] = Field(
        ..., description="The distribution of occupations."
    )
    histogram: List[HistogramEntry] = Field(
        ..., description="The age and gender distribution of the population."
    )
