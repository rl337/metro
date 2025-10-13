import random

# import math
from pathlib import Path


class PopulationModel:
    def __init__(self, r: random.Random, p=100000, occ_file="data/occupations.txt"):
        self.population = p
        self.occupations = {}
        self.zones = {}
        self.histogram = [{"m": 0, "f": 0} for i in range(0, 20)]
        self.random = r

        i = 0
        while i < self.population:
            (gender, pos) = self.distribution()

            scale = 1
            if self.population - i > 500000:
                scale = 1000

            self.histogram[pos - 1][gender] += scale
            i += scale

        wf = self.workforce()

        # Load occupations file relative to this file.
        data_path = Path(__file__).parent / occ_file
        with open(data_path) as fp:
            for line in fp:
                line = line.strip()
                if not line:
                    continue

                parts = line.split("\t")
                if len(parts) < 5:
                    continue

                (name, male, female, zonelist, densitylist) = parts
                males = float(male[0:-1]) * 0.01 * wf["m"]
                females = float(female[0:-1]) * 0.01 * wf["f"]
                humans = males + females
                if name not in self.occupations:
                    self.occupations[name] = {"m": males, "f": females}

                densities = [d for d in densitylist]
                types = [t for t in zonelist]
                for type in types:
                    if type not in self.zones:
                        self.zones[type] = {"L": 0.0, "M": 0.0, "H": 0.0}

                    for density in densities:
                        if density in self.zones[type]:
                            self.zones[type][density] += humans

    def male_distribution(self):
        return int(self.random.normalvariate(4, 7))

    def female_distribution(self):
        return int(self.random.normalvariate(3.5, 8))

    def distribution(self):
        g = self.random.randint(0, 1)

        fnc = self.male_distribution
        gender = "m"
        if g == 0:
            fnc = self.female_distribution
            gender = "f"

        pos = fnc()
        while pos < 1 or pos > len(self.histogram):
            pos = fnc()

        return (gender, pos)

    def workforce(self):
        total = {"m": 0, "f": 0, "t": 0}
        for i in range(3, 12):
            total["m"] += self.histogram[i]["m"]
            total["f"] += self.histogram[i]["f"]
            total["t"] += self.histogram[i]["f"] + self.histogram[i]["m"]

        return total

    def __str__(self):
        histogram = "\n".join(
            "%d-%d\t%d\t%d"
            % (i * 5, i * 5 + 4, self.histogram[i]["m"], self.histogram[i]["f"])
            for i in range(0, len(self.histogram))
        )
        zones = "\n".join(
            "%s\tL:%d\tM:%d\tH:%d"
            % (i, self.zones[i]["L"], self.zones[i]["M"], self.zones[i]["H"])
            for i in self.zones.keys()
        )
        occupations = "\n".join(
            "%s\tm:%d\tf:%d" % (i, self.occupations[i]["m"], self.occupations[i]["f"])
            for i in self.occupations.keys()
        )

        wf = self.workforce()
        workforce = "Male: %d\tFemale: %d\tTotal: %d" % (wf["m"], wf["f"], wf["t"])
        return "%s\n\n%s\n\n%s\n\n%s\n" % (histogram, workforce, zones, occupations)
