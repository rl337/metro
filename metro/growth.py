from abc import ABC, abstractmethod
from metro.rng import HierarchicalRNG
from metro.population_state import PopulationState

class PopulationGrowthModel(ABC):
    """
    Abstract base class for population growth models.
    """
    def __init__(self, state: PopulationState):
        self.state = state

    @abstractmethod
    def run_births(self, rng: HierarchicalRNG):
        """
        Calculates and adds new births to the population state.
        """
        pass

    @abstractmethod
    def run_deaths(self, rng: HierarchicalRNG):
        """
        Calculates and removes deaths from the population state.
        """
        pass

class DefaultPopulationGrowthModel(PopulationGrowthModel):
    """
    A growth model with age-specific fertility and mortality rates.
    """
    # Source: Made up for simulation purposes
    MORTALITY_RATES = [5.0, 0.5, 0.5, 0.7, 1.0, 1.5, 2.0, 3.0, 4.0, 6.0, 9.0, 15.0, 25.0, 40.0, 60.0, 100.0, 150.0, 220.0, 300.0, 500.0]
    # Source: Made up for simulation purposes
    FERTILITY_RATES = [50.0, 90.0, 120.0, 100.0, 60.0, 20.0, 5.0]
    FERTILITY_AGE_START_INDEX = 3  # 15-19
    FERTILITY_AGE_END_INDEX = 9    # 45-49

    def run_deaths(self, year_rng: HierarchicalRNG):
        death_rng = year_rng.get_child("deaths")
        for i, entry in enumerate(self.state.histogram):
            mortality_rate = self.MORTALITY_RATES[i] / 1000.0

            # Male deaths
            expected_deaths_m = entry.m * mortality_rate
            deaths_m = int(expected_deaths_m)
            if death_rng.random() < expected_deaths_m - deaths_m:
                deaths_m += 1

            # Female deaths
            expected_deaths_f = entry.f * mortality_rate
            deaths_f = int(expected_deaths_f)
            if death_rng.random() < expected_deaths_f - deaths_f:
                deaths_f += 1

            entry.m -= deaths_m
            entry.f -= deaths_f
            self.state.population -= (deaths_m + deaths_f)

    def run_births(self, year_rng: HierarchicalRNG):
        birth_rng = year_rng.get_child("births")
        total_births = 0
        for i in range(self.FERTILITY_AGE_START_INDEX, self.FERTILITY_AGE_END_INDEX + 1):
            num_females = self.state.histogram[i].f
            fertility_rate = self.FERTILITY_RATES[i - self.FERTILITY_AGE_START_INDEX] / 1000.0

            expected_births = num_females * fertility_rate
            births = int(expected_births)
            if birth_rng.random() < expected_births - births:
                births += 1
            total_births += births

        new_males = 0
        new_females = 0
        for i in range(total_births):
            # A common approximation for sex ratio at birth is 105 males to 100 females
            if birth_rng.random() < 105.0 / 205.0:
                new_males += 1
            else:
                new_females += 1

        self.state.histogram[0].m += new_males
        self.state.histogram[0].f += new_females
        self.state.population += total_births

class StaticPopulationGrowthModel(PopulationGrowthModel):
    """
    A simple growth model with constant birth and death rates.
    """
    def __init__(self, state: PopulationState, birth_rate: float = 20.0, death_rate: float = 8.0):
        super().__init__(state)
        self.birth_rate = birth_rate # Births per 1000 people per year
        self.death_rate = death_rate # Deaths per 1000 people per year

    def run_births(self, year_rng: HierarchicalRNG):
        birth_rng = year_rng.get_child("births")

        expected_births = self.state.population * (self.birth_rate / 1000.0)
        total_births = int(expected_births)
        if birth_rng.random() < expected_births - total_births:
            total_births += 1

        new_males = 0
        new_females = 0
        for i in range(total_births):
            if birth_rng.random() < 105.0 / 205.0:
                new_males += 1
            else:
                new_females += 1

        self.state.histogram[0].m += new_males
        self.state.histogram[0].f += new_females
        self.state.population += total_births

    def run_deaths(self, year_rng: HierarchicalRNG):
        death_rng = year_rng.get_child("deaths")

        expected_deaths = self.state.population * (self.death_rate / 1000.0)
        total_deaths = int(expected_deaths)
        if death_rng.random() < expected_deaths - total_deaths:
            total_deaths += 1

        # Distribute deaths somewhat realistically across the population
        for i in range(total_deaths):
            # This is a very simple way to distribute deaths. A better model
            # would use age-specific mortality. We are assuming that the overall
            # death rate implies a distribution. For now, we remove people randomly.
            # This is not ideal, as it doesn't skew towards the elderly.
            # A better simple model might be to remove from the oldest buckets first.

            # Find a random person to remove.
            # This is inefficient, but simple to implement.
            person_index = death_rng.randint(0, self.state.population - 1)

            found = False
            for entry in self.state.histogram:
                if person_index < entry.m:
                    entry.m -= 1
                    found = True
                    break
                person_index -= entry.m

                if person_index < entry.f:
                    entry.f -= 1
                    found = True
                    break
                person_index -= entry.f

            if found:
                self.state.population -= 1
