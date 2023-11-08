"""
This file defines our country's tax and benefit system.

A tax and benefit system is the higher-level instance in OpenFisca.
Its goal is to model the legislation of a country.
Basically a tax and benefit system contains simulation variables (source code) and legislation parameters (data).

See https://openfisca.org/doc/key-concepts/tax_and_benefit_system.html
"""

import os

from openfisca_core.taxbenefitsystems import TaxBenefitSystem
from openfisca_japan import entities
from openfisca_japan.situation_examples import 夫婦

COUNTRY_DIR = os.path.dirname(os.path.abspath(__file__))


# Our country tax and benefit class inherits from the general TaxBenefitSystem class.
# The name CountryTaxBenefitSystem must not be changed, as all tools of the OpenFisca ecosystem expect a CountryTaxBenefitSystem class to be exposed in the __init__ module of a country package.
class CountryTaxBenefitSystem(TaxBenefitSystem):
    def __init__(self):
        # We initialize our tax and benefit system with the general constructor
        super().__init__(entities.entities)

        # We add to our tax and benefit system all the variables
        self.add_variables_from_directory(os.path.join(COUNTRY_DIR, "variables"))

        # We add to our tax and benefit system all the legislation parameters defined in the  parameters files
        param_path = os.path.join(COUNTRY_DIR, "parameters")
        self.load_parameters(param_path)

        # We define which variable, parameter and simulation example will be used in the OpenAPI specification
        self.open_api_config = {
            "variable_example": "所得",
            "parameter_example": "所得.寡婦控除額",
            "simulation_example": 夫婦,
            }
