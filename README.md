<p align="center"><img src="src/assets/logo.png" width="150"></p>

[//]: # ([![Docker Pulls]&#40;https://img.shields.io/docker/pulls/iib0011/omni-tools&#41;]&#40;https://hub.docker.com/r/iib0011/omni-tools&#41;)

[//]: # ([![Discord]&#40;https://img.shields.io/discord/1342971141823664179?label=Discord&#41;]&#40;https://discord.gg/SDbbn3hT4b&#41;)

Welcome to OmniTools, a self-hosted web app offering a variety of online tools to simplify everyday tasks.
Whether you are manipulating images, crunching numbers, or
coding, OmniTools has you covered. Please don't forget to star the
repo to support us.
Here is the [demo](https://omnitools.netlify.app/) website.

![img.png](img.png)

## Table of Contents

- [Features](#features)
- [Self-host](#self-hostrun)
- [Contribute](#contribute)
- [License](#license)
- [Contact](#contact)

## Features

We strive to offer a variety of tools, including:

## **Image/Video/Binary Tools**

- Image Resizer
- Image Converter
- Video Trimmer
- Video Reverser
- And more...

## **String/List Tools**

- Case Converters
- List Shuffler
- Text Formatters
- And more...

## **Date and Time Tools**

- Date Calculators
- Time Zone Converters
- And more...

## **Math Tools**

- Generate Prime Numbers
- Generate Perfect Numbers
- And more...

## **Miscellaneous Tools**

- JSON Tools
- XML Tools
- CSV Tools
- And more...

Stay tuned as we continue to expand and improve our collection!

## Self-host/Run

```bash
docker run -d --name omni-tools --restart unless-stopped -p 8080:80 iib0011/omni-tools:latest
```

## Contribute

This is a React Project with Typescript Material UI.

### Project setup

```bash
git clone https://github.com/iib0011/omni-tools.git
cd omni-tools
npm i
npm run dev
```

### Create a new tool

```bash
npm run script:create:tool my-tool-name folder1/folder2 ## examples string/join or image/png/compress
```

Use `folder1\folder2` on Windows

### Run tests

```bash
npm run test
```

- For e2e tests

```bash
npm run test:e2e
```

<img src="https://api.star-history.com/svg?repos=iib0011/omni-tools&type=Date"/>

## 🤝 Looking to contribute?

We welcome contributions! You can help by:

- ✅ Reporting bugs
- ✅ Suggesting new features in Github issues or [here](https://tally.so/r/nrkkx2)
- ✅ Improving documentation
- ✅ Submitting pull requests

You can also join our [Discord server](https://discord.gg/SDbbn3hT4b)

### Contributors

<a href="https://github.com/iib0011/omni-tools/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=iib0011/omni-tools" />
</a>

## Contact

For any questions or suggestions, feel free to open an issue or contact me at:
[ibracool99@gmail.com](mailto:ibracool99@gmail.com)

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
