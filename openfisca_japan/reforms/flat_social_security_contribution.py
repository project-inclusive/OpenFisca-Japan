"""
This file defines a reform.

A reform is a set of modifications to be applied to a reference tax and benefit system to carry out experiments.

See https://openfisca.org/doc/key-concepts/reforms.html
"""

# Import from openfisca-core the Python objects used to code the legislation in OpenFisca
from openfisca_core.reforms import Reform
from openfisca_core.variables import Variable


class 社会保険料(Variable):
    # Variable metadata don't need to be redefined. By default, the reference variable metadatas will be used.

    def formula(人物, period, _parameters):
        """
        Social security contribution reform.

        Our reform replaces `社会保険料` (the "reference" variable) by the following variable.
        """
        return 人物("所得", period) * 0.03


class flat_社会保険料(Reform):
    def apply(self):
        """
        Apply reform.

        A reform always defines an `apply` method that builds the reformed tax and benefit system from the reference one.
        See https://openfisca.org/doc/coding-the-legislation/reforms.html#writing-a-reform
        """
        self.update_variable(社会保険料)
