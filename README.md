# MareCreator
> Engine for creating interactive and automated TRPG character sheets.

by Alexey ["NotLexa"]((https://github.com/NottLexa)) Kozhanov (Алексей Кожанов)

[![GitHub License](https://img.shields.io/github/license/NottLexa/MareCreator)](https://github.com/NottLexa/MareCreator/blob/master/COPYING)

MareCreator consists of three parts:
* Render engine (for now it's only a plain HTML dynamic page for NW.JS)
* MareCreator Formula Parser (MCFP) - JavaScript's module for parsing attribute effects' or formulas' code, turning them
into JS objects that abstractly represent formula's code parts, and (optionally) converting these objects into JS function.
* Template Builder - Python module for building (compiling) MareCreator templates in format of JSON, using MareCreator
attributes written in Python (Python 3.x, preferably >=3.10).

Made for [@arkain123](https://github.com/arkain123) ≽^•⩊•^≼

## How to install

1) Install [NodeJS](https://nodejs.org).
2) Run shell command `npm install` in repository's directory.

## How to run

1) Run shell command `npm run start` in repository's directory.