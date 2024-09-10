import json

SET_MANUAL = 'manual'
SET_AUTO = 'auto'

class Attribute:
    def __init__(self, type: str = '', name: str = '', set: list[str] = None, value = None, hidden: bool = False, dices: list[str] = None):
        self.type = type
        self.name = name
        self.set = set
        self.value = value
        self.hidden = hidden
        self.dices = dices
    def parse(self):
        attribute_properties = ['type', 'name', 'set', 'value', 'hidden', 'dices']
        ret = {}
        for attribute_property in attribute_properties:
            if getattr(self, attribute_property) is not None:
                ret['_'+attribute_property] = getattr(self, attribute_property)
        return ret

class AttributeTree:
    def __init__(self, **attributes: Attribute):
        self.attributes = attributes
    def parse(self):
        return {key: self.attributes[key].parse() for key in self.attributes}

def dump_attribute(attribute: Attribute | AttributeTree):
    return json.dumps(attribute.parse(), indent=2)

if __name__ == '__main__':
    name_attribute = Attribute(type = 'string', name = 'Character\'s name', set = [SET_MANUAL], value = '', hidden = False)
    vietname_attribute = Attribute(type = 'string', name = 'Character\'s vietname', set = [SET_MANUAL], value = '', hidden = True)
    main_attribute_tree = AttributeTree(name=name_attribute, vietname=vietname_attribute)
    print(dump_attribute(main_attribute_tree))