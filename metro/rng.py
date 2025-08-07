import random
from typing import Optional

class HierarchicalRNG:
    """
    A hierarchical random number generator that can create child RNGs.

    This class is designed to provide a reproducible source of randomness for
    simulations. By creating child RNGs for different parts of the model, you can
    ensure that changes in one part of the simulation do not affect the random
    outcomes in another, as long as the overall structure of the RNG tree is
    the same.
    """

    def __init__(self, seed: Optional[int] = None):
        """
        Initializes a new instance of the HierarchicalRNG class.

        Args:
            seed: The seed to use for the random number generator. If None, a
                  random seed will be used.
        """
        self._rng = random.Random(seed)

    def get_child(self, name: str) -> 'HierarchicalRNG':
        """
        Creates a new child RNG with a deterministic seed from this RNG.

        The seed for the child is generated from the parent's random stream,
        ensuring that each child has a unique and reproducible sequence of
        random numbers.

        Args:
            name: The name of the child RNG. This is used to ensure that the
                  same child always gets the same seed, but it is not
                  functionally used to seed the child. The name is for
                  the caller's reference.

        Returns:
            A new HierarchicalRNG instance.
        """
        # Generate a new 32-bit integer seed from the parent's RNG.
        new_seed = self._rng.getrandbits(32)
        return HierarchicalRNG(new_seed)

    def __getattr__(self, name: str):
        """
        Delegates attribute access to the underlying random.Random instance.

        This allows you to use all the methods of the standard `random.Random`
        class directly on an instance of HierarchicalRNG (e.g., `rng.randint(0, 10)`).
        """
        return getattr(self._rng, name)
