import json

SET_MANUAL = 'manual'
SET_AUTO = 'auto'

TYPE_STRING = 'string'
TYPE_INTEGER = 'integer'
TYPE_BOOLEAN = 'boolean'

class Attribute:
    def __init__(self, type: str = '', name: str = '', set: list[str] = None, value = None, hidden: bool = False,
                 dices: list[str] = None, variants: list[str] = None, effects: list[str] = None, value_min = None,
                 value_max = None):
        self.type = type
        self.name = name
        self.set = set
        self.value = value
        self.hidden = hidden
        self.dices = dices
        self.variants = variants
        self.effects = effects
        self.value_min = value_min
        self.value_max = value_max
    def add_effect(self, effect_string):
        if self.effects is None:
            self.effects = []
        self.effects.append(effect_string)
    def parse(self):
        attribute_properties = ['type', 'name', 'set', 'value', 'hidden', 'dices', 'variants', 'effects']
        ret = {}
        for attribute_property in attribute_properties:
            if getattr(self, attribute_property) is not None:
                ret['_'+attribute_property] = getattr(self, attribute_property)
        return ret

class AttributeTree:
    def __init__(self, **attributes):
        self.attributes = {key.lstrip('_'): attributes[key] for key in attributes}
    def add(self, **attributes):
        for key in attributes:
            self.attributes[key.lstrip('_')] = attributes[key]
    def parse(self):
        return {key: self.attributes[key].parse() for key in self.attributes}

class TemplateData:
    def __init__(self, name: str = '', version: int = 1, attributes: AttributeTree = None):
        self.name = name
        self.version = version
        self.attributes = attributes
    def parse(self):
        attribute_properties = ['name', 'version', 'attributes']
        ret = {}
        for attribute_property in attribute_properties:
            if getattr(self, attribute_property) is not None:
                if attribute_property == 'attributes':
                    ret[attribute_property] = getattr(self, attribute_property).parse()
                else:
                    ret[attribute_property] = getattr(self, attribute_property)
        return ret

def dump_data(data: Attribute | AttributeTree | TemplateData):
    return json.dumps(data.parse(), indent=2)

if __name__ == '__main__':
    name_attribute = Attribute(type = 'string', name = 'Character\'s name', set = [SET_MANUAL], value = '', hidden = False)
    vietname_attribute = Attribute(type = 'string', name = 'Character\'s vietname', set = [SET_MANUAL], value = '', hidden = True)
    main_attribute_tree = AttributeTree(name=name_attribute, vietname=vietname_attribute)
    print(dump_data(main_attribute_tree))