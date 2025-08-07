from pathlib import Path
from metro.rng import HierarchicalRNG
from metro.model import CityModel, Occupation, Zone, HistogramEntry, Workforce
from metro.population_state import PopulationState
from metro.growth import PopulationGrowthModel, DefaultPopulationGrowthModel

class PopulationModel:
    def __init__(self, r: HierarchicalRNG, state: PopulationState, growth_model: PopulationGrowthModel):
        self.random = r
        self.state = state
        self.growth_model = growth_model
        self.occupations: dict[str, dict] = {}
        self.zones: dict[str, dict] = {}

    @classmethod
    def generate_new(cls, r: HierarchicalRNG, p=100000, occ_file='data/occupations.txt') -> 'PopulationModel':
        hist = [{'m': 0, 'f': 0} for i in range(0, 20)]

        # We need a temporary random generator for the initial distribution
        dist_rng = r.get_child("initial_distribution")

        i = 0
        while i < p:
            # This logic needs a temporary PopulationModel-like object or to be moved.
            # For now, we'll perform a simplified distribution directly.
            g = dist_rng.randint(0, 1)
            gender = 'm' if g == 1 else 'f'

            mu = 4 if g == 1 else 3.5
            sigma = 7 if g == 1 else 8

            pos = int(dist_rng.normalvariate(mu, sigma))
            while pos < 1 or pos > len(hist):
                pos = int(dist_rng.normalvariate(mu, sigma))

            scale = 1
            if p - i > 500000:
                scale = 1000

            hist[pos - 1][gender] += scale
            i += scale

        # Create Pydantic models for the state
        histogram_entries = [HistogramEntry(**entry) for entry in hist]
        state = PopulationState(population=p, histogram=histogram_entries)

        growth_model = DefaultPopulationGrowthModel(state)

        model = cls(r, state, growth_model)
        model.update_occupations(r.get_child("initial_occupations"))
        return model

    @classmethod
    def from_city_model(cls, city_model: CityModel, r: HierarchicalRNG) -> 'PopulationModel':
        state = PopulationState(
            population=city_model.population,
            histogram=city_model.histogram,
        )
        growth_model = DefaultPopulationGrowthModel(state)
        model = cls(r, state, growth_model)
        model.occupations = {name: occ.model_dump() for name, occ in city_model.occupations.items()}
        model.zones = {name: zone.model_dump() for name, zone in city_model.zones.items()}
        return model

    def to_city_model_data(self) -> dict:
        return {
            'population': self.state.population,
            'histogram': self.state.histogram,
            'occupations': {name: Occupation(**data) for name, data in self.occupations.items()},
            'zones': {name: Zone(**data) for name, data in self.zones.items()},
            'workforce': Workforce(**self.workforce()),
        }

    def run_yearly_update(self, year_rng: HierarchicalRNG):
        self.age_population(year_rng)
        self.growth_model.run_deaths(year_rng)
        self.growth_model.run_births(year_rng)

    def workforce(self):
        total = {'m': 0, 'f': 0, 't': 0}
        for i in range(3, 12):
            total['m'] += self.state.histogram[i].m
            total['f'] += self.state.histogram[i].f
            total['t'] += (self.state.histogram[i].f + self.state.histogram[i].m)
        return total

    def update_occupations(self, year_rng: HierarchicalRNG, occ_file: str = 'data/occupations.txt'):
        workforce = self.workforce()
        num_children = self.state.histogram[1].m + self.state.histogram[1].f + self.state.histogram[2].m + self.state.histogram[2].f

        self.occupations = {}
        self.zones = {}

        data_path = Path(__file__).parent / occ_file
        with open(data_path) as fp:
            for line in fp:
                line = line.strip()
                if not line:
                    continue

                parts = line.split('\t')
                if len(parts) < 6:
                    continue

                (name, method_str, male_str, female_str, zonelist, densitylist) = parts

                method, *ratio_parts = method_str.split(':')
                ratio = int(ratio_parts[0]) if ratio_parts else 0
                males, females = 0, 0

                if method == 'P':
                    males = float(male_str.strip('%')) * 0.01 * workforce['m']
                    females = float(female_str.strip('%')) * 0.01 * workforce['f']
                else:
                    total_req = 0
                    if method == 'D_CHILD':
                        total_req = num_children / ratio if ratio > 0 else 0
                    elif method == 'D_POP':
                        total_req = self.state.population / ratio if ratio > 0 else 0

                    male_prop = float(male_str)
                    female_prop = float(female_str)
                    total_prop = male_prop + female_prop
                    if total_prop > 0:
                        males = total_req * (male_prop / total_prop)
                        females = total_req * (female_prop / total_prop)

                self.occupations[name] = {'m': males, 'f': females}

                humans = males + females
                densities = [d for d in densitylist]
                types = [t for t in zonelist]
                for type in types:
                    if type not in self.zones:
                        self.zones[type] = {'L': 0.0, 'M': 0.0, 'H': 0.0}

                    for density in densities:
                        if density in self.zones[type]:
                            self.zones[type][density] += humans

    def age_population(self, year_rng: HierarchicalRNG):
        aging_rng = year_rng.get_child("aging")

        males_aging_up = [0] * len(self.state.histogram)
        females_aging_up = [0] * len(self.state.histogram)

        for i, entry in enumerate(self.state.histogram):
            num_males = entry.m
            males_aging_up[i] = num_males // 5
            if aging_rng.random() < (num_males % 5) / 5.0:
                males_aging_up[i] += 1

            num_females = entry.f
            females_aging_up[i] = num_females // 5
            if aging_rng.random() < (num_females % 5) / 5.0:
                females_aging_up[i] += 1

        aged_out_m = males_aging_up[-1]
        aged_out_f = females_aging_up[-1]

        for i in range(len(self.state.histogram) - 1, 0, -1):
            self.state.histogram[i].m = self.state.histogram[i].m - males_aging_up[i] + males_aging_up[i-1]
            self.state.histogram[i].f = self.state.histogram[i].f - females_aging_up[i] + females_aging_up[i-1]

        self.state.histogram[0].m -= males_aging_up[0]
        self.state.histogram[0].f -= females_aging_up[0]

        self.state.population -= (aged_out_m + aged_out_f)

    def __str__(self):
        histogram = '\n'.join("%d-%d\t%d\t%d" % (i * 5, i * 5 + 4, self.state.histogram[i].m, self.state.histogram[i].f) for i in range(0, len(self.state.histogram)))
        zones = '\n'.join("%s\tL:%d\tM:%d\tH:%d" % (i, self.zones[i]['L'], self.zones[i]['M'], self.zones[i]['H']) for i in self.zones.keys())
        occupations = '\n'.join("%s\tm:%d\tf:%d" % (i, self.occupations[i]['m'], self.occupations[i]['f']) for i in self.occupations.keys())

        wf = self.workforce()
        workforce = 'Male: %d\tFemale: %d\tTotal: %d' % (wf['m'], wf['f'], wf['t'])
        return '%s\n\n%s\n\n%s\n\n%s\n' % (histogram, workforce, zones, occupations)
