# OmniTools

Welcome to **OmniTools**, a self-hosted alternative to OnlineTools.com.

This project offers a variety of online tools to help with everyday tasks,
all available for free and open for community contributions. We want it to be complete. Please don't forget to star the
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

OmniTools includes a variety of tools, such as:

1. **Image/Video/Binary tools**

- Image Resizer, Image converter, Video trimmer, video reverser, etc.

2. **Math tools**

- Generate prime numbers, generate perfect numbers etc.

3. **String/List Tools**

- Case converters, shuffle list, text formatters, etc.

4. **Date and Time Tools**

- Date calculators, time zone converters, etc.

5. **Miscellaneous Tools**

- JSON, XML tools, CSV tools etc.

## Self-host/Run

```bash
docker run -d --name omni-tools --restart unless-stopped -p 8080:80 iib0011/omni-tools:latest
```

## Contribute

### Project setup

```bash
git clone https://github.com/iib0011/omni-tools.git
cd omni-tools
npm i
npm run dev
```

### Create a new tool

```bash
npm run script:create:tool my-tool-name folder1/folder2
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

[//]: # (<img src="https://api.star-history.com/svg?repos=iib0011/omni-tools&type=Date">)

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
