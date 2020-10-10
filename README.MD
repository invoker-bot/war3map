**Not finished yet, please wait until version >= 1.0.0.**

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]
[![Language][language-shield]][language-url]
[![Build Status][build-status-shield]][build-status-url]
[![Coverage Status][coverage-status-shield]][coverage-status-url]
<br />
<p align="center">
  <a alt="WAR" href="https://github.com/invokerrrr/war3map">
    <img src="https://invokerrrr.github.io/war3map/img/logo.png" alt="Logo" width="115" height="80">
  </a>
  <h3 align="center">WAR3MAP</h3>
  <p align="center">
    An awesome war3 map translator library for your project!
    <br />
    <a href="https://invokerrrr.github.io/war3map"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/invokerrrr/war3map">View Repository</a>
    ·
    <a href="https://github.com/invokerrrr/war3map/issues">Report Bug</a>
    ·
    <a href="https://github.com/invokerrrr/war3map/issues">Request Feature</a>
  </p>
</p>

## Table of Contents

* [Overview](#Overview)
* [Support](#Support)
    * [Support Files](#support-files)
    * [Object data files](#object-data-files)
    * [Trigger files](#trigger-files)
    * [Map files](#map-files)
    * [Currently Not included](#Currently-Not-included)
* [Getting Started](#getting-started)
    * [Prerequisites](#Prerequisites)
    * [Import](#Import)
    * [Development](#Development)
* [Roadmap](#Roadmap)
* [Contributing](#Contributing)
* [License](#License)
* [Contact](#Contact)
* [Acknowledgements](#Acknowledgements)

## Overview
War3map is a module to convert between a Object representation of WarCraft III (.w3x) data and `war3map` format files.

![TranslationExample](https://invokerrrr.github.io/war3map/img/example.png)

War3map is written in `TypeScript`, offering type safety and improved development experience.

Here's some places where you can use this library:
* You need to decompile a map of Warcraft 3. 
* You want to write a map editor for Warcraft 3.
* You want to optimize or encrypt your Warcraft 3 map.

## Support

### Support Files

| Type | Object → War | War → Object | File |
| --- | :-: | :-: | --- |
| Environment | ![check][ok] | ![check][ok] | war3map.w3e |
| Units  | ![check][error] | ![check][error] | war3mapUnits.doo |
| Doodads | ![check][ok] | ![check][ok] | war3map.doo |
| Regions | ![check][error] | ![check][error] | war3map.w3r |
| Cameras | ![check][ok]  | ![check][ok]  | war3map.w3c |
| Sounds(definitions)| ![check][error] | ![check][error] | war3map.w3s|

### Object data files

| Type  | Object → War | War → Object  | File |
| ---   |   :-----------:  |  :-:   |  ----  |
| Units - Objects | ![check][error] | ![check][error] | war3map.w3u     |
| Items - Objects | ![check][error] | ![check][error] | war3map.w3t     |
| Abilities - Objects | ![check][error] | ![check][error] | war3map.w3a     |
| Destructables - Objects | ![check][error] | ![check][error] | war3map.w3b     |
| Doodads - Objects   | ![check][error] | ![check][error] | war3map.w3d     |
| Upgrades - Objects  | ![check][error] | ![check][error] | war3map.w3q     |
| Buffs - Objects   | ![check][error] | ![check][error] | war3map.w3h     |

### Trigger files

|   Type | Object → War  | War → Object  | File |
|   ---  |   :-:   |   :-:   |   ---    |
| LUA    | ![check][error] | ![check][error] | war3map.lua  |
| JASS   | ![check][error] | ![check][error] | war3map.j    |
| Strings  | ![check][error] | ![check][error] | war3map.wts  |


### Map files

| Type | Object → War  | War → Object  | File   |
|   ---    |    :-: |   :-: |   --- |
| Info File    | ![check][error] | ![check][error] | war3map.w3i  |
| Imported Files  | ![check][error] | ![check][error] | war3map.imp  |
| Pathing      | ![check][error] | ![check][error] | war3map.wpm  |
| Shadow map    | ![check][error] | ![check][error] | war3map.shd |


### Currently Not included
 ![times][error] Custom Text Trigger File (war3map.wct)  
 ![times][error] Trigger Names File (war3map.wtg)  
 ![times][error] Menu Minimap (war3map.mmp)  
 ![times][error] Minimap Image (war3mapMap.blp)  
 ![times][error] Minimap Image (war3mapMap.b00  
 ![times][error] Minimap Image (war3mapMap.tga)  
 ![times][error] Map Preview Image (war3mapPreview.tga)


## Getting Started

### Prerequisites

* [NODEJS](https://nodejs.org/)
**VERSION >= 10** 

### Installation

The easiest and fastest way is to use it as a library. Just simply type the followings:
* npm
```sh
npm install war3map
```

### Import

Create your `.ts` or `.js` file, and type as follows:
```ts
import * as war3map from "war3map";
```

_To get more examples or usages for war3map, see [Documentation](https://invokerrrr.github.io/war3map)._

### Development

To get a local copy up and running follow these simple steps:

1. Clone the repo
```sh
git clone https://github.com/invokerrrr/war3map.git
```
2. Enter the correct directory
```sh
cd war3map
```
3. Install NPM packages
```sh
npm install
```
4. Run All Tests
```
npm test
```

## Roadmap

See the [open issues](https://github.com/invokerrrr/war3map/issues) for a list of proposed features (and known issues).

## Contributing

Contributions are what make the open source community such an amazing place to be learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

**Your code should**:
 * **Run correctly** (Run `npm test` without errors.)
 * **Include tests** (Write unit tests and run `npm run test:coverage` to cover most of your code.)
 * **Be linted** (Run `npm run lint` and follow the project's coding standards.)
 * **Pass travis-ci** (Pass in different environments.)

If your code is accepted into `master`, we will invite you to be a project member as soon.

## License

Distributed under the MIT License. See [LICENSE][license-url] for more information.

## Contact

Invoker Bot - <594404963@qq.com>

Project Link: <https://github.com/invokerrrr/war3map>

## Acknowledgements

* This project refers a lot from [WC3MapTranslator](https://github.com/ChiefOfGxBxL/WC3MapTranslator) written by *ChiefOfGxBxL*. Our goal is same but offers different API, and plan more features.

* We owe a lot of thanks to *Chocobo* on [TheHelper](http://www.thehelper.net/) for the detailed documentation of the files found in a .w3x archive. And another two tutorials are [here (1)](http://www.thehelper.net/threads/guide-explanation-of-w3m-and-w3x-files.35292/) and [here (2)](http://world-editor-tutorials.thehelper.net/cat_usersubmit.php?view=42787) and [here (3)](https://867380699.github.io/blog/2019/05/09/W3X_Files_Format).




[contributors-shield]: https://img.shields.io/github/contributors/invokerrrr/war3map.svg?style=flat-square
[contributors-url]: https://github.com/invokerrrr/war3map/graphs/contributors

[forks-shield]: https://img.shields.io/github/forks/invokerrrr/war3map.svg?style=flat-square
[forks-url]: https://github.com/invokerrrr/war3map/network/members

[stars-shield]: https://img.shields.io/github/stars/invokerrrr/war3map.svg?style=flat-square
[stars-url]: https://github.com/invokerrrr/war3map/stargazers

[issues-shield]: https://img.shields.io/github/issues/invokerrrr/war3map.svg?style=flat-square
[issues-url]: https://github.com/invokerrrr/war3map/issues

[license-shield]: https://img.shields.io/github/license/invokerrrr/war3map.svg?style=flat-square
[license-url]: https://github.com/invokerrrr/war3map/blob/master/LICENSE.md

[build-status-shield]: https://travis-ci.com/invokerrrr/war3map.svg?branch=master
[build-status-url]: https://travis-ci.com/invokerrrr/war3map

[language-shield]: https://img.shields.io/badge/language-typescript-orange.svg
[language-url]: https://www.typescriptlang.org

[coverage-status-shield]: https://coveralls.io/repos/github/invokerrrr/war3map/badge.svg?branch=master
[coverage-status-url]: https://coveralls.io/github/invokerrrr/war3map?branch=master

[ok]: https://invokerrrr.github.io/war3map/img/ok.png
[error]: https://invokerrrr.github.io/war3map/img/error.png